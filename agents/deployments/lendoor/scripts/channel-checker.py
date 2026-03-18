#!/usr/bin/env python3
"""
channel-checker - Revisa canales (email + WhatsApp) sin usar LLM. Costo: $0.
Solo invoca al agente de OpenClaw cuando hay un mensaje nuevo.
Evolución de email-checker.py para multi-canal.
Se ejecuta via loop en Docker (cada 60s).
"""

import fcntl
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path

OPENCLAW_DIR = Path.home() / ".openclaw"
STATE_FILE = OPENCLAW_DIR / "workspace" / "channel-state.json"
CONFIG_FILE = OPENCLAW_DIR / "openclaw.json"
HIMALAYA = shutil.which("himalaya") or str(Path.home() / ".local" / "bin" / "himalaya")
OPENCLAW = shutil.which("openclaw") or "/usr/local/bin/openclaw"
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_OWNER_ID", "")
ATTACHMENTS_DIR = OPENCLAW_DIR / "workspace" / "attachments"
EMAIL_ENABLED = os.environ.get("EMAIL_ENABLED", "false").lower() == "true"

# Image MIME types that Telegram sendPhoto supports
SENDPHOTO_MIMES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"}
SENDPHOTO_MAX = 10 * 1024 * 1024   # 10 MB
SENDDOC_MAX = 50 * 1024 * 1024     # 50 MB


def run(cmd, timeout=30):
    """Ejecuta un comando y devuelve stdout."""
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        print(f"[{datetime.now().isoformat()}] run: command {cmd} exited with code {r.returncode}: {r.stderr[:200]}", file=sys.stderr)
        return ""
    return r.stdout.strip()


def _escape_html(text):
    """Escapa caracteres especiales para Telegram HTML parse_mode."""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def notify_telegram(text, retries=3, parse_mode=None):
    """Manda un mensaje directo a Telegram (sin LLM, sin OpenClaw)."""
    config = load_config()
    bot_token = config.get("channels", {}).get("telegram", {}).get("botToken")
    if not bot_token or not TELEGRAM_CHAT_ID:
        print(f"No bot token or chat ID, can't notify: {text}", file=sys.stderr)
        return False
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text[:4000],
    }
    if parse_mode:
        payload["parse_mode"] = parse_mode
    data = json.dumps(payload).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                data=data,
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=15)
            return True
        except Exception as e:
            print(f"Telegram notify attempt {attempt + 1}/{retries} failed: {e}", file=sys.stderr)
            if attempt < retries - 1:
                time.sleep(2)
    return False


def _get_bot_token():
    config = load_config()
    return config.get("channels", {}).get("telegram", {}).get("botToken")


def _build_multipart(fields, files):
    """Construye un body multipart/form-data con stdlib."""
    boundary = uuid.uuid4().hex
    body = bytearray()
    for name, value in fields.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += f"{value}\r\n".encode()
    for f in files:
        field = f["field"]
        if "path" in f:
            filename = os.path.basename(f["path"])
            mime = mimetypes.guess_type(f["path"])[0] or "application/octet-stream"
            with open(f["path"], "rb") as fh:
                data = fh.read()
        else:
            filename = f["filename"]
            mime = f["mime"]
            data = f["data"]
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{field}"; filename="{filename}"\r\n'.encode()
        body += f"Content-Type: {mime}\r\n\r\n".encode()
        body += data
        body += b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    return bytes(body), f"multipart/form-data; boundary={boundary}"


def send_telegram_photo(file_path, caption=None, retries=3):
    """Envía una foto a Telegram via sendPhoto."""
    bot_token = _get_bot_token()
    if not bot_token:
        return False
    fields = {"chat_id": TELEGRAM_CHAT_ID}
    if caption:
        fields["caption"] = caption[:1024]
    body, ct = _build_multipart(fields, [{"field": "photo", "path": file_path}])
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{bot_token}/sendPhoto",
                data=body, headers={"Content-Type": ct}, method="POST",
            )
            urllib.request.urlopen(req, timeout=30)
            return True
        except Exception as e:
            print(f"Telegram sendPhoto attempt {attempt + 1}/{retries} failed: {e}", file=sys.stderr)
            if attempt < retries - 1:
                time.sleep(2)
    return False


