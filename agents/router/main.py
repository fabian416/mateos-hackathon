#!/usr/bin/env python3
"""
agent-router — Message bus liviano para comunicación inter-agente.

Cada agente del squad puede:
  1. Descubrir qué otros agentes existen y qué saben hacer
  2. Delegar tareas a otro agente via POST /route
  3. Broadcast a todos o filtrado por capability via POST /broadcast
  4. Consultar el log de tareas delegadas via GET /tasks

El router NO usa LLM — es puro routing HTTP. Costo: $0.
Autenticación via SQUAD_AUTH_TOKEN (compartido entre agentes).
"""

import asyncio
import json
import logging
import os
import sys
import uuid
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from pydantic import BaseModel, Field, model_validator

logger = logging.getLogger("agent-router")

SQUAD_AUTH_TOKEN = os.environ.get("SQUAD_AUTH_TOKEN", "")
TASK_LOG_MAX = 500  # max tasks in memory

# ---------------------------------------------------------------------------
# Startup validation
# ---------------------------------------------------------------------------

if not SQUAD_AUTH_TOKEN:
    logger.critical(
        "SQUAD_AUTH_TOKEN is not set. All inter-agent requests will be rejected."
    )
    print(
        "CRITICAL: SQUAD_AUTH_TOKEN is not set. All inter-agent requests will be rejected.",
        file=sys.stderr,
    )

# ---------------------------------------------------------------------------
# Agent Registry — quién es quién en el squad
# ---------------------------------------------------------------------------

AGENTS: dict[str, dict] = {}


def _validate_agent_entry(name: str, entry: dict) -> bool:
    """Validate that an agent registry entry has required fields."""
    if not isinstance(entry, dict):
        print(f"Registry: skipping '{name}' — entry is not a dict", file=sys.stderr)
        return False
    if "host" not in entry or "port" not in entry:
        print(f"Registry: skipping '{name}' — missing 'host' or 'port'", file=sys.stderr)
        return False
    return True


def _is_enabled(name: str) -> bool:
    """Check if an agent is enabled (default True for backward compat)."""
    agent = AGENTS.get(name)
    if not agent:
        return False
    return agent.get("enabled", True)


def _load_registry():
    """Carga el registry desde la variable de entorno o archivo."""
    global AGENTS
    AGENTS.clear()

    registry_path = os.environ.get("AGENT_REGISTRY_FILE", "/app/registry.json")
    try:
        with open(registry_path) as f:
            raw = json.load(f)
        for name, entry in raw.items():
            if _validate_agent_entry(name, entry):
                AGENTS[name] = entry
        print(f"Loaded {len(AGENTS)} agents from {registry_path}")
    except FileNotFoundError:
        print(f"Registry file not found: {registry_path}", file=sys.stderr)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON in {registry_path}: {e}", file=sys.stderr)

    # Override / merge desde env var (JSON)
    env_registry = os.environ.get("AGENT_REGISTRY", "")
    if env_registry:
        try:
            extra = json.loads(env_registry)
            count = 0
            for name, entry in extra.items():
                if _validate_agent_entry(name, entry):
                    AGENTS[name] = entry
                    count += 1
            print(f"Merged {count} agents from AGENT_REGISTRY env var")
        except json.JSONDecodeError as e:
            print(f"Invalid JSON in AGENT_REGISTRY env var: {e}", file=sys.stderr)


_load_registry()

# ---------------------------------------------------------------------------
# Task log — historial de delegaciones (in-memory, rotativo)
# ---------------------------------------------------------------------------

task_log: deque[dict] = deque(maxlen=TASK_LOG_MAX)

# ---------------------------------------------------------------------------
# Lifespan — shared httpx client
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    yield
    await app.state.http_client.aclose()


