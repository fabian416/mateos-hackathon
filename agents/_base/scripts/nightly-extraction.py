#!/usr/bin/env python3
"""
nightly-extraction.py — Extracción nocturna de memoria para MateOS.

Corre via cron a las 23:00. Costo: ~$0.001 (Gemini Flash, 500 tokens).
Gratis si no hubo sesiones hoy.

Flujo:
1. Lee logs de sesión del día (~/.openclaw/agents/main/sessions/)
2. Lee MEMORY.md del workspace (o crea uno vacío)
3. Gemini Flash extrae hechos durables
4. Escribe nota diaria en memory/YYYY-MM-DD.md
5. Append hechos nuevos a MEMORY.md

Soporta single-agent (workspace/) y multi-agent (workspaces/*/).
"""

import fcntl
import json
import os
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

# === Config ===
SCRIPT_DIR = Path(__file__).parent
DEPLOY_DIR = SCRIPT_DIR.parent
LOCK_FILE = DEPLOY_DIR / ".nightly-extraction.lock"
ART = timezone(timedelta(hours=-3))

SESSION_PATHS = [
    Path.home() / ".openclaw/agents/main/sessions",
    Path.home() / ".openclaw/logs",
]
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_MAX_TOKENS = 500

EXTRACTION_PROMPT = """\
Sos un sistema de extracción de memoria para un agente de IA argentino.
Te doy las conversaciones de hoy y la memoria actual. Extraé SOLO info durable y nueva.
No repitas lo que ya está en MEMORY.md. Respondé en este formato EXACTO:

## Mensajes procesados
- (estimá cantidad por canal)

## Decisiones del operador
- (aprobaciones, modificaciones, descartes)

## Lecciones aprendidas
- (qué salió mal, qué mejorar)

## Contexto nuevo
- (hechos nuevos: cliente, negocio, preferencias)

## Pendientes
- (consultas sin resolver, seguimientos)

## Hechos para MEMORY.md
- (SOLO hechos durables que NO están ya en MEMORY.md)

Si no hay info para una sección, escribí "_(sin novedades)_". Sé conciso."""


# === Helpers ===

def log(msg):
    ts = datetime.now(ART).strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] nightly-extraction: {msg}")


def retry(fn, retries=3, delay=5):
    """Reintentos con backoff. False=no recuperable, None=reintentar."""
    for attempt in range(retries):
        try:
            result = fn()
            if result is False:
                return None
            if result is not None:
                return result
        except Exception as e:
            log(f"intento {attempt + 1}/{retries} falló: {e}")
        if attempt < retries - 1:
            time.sleep(delay * (attempt + 1))
    return None


def load_env():
    env_file = DEPLOY_DIR / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())


