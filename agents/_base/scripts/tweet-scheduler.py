#!/usr/bin/env python3
"""
tweet-scheduler.py - Programa tweets a horarios fijos sin usar LLM. Costo: $0.
Solo invoca al agente cuando toca generar un tweet nuevo.
Se ejecuta via loop en Docker (cada 60s).
"""

import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

# === Config ===

ART = timezone(timedelta(hours=-3))
SLOTS = os.environ.get("TWEET_SLOTS", "09:00,11:00,13:00,16:00,19:00,21:00").split(",")
CONTENT_TYPES = [
    "caso_de_uso",
    "educativo_ia",
    "presentacion_agente",
    "opinion",
    "dato",
]

OPENCLAW_DIR = Path.home() / ".openclaw"
TWEET_STATE = OPENCLAW_DIR / "workspace" / "tweet-state.json"
CONFIG_FILE = OPENCLAW_DIR / "openclaw.json"
OPENCLAW = shutil.which("openclaw") or "/usr/local/bin/openclaw"
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_OWNER_ID", "")


# === Helpers ===


def log(msg):
    print(f"[{datetime.now(ART).isoformat()}] tweet-scheduler: {msg}")


def load_config():
    try:
        with open(CONFIG_FILE) as f:
            return json.load(f)
    except Exception:
        return {}


def load_state():
    try:
        with open(TWEET_STATE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_state(state):
    TWEET_STATE.parent.mkdir(parents=True, exist_ok=True)
    with open(TWEET_STATE, "w") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def notify_telegram(text, retries=3):
    """Manda mensaje directo a Telegram. Costo: $0."""
    config = load_config()
    bot_token = config.get("channels", {}).get("telegram", {}).get("botToken")
    if not bot_token or not TELEGRAM_CHAT_ID:
        log(f"no bot token or chat ID, can't notify: {text}")
        return False
    payload = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": text[:4000]}).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=15)
            return True
        except Exception as e:
            log(f"telegram attempt {attempt + 1}/{retries} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2)
    return False


def trigger_agent(message, idempotency_key):
    """Despierta al agente para que genere un tweet. Esto SÍ usa tokens."""
    params = json.dumps({
        "sessionKey": "agent:main:main",
        "message": message,
        "idempotencyKey": idempotency_key,
    })
    try:
        r = subprocess.run(
            [OPENCLAW, "gateway", "call", "chat.send", "--params", params],
            capture_output=True, text=True, timeout=120,
        )
        if r.returncode != 0:
            notify_telegram(
                f"⚠️ tweet-scheduler: chat.send falló\n"
                f"Exit: {r.returncode}\nError: {r.stderr[:500]}"
            )
    except subprocess.TimeoutExpired:
        notify_telegram("⚠️ tweet-scheduler: chat.send timeout (120s)")
    except FileNotFoundError:
        notify_telegram(f"⚠️ tweet-scheduler: openclaw no encontrado en {OPENCLAW}")
    except Exception as e:
        notify_telegram(f"⚠️ tweet-scheduler: error\n{type(e).__name__}: {e}")


# === Scheduling logic ===


def get_current_slot():
    """Devuelve el slot activo actual (el más reciente que ya pasó), o None."""
    now = datetime.now(ART)
    current_time = now.strftime("%H:%M")
    today = now.strftime("%Y-%m-%d")

    active_slot = None
    for slot in sorted(SLOTS):
        if current_time >= slot:
            active_slot = slot

    if active_slot:
        return f"{today}T{active_slot}"
    return None


def next_content_type(last_type):
    """Rota los tipos de contenido para no repetir."""
    if last_type in CONTENT_TYPES:
        idx = CONTENT_TYPES.index(last_type)
        return CONTENT_TYPES[(idx + 1) % len(CONTENT_TYPES)]
    return CONTENT_TYPES[0]


def send_proposal_to_telegram(state):
    """Si hay draft listo, lo manda a Telegram como sugerencia. Costo: $0."""
    draft = state.get("draft", "")
    if not draft:
        return False

    content_type = state.get("content_type", "")
    type_labels = {
        "caso_de_uso": "Caso de uso",
        "educativo_ia": "Educativo IA",
        "presentacion_agente": "Presentación agente",
        "opinion": "Opinión",
        "dato": "Dato",
    }
    label = type_labels.get(content_type, content_type)

    msg = (
        f"🐦 Sugerencia ({label}):\n\n"
        f"{draft}\n\n"
        f"Respondé: ✅ publicar | ✏️ modificar | ❌ descartar\n"
        f"(Se auto-descarta en el próximo horario si no respondés)"
    )

    ok = notify_telegram(msg)
    if ok:
        state["proposal_sent"] = True
        save_state(state)
        log(f"proposal sent to telegram: {label}")
    return ok


# === Main ===


def main():
    twitter_enabled = os.environ.get("TWITTER_ENABLED", "false").lower() == "true"
    if not twitter_enabled:
        sys.exit(0)

    state = load_state()
    current_slot = get_current_slot()

    if not current_slot:
        log("no active slot yet (before first slot of the day)")
        sys.exit(0)

    last_slot = state.get("last_slot")

    # --- Same slot: check if draft needs to be sent to Telegram ---
    if last_slot == current_slot:
        if state.get("pending") and state.get("draft") and not state.get("proposal_sent"):
            send_proposal_to_telegram(state)
        sys.exit(0)

    # --- NEW SLOT ---
    log(f"new slot: {current_slot} (previous: {last_slot})")

    # Auto-discard pending draft if not confirmed
    if state.get("pending") and state.get("draft"):
        log("auto-discarding unconfirmed draft")
        notify_telegram("⏭️ Sugerencia anterior descartada (no confirmada a tiempo).")

    # Pick next content type
    last_type = state.get("content_type", "")
    new_type = next_content_type(last_type)

    # Save new state
    now = datetime.now(ART)
    new_state = {
        "pending": True,
        "draft": None,
        "content_type": new_type,
        "slot": current_slot,
        "last_slot": current_slot,
        "created_at": now.isoformat(),
        "proposal_sent": False,
    }
    save_state(new_state)

    # Trigger LLM to generate tweet
    trigger_agent(
        f"Generá un tweet de tipo '{new_type}'. "
        f"Seguí la estrategia y formatos de SOUL.md. "
        f"Guardá SOLO el texto del tweet en el campo 'draft' de tweet-state.json. "
        f"No cambies ningún otro campo del JSON. "
        f"NO lo publiques. NO lo mandes a Telegram. El script lo hace automáticamente.",
        f"tweet-{current_slot}",
    )

    log(f"agent triggered for type={new_type}")


if __name__ == "__main__":
    main()
