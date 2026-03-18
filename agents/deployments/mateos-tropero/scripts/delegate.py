#!/usr/bin/env python3
"""
delegate.py — CLI para delegación inter-agente via el Agent Router.

Uso desde un agente OpenClaw:
  python3 ~/delegate.py route <target> "<mensaje>" [--task-id ID] [--priority urgent] [--context '{"key":"val"}']
  python3 ~/delegate.py broadcast "<mensaje>" [--capability sales]
  python3 ~/delegate.py agents                     # listar agentes disponibles
  python3 ~/delegate.py tasks [--sender X] [--target Y]  # ver historial
  python3 ~/delegate.py update <task_id> --status completed --result "Reunión agendada para mañana 10am"

Variables de entorno requeridas:
  SQUAD_AUTH_TOKEN — token compartido del squad
  AGENT_NAME      — nombre de este agente (sender)
  ROUTER_URL      — URL del router (default: http://agent-router:8080)
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

ROUTER_URL = os.environ.get("ROUTER_URL", "http://agent-router:8080")
SQUAD_AUTH_TOKEN = os.environ.get("SQUAD_AUTH_TOKEN", "")
AGENT_NAME = os.environ.get("AGENT_NAME", "unknown")


def _request(method, path, data=None):
    """HTTP request al router."""
    url = f"{ROUTER_URL}{path}"
    headers = {
        "Authorization": f"Bearer {SQUAD_AUTH_TOKEN}",
    }

    if data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read().decode()
            if not raw:
                return {}
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        print(f"Error HTTP {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Error de conexión al router ({ROUTER_URL}): {e.reason}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Warning: respuesta del router no es JSON válido. Raw (truncado): {raw[:200]}")
        raise
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_route(args):
    data = {
        "sender": AGENT_NAME,
        "target": args.target,
        "message": args.message,
        "priority": args.priority,
    }
    if args.task_id:
        data["task_id"] = args.task_id
    if args.context:
        try:
            data["context"] = json.loads(args.context)
        except json.JSONDecodeError:
            print("Error: --context debe ser JSON válido", file=sys.stderr)
            sys.exit(1)

    result = _request("POST", "/route", data)
    print(json.dumps(result, indent=2, ensure_ascii=False))


def cmd_broadcast(args):
    data = {
        "sender": AGENT_NAME,
        "message": args.message,
        "priority": args.priority,
    }
    if args.task_id:
        data["task_id"] = args.task_id
    if args.capability:
        data["capability"] = args.capability

    result = _request("POST", "/broadcast", data)
    print(json.dumps(result, indent=2, ensure_ascii=False))


def cmd_agents(args):
    result = _request("GET", "/agents")
    if not isinstance(result, dict):
        print("Respuesta inesperada del router.", file=sys.stderr)
        sys.exit(1)
    for name, info in result.items():
        caps = ", ".join(info.get("capabilities", []))
        print(f"  {name:15s} — {info.get('role', '?'):30s} [{caps}]")


def cmd_tasks(args):
    params = {}
    if args.sender:
        params["sender"] = args.sender
    if args.target:
        params["target"] = args.target
    if args.status:
        params["status"] = args.status
    params["limit"] = str(args.limit)
    query = urllib.parse.urlencode(params)

    result = _request("GET", f"/tasks?{query}")
    if not result:
        print("No hay tareas registradas.")
        return

    if not isinstance(result, list):
        print(f"Error: /tasks devolvió tipo inesperado ({type(result).__name__}), se esperaba una lista.")
        print(f"Respuesta: {json.dumps(result, ensure_ascii=False)[:200]}")
        sys.exit(1)

    for t in result:
        ts = t.get("created_at", "")[:19]
        status = t.get("status", "?")
        task_id = t.get("task_id", "?")
        sender = t.get("sender", "?")
        target = t.get("target", "?")
        print(f"  [{status:12s}] {task_id:30s} {sender} → {target}  ({ts})")
        if t.get("error"):
            print(f"               Error: {t['error']}")
        if t.get("result"):
            print(f"               Result: {str(t['result'])[:100]}")


def cmd_update(args):
    data = {}
    if args.status:
        data["status"] = args.status
    if args.result:
        data["result"] = args.result

    if not data:
        print("Error: debe especificar al menos --status o --result", file=sys.stderr)
        sys.exit(1)

    task_id_encoded = urllib.parse.quote(args.task_id, safe="")
    result = _request("POST", f"/tasks/{task_id_encoded}/update", data)
    print(json.dumps(result, indent=2, ensure_ascii=False))


def main():
    if not SQUAD_AUTH_TOKEN:
        print("ERROR: SQUAD_AUTH_TOKEN no está configurado. No se puede autenticar con el router. Abortando.")
        sys.exit(1)

    parser = argparse.ArgumentParser(description="MateOS Inter-Agent Delegation")
    sub = parser.add_subparsers(dest="command", required=True)

    # route
    p_route = sub.add_parser("route", help="Delegar tarea a otro agente")
    p_route.add_argument("target", help="Agente destino (tropero, domador, etc)")
    p_route.add_argument("message", help="Mensaje/tarea a delegar")
    p_route.add_argument("--task-id", default="", help="ID de tarea (auto si vacío)")
    p_route.add_argument("--priority", default="normal", choices=["normal", "urgent"])
    p_route.add_argument("--context", default="", help="JSON con contexto adicional")

    # broadcast
    p_bc = sub.add_parser("broadcast", help="Enviar a todos los agentes")
    p_bc.add_argument("message", help="Mensaje a enviar")
    p_bc.add_argument("--capability", default="", help="Filtrar por capability")
    p_bc.add_argument("--task-id", default="")
    p_bc.add_argument("--priority", default="normal")

    # agents
    sub.add_parser("agents", help="Listar agentes disponibles")

    # tasks
    p_tasks = sub.add_parser("tasks", help="Ver historial de tareas")
    p_tasks.add_argument("--sender", default="")
    p_tasks.add_argument("--target", default="")
    p_tasks.add_argument("--status", default="")
    p_tasks.add_argument("--limit", type=int, default=20)

    # update
    p_update = sub.add_parser("update", help="Reportar resultado de tarea")
    p_update.add_argument("task_id", help="ID de la tarea")
    p_update.add_argument("--status", default="", help="Nuevo estado")
    p_update.add_argument("--result", default="", help="Resultado/resumen")

    args = parser.parse_args()

    commands = {
        "route": cmd_route,
        "broadcast": cmd_broadcast,
        "agents": cmd_agents,
        "tasks": cmd_tasks,
        "update": cmd_update,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