def send_telegram_document(file_path, caption=None, retries=3):
    """Envía un archivo a Telegram via sendDocument."""
    bot_token = _get_bot_token()
    if not bot_token:
        return False
    fields = {"chat_id": TELEGRAM_CHAT_ID}
    if caption:
        fields["caption"] = caption[:1024]
    body, ct = _build_multipart(fields, [{"field": "document", "path": file_path}])
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{bot_token}/sendDocument",
                data=body, headers={"Content-Type": ct}, method="POST",
            )
            urllib.request.urlopen(req, timeout=60)
            return True
        except Exception as e:
            print(f"Telegram sendDocument attempt {attempt + 1}/{retries} failed: {e}", file=sys.stderr)
            if attempt < retries - 1:
                time.sleep(2)
    return False


def get_mime_type(filepath):
    try:
        r = subprocess.run(
            ["file", "--mime-type", "-b", filepath],
            capture_output=True, text=True, timeout=5,
        )
        return r.stdout.strip()
    except Exception:
        return mimetypes.guess_type(filepath)[0] or "application/octet-stream"


def download_attachments(email_id):
    """Descarga adjuntos del email."""
    dest = ATTACHMENTS_DIR / str(email_id)
    dest.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [HIMALAYA, "attachment", "download", str(email_id), "-d", str(dest)],
            capture_output=True, timeout=60,
        )
    except Exception as e:
        print(f"Failed to download attachments for #{email_id}: {e}", file=sys.stderr)
        return []

    attachments = []
    for f in sorted(dest.iterdir()):
        if not f.is_file():
            continue
        size = f.stat().st_size
        mime = get_mime_type(str(f))
        if mime.startswith("image/") and size < 5120:
            f.unlink()
            continue
        att_type = "image" if mime in SENDPHOTO_MIMES and size <= SENDPHOTO_MAX else "document"
        attachments.append({
            "filename": f.name,
            "path": str(f),
            "size": size,
            "mime": mime,
            "type": att_type,
        })
    return attachments


def send_attachments_to_telegram(attachments, subject=""):
    """Envía adjuntos descargados a Telegram."""
    failed = []
    for att in attachments:
        filename = att["filename"]
        size = att["size"]
        caption = f"📎 {filename}" if not subject else f"📎 {filename} — {subject}"
        caption = caption[:1024]

        if size > SENDDOC_MAX:
            failed.append(f"⚠️ {filename} ({size // (1024*1024)}MB) — demasiado grande")
            continue

        ok = False
        if att["type"] == "image":
            ok = send_telegram_photo(att["path"], caption=caption)
            if not ok:
                ok = send_telegram_document(att["path"], caption=caption)
        else:
            ok = send_telegram_document(att["path"], caption=caption)

        if not ok:
            failed.append(f"⚠️ {filename} ({att['mime']}, {size // 1024}KB) — no se pudo enviar")

    if failed:
        msg = "📎 Algunos adjuntos no se pudieron reenviar:\n\n" + "\n".join(failed)
        notify_telegram(msg)


def cleanup_old_attachments():
    """Limpia directorios de adjuntos con más de 2 horas."""
    if not ATTACHMENTS_DIR.exists():
        return
    from datetime import timedelta
    cutoff = datetime.now().timestamp() - timedelta(hours=2).total_seconds()
    for d in ATTACHMENTS_DIR.iterdir():
        if d.is_dir():
            try:
                if d.stat().st_mtime < cutoff:
                    shutil.rmtree(d)
            except Exception:
                pass


def load_config():
    try:
        with open(CONFIG_FILE) as f:
            return json.load(f)
    except Exception:
        return {}