app = FastAPI(title="MateOS Agent Router", version="1.0.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


def verify_token(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
    if not token or token != SQUAD_AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid squad token")
    return token


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class RouteRequest(BaseModel):
    sender: str = Field(..., description="Nombre del agente que envía")
    target: str = Field(..., description="Nombre del agente destino")
    message: str = Field(..., description="Mensaje/tarea a delegar")
    task_id: str = Field(default="", description="ID de tarea (auto-generado si vacío)")
    priority: Literal["normal", "urgent"] = Field(default="normal", description="normal | urgent")
    context: dict = Field(default_factory=dict, description="Contexto adicional (lead info, etc)")


class BroadcastRequest(BaseModel):
    sender: str
    message: str
    capability: str = Field(default="", description="Filtrar por capability (vacío = todos)")
    task_id: str = ""
    priority: Literal["normal", "urgent"] = "normal"


class TaskUpdateRequest(BaseModel):
    status: str = Field(default="", description="Nuevo estado de la tarea")
    result: str = Field(default="", description="Resultado/resumen de la tarea")

    @model_validator(mode="after")
    def require_at_least_one_field(self):
        if not self.status and not self.result:
            raise ValueError("At least one of 'status' or 'result' must be non-empty")
        return self


class RouteResponse(BaseModel):
    task_id: str
    status: str
    target: str


# ---------------------------------------------------------------------------
# Internal routing logic (used by both /route and /broadcast)
# ---------------------------------------------------------------------------


async def _send_to_agent(
    client: httpx.AsyncClient, req: RouteRequest, task_id: str
) -> dict:
    """Envía un mensaje a un agente y retorna el task entry."""
    agent = AGENTS.get(req.target)
    if not agent:
        return {
            "task_id": task_id,
            "sender": req.sender,
            "target": req.target,
            "message": req.message[:500],
            "priority": req.priority,
            "status": "error",
            "result": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "delivered_at": None,
            "error": f"Agent '{req.target}' not found in registry",
        }

    try:
        host = agent["host"]
        port = agent["port"]
    except KeyError as e:
        return {
            "task_id": task_id,
            "sender": req.sender,
            "target": req.target,
            "message": req.message[:500],
            "priority": req.priority,
            "status": "error",
            "result": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "delivered_at": None,
            "error": f"Malformed registry entry for '{req.target}': missing {e}",
        }

    # Construir mensaje con metadata inter-agente
    inter_agent_msg = (
        f"[INTER-AGENT]\n"
        f"from: {req.sender}\n"
        f"task_id: {task_id}\n"
        f"priority: {req.priority}\n"
        f"---\n"
        f"{req.message}"
    )

    if req.context:
        context_str = json.dumps(req.context, ensure_ascii=False, indent=2)
        inter_agent_msg += f"\n\n[CONTEXT]\n{context_str}"

    task_entry = {
        "task_id": task_id,
        "sender": req.sender,
        "target": req.target,
        "message": req.message[:500],
        "priority": req.priority,
        "status": "sent",
        "result": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "delivered_at": None,
        "error": None,
    }

    gateway_url = f"http://{host}:{port}"
    gateway_token = agent.get("token", SQUAD_AUTH_TOKEN)

    try:
        resp = await client.post(
            f"{gateway_url}/api/call/chat.send",
            json={
                "sessionKey": "agent:main:main",
                "message": inter_agent_msg,
                "idempotencyKey": f"ia-{task_id}",
            },
            headers={"Authorization": f"Bearer {gateway_token}"},
        )

        if resp.status_code == 200:
            task_entry["status"] = "delivered"
            task_entry["delivered_at"] = datetime.now(timezone.utc).isoformat()
        else:
            task_entry["status"] = "error"
            task_entry["error"] = f"HTTP {resp.status_code}: {resp.text[:200]}"

    except httpx.ConnectError:
        task_entry["status"] = "unreachable"
        task_entry["error"] = f"No se pudo conectar a {host}:{port}"
    except httpx.TimeoutException:
        task_entry["status"] = "timeout"
        task_entry["error"] = "Timeout (30s)"
    except Exception as e:
        task_entry["status"] = "error"
        task_entry["error"] = f"{type(e).__name__}: {str(e)[:200]}"

    task_log.append(task_entry)
    return task_entry


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    if not SQUAD_AUTH_TOKEN:
        return {
            "status": "unhealthy",
            "error": "SQUAD_AUTH_TOKEN is not configured",
            "agents": len(AGENTS),
            "tasks_logged": len(task_log),
        }
    enabled = sum(1 for a in AGENTS.values() if a.get("enabled", True))
    disabled = len(AGENTS) - enabled
    return {"status": "ok", "agents": enabled, "agents_disabled": disabled, "agents_total": len(AGENTS), "tasks_logged": len(task_log)}


@app.get("/agents")
async def list_agents(_token: str = Depends(verify_token)):
    """Discovery: qué agentes hay y qué saben hacer."""
    return {
        name: {
            "host": info["host"],
            "port": info["port"],
            "role": info.get("role", ""),
            "capabilities": info.get("capabilities", []),
            "description": info.get("description", ""),
            "enabled": info.get("enabled", True),
        }
        for name, info in AGENTS.items()
    }


@app.post("/route", response_model=RouteResponse)
async def route_message(req: RouteRequest, request: Request, _token: str = Depends(verify_token)):
    """Envía un mensaje de un agente a otro."""
    if req.target not in AGENTS:
        available = [n for n, a in AGENTS.items() if a.get("enabled", True)]
        raise HTTPException(
            status_code=404,
            detail=f"Agente '{req.target}' no encontrado. Disponibles: {available}",
        )

    if not _is_enabled(req.target):
        raise HTTPException(
            status_code=503,
            detail=f"Agente '{req.target}' está registrado pero no habilitado para este negocio. Contactá al operador para activarlo.",
        )

    if req.sender == req.target:
        raise HTTPException(status_code=400, detail="Un agente no puede delegarse a sí mismo")

    task_id = req.task_id or f"task-{uuid.uuid4().hex[:8]}"
    client = request.app.state.http_client
    task_entry = await _send_to_agent(client, req, task_id)

    if task_entry["status"] not in ("delivered", "sent"):
        raise HTTPException(
            status_code=502,
            detail=f"[{task_entry['status']}] {task_entry.get('error', 'Unknown error')}",
        )

    return RouteResponse(task_id=task_id, status=task_entry["status"], target=req.target)


@app.post("/broadcast")
async def broadcast(req: BroadcastRequest, request: Request, _token: str = Depends(verify_token)):
    """Envía un mensaje a todos los agentes (o filtrado por capability) concurrentemente."""
    task_id = req.task_id or f"broadcast-{uuid.uuid4().hex[:8]}"
    client = request.app.state.http_client

    # Armar lista de targets
    targets = []
    for name, info in AGENTS.items():
        if name == req.sender:
            continue
        if not info.get("enabled", True):
            continue
        if req.capability and req.capability not in info.get("capabilities", []):
            continue
        targets.append(name)

    # Fan-out concurrente con asyncio.gather
    async def _route_one(target_name: str):
        sub_task_id = f"{task_id}-{target_name}"
        route_req = RouteRequest(
            sender=req.sender,
            target=target_name,
            message=req.message,
            task_id=sub_task_id,
            priority=req.priority,
        )
        entry = await _send_to_agent(client, route_req, sub_task_id)
        return {"task_id": sub_task_id, "status": entry["status"], "target": target_name}

    results = await asyncio.gather(*[_route_one(t) for t in targets], return_exceptions=True)

    # Convertir excepciones a error entries
    clean_results = []
    for i, r in enumerate(results):
        if isinstance(r, Exception):
            clean_results.append({"task_id": f"{task_id}-{targets[i]}", "status": "error", "target": targets[i], "error": str(r)})
        else:
            clean_results.append(r)

    return {"task_id": task_id, "targets": len(clean_results), "results": clean_results}


@app.get("/tasks")
async def list_tasks(
    sender: str = "",
    target: str = "",
    status: str = "",
    limit: int = Query(default=50, ge=1, le=500),
    _token: str = Depends(verify_token),
):
    """Consulta el historial de tareas delegadas."""
    filtered = list(task_log)
    if sender:
        filtered = [t for t in filtered if t["sender"] == sender]
    if target:
        filtered = [t for t in filtered if t["target"] == target]
    if status:
        filtered = [t for t in filtered if t["status"] == status]
    return filtered[-limit:]


@app.post("/tasks/{task_id}/update")
async def update_task(task_id: str, body: TaskUpdateRequest, _token: str = Depends(verify_token)):
    """Un agente reporta el resultado de una tarea delegada."""
    for task in reversed(task_log):
        if task["task_id"] == task_id:
            if body.status:
                task["status"] = body.status
            if body.result:
                task["result"] = body.result[:2000]
            task["updated_at"] = datetime.now(timezone.utc).isoformat()
            return {"task_id": task_id, "status": task["status"]}

    raise HTTPException(status_code=404, detail=f"Task {task_id} not found")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("ROUTER_PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
