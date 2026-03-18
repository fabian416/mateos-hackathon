#!/usr/bin/env python3
"""
daily-brief.py — Resumen diario sin LLM. Costo: $0.
Dos modos: --morning (08:00) y --evening (21:00).
Se ejecuta via cron en Docker.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

OPENCLAW_DIR = Path.home() / ".openclaw"
STATE_FILE = OPENCLAW_DIR / "workspace" / "channel-state.json"
CONFIG_FILE = OPENCLAW_DIR / "openclaw.json"
LOGS_DIR = OPENCLAW_DIR / "logs"

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_OWNER_ID = os.environ.get("TELEGRAM_OWNER_ID", "")
AGENT_NAME = os.environ.get("AGENT_NAME", "agente")

HIMALAYA = shutil.which("himalaya") or str(Path.home() / ".local" / "bin" / "himalaya")
EMAIL_ENABLED = os.environ.get("EMAIL_ENABLED", "false").lower() == "true"


def notify_telegram(text):
    """Envía mensaje a Telegram sin LLM."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_OWNER_ID:
        print(f"No bot token or chat ID: {text}", file=sys.stderr)
        return False
    payload = json.dumps({
        "chat_id": TELEGRAM_OWNER_ID,
        "text": text[:4000],
    }).encode()
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=15)
            return True
        except Exception as e:
            print(f"Telegram attempt {attempt + 1}/3 failed: {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(2)
    return False


def count_unread_emails():
    """Cuenta emails no leídos via himalaya."""
    if not EMAIL_ENABLED:
        return None
    try:
        r = subprocess.run(
            [HIMALAYA, "envelope", "list", "--folder", "INBOX", "-o", "json"],
            capture_output=True, text=True, timeout=30,
        )
        if r.returncode != 0:
            return -1
        envelopes = json.loads(r.stdout.strip())
        return sum(1 for e in envelopes if "Seen" not in e.get("flags", []))
    except Exception:
        return -1


def has_pending_message():
    """Revisa si hay mensaje pendiente en channel-state.json."""
    try:
        with open(STATE_FILE) as f:
            state = json.load(f)
        return bool(state.get("pendingMessageId"))
    except Exception:
        return False


def count_today_logs():
    """Cuenta líneas de log de hoy (proxy de mensajes procesados)."""
    today = datetime.now().strftime("%Y-%m-%d")
    count = 0
    if not LOGS_DIR.exists():
        return 0
    for log_file in LOGS_DIR.glob("*.log"):
        try:
            with open(log_file) as f:
                for line in f:
                    if today in line and "completed" in line.lower():
                        count += 1
        except Exception:
            continue
    return count


def morning_brief():
    """Resumen matutino: estado general."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [f"Buenos dias — {AGENT_NAME}", f"Fecha: {now}", ""]

    # Emails no leidos
    unread = count_unread_emails()
    if unread is None:
        lines.append("Email: deshabilitado")
    elif unread < 0:
        lines.append("Email: error al consultar himalaya")
    elif unread == 0:
        lines.append("Email: bandeja limpia")
    else:
        lines.append(f"Email: {unread} mensaje(s) sin leer")

    # Pendientes
    if has_pending_message():
        lines.append("Canal: hay un mensaje pendiente de respuesta")
    else:
        lines.append("Canal: sin pendientes")

    lines.append("")
    lines.append("Listo para trabajar.")

    notify_telegram("\n".join(lines))


def evening_wrap():
    """Resumen vespertino: actividad del dia."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [f"Resumen del dia — {AGENT_NAME}", f"Fecha: {now}", ""]

    # Mensajes procesados
    processed = count_today_logs()
    lines.append(f"Mensajes procesados hoy: {processed}")

    # Pendientes abiertos
    if has_pending_message():
        lines.append("Pendiente: queda un mensaje sin resolver")
    else:
        lines.append("Pendientes: todo cerrado")

    # Emails
    unread = count_unread_emails()
    if unread is not None and unread > 0:
        lines.append(f"Emails sin leer al cierre: {unread}")

    lines.append("")
    lines.append("Hasta manana.")

    notify_telegram("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description="Resumen diario sin LLM")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--morning", action="store_true", help="Resumen matutino (08:00)")
    group.add_argument("--evening", action="store_true", help="Resumen vespertino (21:00)")
    args = parser.parse_args()

    if args.morning:
        morning_brief()
    else:
        evening_wrap()


if __name__ == "__main__":
    main()