def mark_as_unread(email_id):
    try:
        subprocess.run(
            [HIMALAYA, "flag", "remove", str(email_id), "Seen"],
            capture_output=True, timeout=15,
        )
    except Exception as e:
        print(f"Failed to mark #{email_id} as unread: {e}", file=sys.stderr)


def has_pending():
    """¿Hay un mensaje pendiente de respuesta?"""
    try:
        with open(STATE_FILE) as f:
            state = json.load(f)
    except FileNotFoundError:
        return None
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] channel-checker: can't read state: {e}", file=sys.stderr)
        return None

    pending_id = state.get("pendingMessageId")
    if not pending_id:
        return None

    # Staleness check - 30 min timeout
    received = state.get("receivedAt", "")
    if received:
        from datetime import timedelta, timezone
        try:
            received_dt = datetime.fromisoformat(received.replace("Z", "+00:00").replace(" ", "T"))
            if received_dt.tzinfo is None:
                received_dt = received_dt.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            if now - received_dt > timedelta(minutes=30):
                channel = state.get("channel", "email")
                if channel == "email":
                    mark_as_unread(pending_id)
                with open(STATE_FILE, "w") as f:
                    json.dump({}, f)
                notify_telegram(
                    f"⚠️ channel-checker: mensaje #{pending_id} ({channel}) pendiente >30min. "
                    f"Limpiado para no bloquear nuevos mensajes."
                )
                return None
        except (ValueError, TypeError):
            pass
    return pending_id


def get_oldest_unread():
    """Busca el email no leído más antiguo."""
    try:
        r = subprocess.run(
            [HIMALAYA, "envelope", "list", "--folder", "INBOX", "-o", "json"],
            capture_output=True, text=True, timeout=30,
        )
        if r.returncode != 0:
            notify_telegram(f"⚠️ channel-checker: himalaya falló\nExit: {r.returncode}\nError: {r.stderr[:500]}")
            return None
        envelopes = json.loads(r.stdout.strip())
    except json.JSONDecodeError as e:
        notify_telegram(f"⚠️ channel-checker: himalaya JSON inválido\nError: {e}")
        return None
    except subprocess.TimeoutExpired:
        notify_telegram("⚠️ channel-checker: himalaya timeout (30s)")
        return None
    except FileNotFoundError:
        # himalaya not installed - email disabled or misconfigured
        return None
    except Exception as e:
        notify_telegram(f"⚠️ channel-checker: error inesperado\n{type(e).__name__}: {e}")
        return None

    unread = [e for e in envelopes if "Seen" not in e.get("flags", [])]
    if not unread:
        return None

    unread.sort(key=lambda e: e.get("date", ""))
    return unread[0]