def atomic_write(path, content):
    """Temp file + os.replace() para escritura atómica."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(content)
        os.replace(tmp_path, path)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def get_google_api_key():
    key = os.environ.get("GOOGLE_API_KEY", "")
    if key:
        return key
    try:
        auth_path = Path.home() / ".openclaw/agents/main/agent/auth-profiles.json"
        with open(auth_path) as f:
            profiles = json.load(f)
        key = profiles.get("profiles", {}).get("google:default", {}).get("key", "")
    except Exception:
        pass
    return key


# === Lectura de sesiones ===

def find_session_dir():
    for p in SESSION_PATHS:
        if p.is_dir() and any(p.iterdir()):
            return p
    return None


def load_today_sessions():
    """Lee logs JSONL de hoy, extrae mensajes user/assistant."""
    session_dir = find_session_dir()
    if not session_dir:
        log("no se encontró directorio de sesiones")
        return ""

    today = datetime.now(ART).strftime("%Y-%m-%d")
    summaries, session_count, message_count = [], 0, 0

    for f in sorted(session_dir.iterdir()):
        if not f.name.endswith(".jsonl"):
            continue
        # Solo archivos modificados hoy
        mtime = datetime.fromtimestamp(f.stat().st_mtime, tz=ART)
        if mtime.strftime("%Y-%m-%d") != today:
            continue

        session_count += 1
        session_msgs = []
        try:
            with open(f) as fh:
                for line in fh:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        entry = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if entry.get("type") != "message":
                        continue
                    msg = entry.get("message", {})
                    role = msg.get("role", "")
                    if role not in ("user", "assistant"):
                        continue
                    # Extraer texto (ignorar bloques thinking)
                    content = msg.get("content", "")
                    if isinstance(content, str):
                        text = content
                    elif isinstance(content, list):
                        parts = []
                        for part in content:
                            if isinstance(part, dict):
                                t = part.get("text", "")
                                if t and part.get("type") != "thinking":
                                    parts.append(t)
                            elif isinstance(part, str):
                                parts.append(part)
                        text = "\n".join(parts)
                    else:
                        text = ""
                    if text.strip():
                        if len(text) > 500:
                            text = text[:500] + "..."
                        session_msgs.append(f"[{role}]: {text}")
                        message_count += 1
        except Exception as e:
            log(f"error leyendo {f.name}: {e}")
            continue

        if session_msgs:
            tail = session_msgs[-20:]  # últimos 20 mensajes por sesión
            summaries.append(f"### Sesión: {f.stem}\n" + "\n".join(tail))

    log(f"{session_count} sesiones hoy, {message_count} mensajes")
    if not summaries:
        return ""
    combined = "\n\n".join(summaries)
    if len(combined) > 15000:
        combined = combined[:15000] + "\n\n[... truncado]"
    return combined


# === Gemini Flash API ===

def call_gemini(prompt):
    """Llama a Gemini Flash. Retorna texto, None (reintentar), o False (sin key)."""
    api_key = get_google_api_key()
    if not api_key:
        log("GOOGLE_API_KEY no encontrada")
        return False
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{GEMINI_MODEL}:generateContent?key={api_key}")
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": GEMINI_MAX_TOKENS, "temperature": 0.3},
    }
    try:
        req = urllib.request.Request(
            url, data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200] if hasattr(e, "read") else ""
        log(f"gemini HTTP {e.code}: {body}")
        return None
    except Exception as e:
        log(f"gemini error: {e}")
        return None


# === Workspace detection ===

def detect_workspaces():
    """Retorna [(nombre, path)] — multi-agent o single-agent."""
    multi = DEPLOY_DIR / "workspaces"
    if multi.is_dir():
        ws = [(d.name, d) for d in sorted(multi.iterdir()) if d.is_dir()]
        if ws:
            return ws
    single = DEPLOY_DIR / "workspace"
    if single.is_dir():
        return [("main", single)]
    single.mkdir(parents=True, exist_ok=True)
    return [("main", single)]


# === Extracción y escritura ===

def read_memory(workspace_path):
    """Lee MEMORY.md o crea uno inicial."""
    memory_file = workspace_path / "MEMORY.md"
    if memory_file.exists():
        return memory_file.read_text()
    name = workspace_path.name
    initial = (
        f"# Memoria — {name}\n\n"
        f"> Última actualización: {datetime.now(ART).strftime('%Y-%m-%d')}\n"
        "> Actualizado por nightly-extraction.py y el operador.\n\n"
        "## Preferencias del operador\n\n_(vacío)_\n\n"
        "## Patrones aprendidos\n\n_(vacío)_\n\n"
        "## Lecciones\n\n_(vacío)_\n\n"
        "## Contexto durable\n\n_(vacío)_\n")
    atomic_write(memory_file, initial)
    log(f"MEMORY.md creado en {workspace_path}")
    return initial


def write_daily_note(workspace_path, date_str, extraction):
    note_path = workspace_path / "memory" / f"{date_str}.md"
    atomic_write(note_path, f"# Nota diaria — {date_str}\n\n{extraction}\n")
    log(f"nota diaria: {note_path}")


def update_memory(workspace_path, extraction):
    """Append hechos durables a MEMORY.md."""
    marker = "## Hechos para MEMORY.md"
    if marker not in extraction:
        log("sin hechos nuevos para MEMORY.md")
        return
    rest = extraction[extraction.index(marker) + len(marker):]
    next_h = rest.find("\n## ")
    facts = (rest[:next_h] if next_h != -1 else rest).strip()
    if not facts or "sin novedades" in facts.lower():
        log("sin hechos nuevos para MEMORY.md")
        return

    memory_file = workspace_path / "MEMORY.md"
    current = memory_file.read_text() if memory_file.exists() else ""
    today = datetime.now(ART).strftime("%Y-%m-%d")

    # Actualizar timestamp
    if "> Última actualización:" in current:
        lines = current.split("\n")
        for i, line in enumerate(lines):
            if line.startswith("> Última actualización:"):
                lines[i] = f"> Última actualización: {today}"
                break
        current = "\n".join(lines)

    updated = current.rstrip() + f"\n\n## Extracción {today}\n\n{facts}\n"
    atomic_write(memory_file, updated)
    log("MEMORY.md actualizado")


def run_extraction(ws_name, ws_path, session_text):
    log(f"procesando: {ws_name}")
    current_memory = read_memory(ws_path)
    today = datetime.now(ART).strftime("%Y-%m-%d")
    full_prompt = (
        f"{EXTRACTION_PROMPT}\n\n---\n\n"
        f"## MEMORY.md actual:\n\n{current_memory}\n\n---\n\n"
        f"## Conversaciones de hoy ({today}):\n\n{session_text}\n")

    extraction = retry(lambda: call_gemini(full_prompt))
    if not extraction:
        log(f"extracción falló para {ws_name}")
        return False
    write_daily_note(ws_path, today, extraction)
    update_memory(ws_path, extraction)
    return True


# === Main ===

def main():
    lock_fd = open(LOCK_FILE, "w")
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("otra instancia corriendo, saliendo")
        lock_fd.close()
        return
    try:
        _main_locked()
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        lock_fd.close()


def _main_locked():
    load_env()
    log("iniciando extracción nocturna de memoria")

    session_text = load_today_sessions()
    if not session_text:
        log("no hubo sesiones hoy — ahorramos plata")
        return

    workspaces = detect_workspaces()
    mode = "multi-agent" if len(workspaces) > 1 else "single-agent"
    log(f"modo {mode}: {len(workspaces)} workspace(s)")

    ok, fail = 0, 0
    for name, path in workspaces:
        try:
            if run_extraction(name, path, session_text):
                ok += 1
            else:
                fail += 1
        except Exception as e:
            log(f"error en {name}: {e}")
            fail += 1
    log(f"completado: {ok} ok, {fail} fallidos")


if __name__ == "__main__":
    main()