def clean_body(raw):
    """Limpia el body: saca tags MML, headers, HTML."""
    text = re.sub(r'<#/?part[^>]*>', '', raw)
    text = re.sub(r'^(From|To|Subject|Date|Content-Type|MIME-Version|Message-ID):.*$',
                  '', text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def read_email(email_id):
    try:
        raw = run([HIMALAYA, "message", "read", "--preview", str(email_id)])
    except Exception:
        try:
            raw = run([HIMALAYA, "message", "read", str(email_id)])
        except Exception:
            return "(no se pudo leer el contenido)"
    return clean_body(raw)


def mark_as_read(email_id):
    subprocess.run(
        [HIMALAYA, "flag", "add", str(email_id), "Seen"],
        capture_output=True, timeout=15,
    )


def save_state(channel, message_id, from_addr, from_name, subject, date, body, attachments=None):
    """Guarda el estado del mensaje pendiente (atomic write)."""
    state = {
        "pendingMessageId": str(message_id),
        "channel": channel,
        "from": from_addr,
        "fromName": from_name,
        "subject": subject,
        "receivedAt": date,
        "body": body[:5000],
        "attachments": attachments or [],
    }
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=STATE_FILE.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, STATE_FILE)
    except BaseException:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def send_proposal_to_telegram():
    """Si hay mensaje pendiente con draft, lo manda a Telegram para aprobación."""
    try:
        with open(STATE_FILE) as f:
            state = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return False

    pending_id = state.get("pendingMessageId")
    if not pending_id:
        return False
    if state.get("completed"):
        return False

    draft = state.get("draft")
    if not draft:
        return False
    if state.get("proposalSent"):
        return False

    channel = state.get("channel", "email")
    from_addr = state.get("from", "desconocido")
    from_name = state.get("fromName", from_addr)
    subject = state.get("subject", "(sin asunto)")
    body = state.get("body", "")
    attachments = state.get("attachments", [])

    # Channel indicator
    channel_emoji = "📧" if channel == "email" else "💬"
    channel_label = "Email" if channel == "email" else "WhatsApp"

    att_line = ""
    if attachments:
        names = ", ".join(a.get("filename", "?") for a in attachments)
        att_line = f"\n📎 Adjuntos: {len(attachments)} archivo(s) ({names}) — enviados aparte\n"

    safe_from = _escape_html(f"{from_name} <{from_addr}>")
    safe_subject = _escape_html(subject) if subject else ""
    safe_body = _escape_html(body)
    safe_draft = _escape_html(draft)
    safe_att = _escape_html(att_line)

    subject_line = f"\n📌 Asunto: {safe_subject}" if subject else ""

    proposal = (
        f"{channel_emoji} {channel_label} de: {safe_from}"
        f"{subject_line}\n\n"
        f"📩 Mensaje:\n<pre>{safe_body}</pre>\n"
        f"{safe_att}\n"
        f"✏️ Respuesta propuesta:\n<pre>{safe_draft}</pre>\n"
        f"Respondé: ✅ enviar | ✏️ modificar | ❌ descartar | 🗑️ olvidar"
    )
    ok = notify_telegram(proposal, parse_mode="HTML")
    if not ok:
        print(f"[{datetime.now().isoformat()}] channel-checker: failed to send proposal for #{pending_id}")
        return False

    # Send attachments
    if attachments:
        valid = [a for a in attachments if os.path.exists(a.get("path", ""))]
        if valid:
            send_attachments_to_telegram(valid, subject=subject or "")

    state["proposalSent"] = True
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

    print(f"[{datetime.now().isoformat()}] channel-checker: proposal sent ({channel}) #{pending_id}")
    return True


def trigger_agent(message, message_id):
    """Despierta la sesión principal via openclaw gateway call chat.send.
    Returns True on success, False on failure."""
    params = json.dumps({
        "sessionKey": "agent:main:main",
        "message": message,
        "idempotencyKey": f"msg-{message_id}",
    })
    try:
        r = subprocess.run(
            [OPENCLAW, "gateway", "call", "chat.send", "--params", params],
            capture_output=True, text=True, timeout=60,
        )
        if r.returncode != 0:
            notify_telegram(
                f"⚠️ channel-checker: chat.send falló\n"
                f"Exit: {r.returncode}\nError: {r.stderr[:500]}"
            )
            return False
        return True
    except subprocess.TimeoutExpired:
        notify_telegram("⚠️ channel-checker: chat.send timeout (60s)")
        return False
    except FileNotFoundError:
        notify_telegram(f"⚠️ channel-checker: openclaw no encontrado en {OPENCLAW}")
        return False
    except Exception as e:
        notify_telegram(f"⚠️ channel-checker: error\n{type(e).__name__}: {e}")
        return False


def handle_completed_state():
    """Procesa un estado 'completed'."""
    try:
        with open(STATE_FILE) as f:
            state = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return False
    except Exception:
        return False

    completed = state.get("completed")
    if not completed:
        return False

    # Staleness check
    from datetime import timedelta, timezone
    file_mtime = STATE_FILE.stat().st_mtime
    file_age_seconds = datetime.now().timestamp() - file_mtime
    completed_at = completed.get("completedAt", "")
    if completed_at and file_age_seconds > 120:
        try:
            completed_dt = datetime.fromisoformat(completed_at.replace("Z", "+00:00"))
            if completed_dt.tzinfo is None:
                completed_dt = completed_dt.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            if now - completed_dt > timedelta(minutes=5):
                with open(STATE_FILE, "w") as f:
                    json.dump({}, f)
                if ATTACHMENTS_DIR.exists():
                    shutil.rmtree(ATTACHMENTS_DIR, ignore_errors=True)
                return True
        except (ValueError, TypeError):
            pass

    action = completed.get("action", "unknown")
    to = completed.get("to", "")
    subject = completed.get("subject", "(sin asunto)")
    email_id = completed.get("emailId", completed.get("messageId", ""))
    channel = completed.get("channel", state.get("channel", "email"))

    channel_emoji = "📧" if channel == "email" else "💬"

    if action == "discarded" and email_id and channel == "email":
        mark_as_unread(email_id)

    if action == "sent":
        notify_telegram(f"✅ {channel_emoji} Enviado a {to} — {subject}")
    elif action == "discarded":
        notify_telegram(f"❌ {channel_emoji} Descartado — {subject}")
    elif action == "forgotten":
        notify_telegram(f"🗑️ {channel_emoji} Olvidado — {subject}")
    else:
        notify_telegram(f"ℹ️ {channel_emoji} Procesado ({action}) — {subject}")

    if email_id:
        att_dir = ATTACHMENTS_DIR / str(email_id)
        if att_dir.exists():
            shutil.rmtree(att_dir, ignore_errors=True)

    with open(STATE_FILE, "w") as f:
        json.dump({}, f)

    print(f"[{datetime.now().isoformat()}] channel-checker: completed — {channel}/{action}/{subject}")
    return True


def main():
    # Acquire exclusive lock to prevent concurrent runs
    lock_path = OPENCLAW_DIR / "workspace" / "channel-checker.lock"
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    lock_file = open(lock_path, "w")
    try:
        fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        # Another instance is running, exit silently
        lock_file.close()
        sys.exit(0)

    print(f"[{datetime.now().isoformat()}] channel-checker: starting")

    # 0. Limpiar adjuntos viejos
    cleanup_old_attachments()

    # 0.5. Procesar estado "completed"
    handle_completed_state()

    # 0.7. Si hay draft, enviar propuesta a Telegram
    send_proposal_to_telegram()

    # 1. ¿Hay mensaje pendiente?
    pending_id = has_pending()
    if pending_id:
        print(f"[{datetime.now().isoformat()}] channel-checker: pending #{pending_id}, skipping")
        sys.exit(0)

    # 2. ¿Hay emails no leídos? (solo si email está habilitado)
    if EMAIL_ENABLED:
        email = get_oldest_unread()
        if email:
            email_id = email["id"]
            from_obj = email.get("from", {})
            from_addr = from_obj.get("addr", "desconocido")
            from_name = from_obj.get("name", from_addr)
            subject = email.get("subject", "(sin asunto)")
            date = email.get("date", "")

            body = read_email(email_id)
            attachments = download_attachments(email_id)
            save_state("email", email_id, from_addr, from_name, subject, date, body, attachments)

            message = (
                f"Nuevo email de {from_name} <{from_addr}> — Asunto: {subject}\n\n"
                f"Contenido: {body[:500]}\n\n"
                f"Instrucciones: Leé SOUL.md y TOOLS.md. "
                f"Redactá un borrador de respuesta ÚTIL y ESPECÍFICO. "
                f"Guardalo en el campo 'draft' de channel-state.json. "
                f"NO envíes la propuesta a Telegram — el script lo hace automáticamente."
            )
            if trigger_agent(message, email_id):
                mark_as_read(email_id)
            else:
                mark_as_unread(email_id)
            print(f"[{datetime.now().isoformat()}] channel-checker: email #{email_id} triggered: {subject}")
            sys.exit(0)

    # 3. WhatsApp: no necesita polling (OpenClaw maneja en real-time)
    # El checker solo maneja el ciclo de aprobación para WhatsApp

    print(f"[{datetime.now().isoformat()}] channel-checker: no pending messages")
    sys.exit(0)


if __name__ == "__main__":
    main()
