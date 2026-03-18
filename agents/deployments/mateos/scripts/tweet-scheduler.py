#!/usr/bin/env python3
"""
tweet-scheduler.py — Mateo CEO genera y postea tweets con aprobación via Telegram.

Corre via cron cada 2 min. Costo: $0 el 99% de las corridas.
Solo gasta tokens (Grok/Gemini) cuando toca un slot nuevo (~6 veces/día).

Flujo:
1. Cada 2 min: chequea si hay respuesta del operador en Telegram ($0)
2. En slot nuevo: auto-descarta el anterior si no fue confirmado, genera tweet nuevo
3. Envía sugerencia a Telegram
4. Si el operador aprueba (✅): postea en Twitter

Estado se guarda en tweet-state.json.
"""

import fcntl
import json
import os
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from requests_oauthlib import OAuth1
import requests

# === Config ===

SCRIPT_DIR = Path(__file__).parent
DEPLOY_DIR = SCRIPT_DIR.parent
STATE_FILE = DEPLOY_DIR / "tweet-state.json"
ART = timezone(timedelta(hours=-3))

# Time slots (ART) — ~6 sugerencias/día en horario activo
SLOTS = os.environ.get("TWEET_SLOTS", "09:00,11:00,13:00,16:00,19:00,21:00").split(",")

# Twitter OAuth 1.0a
TW_API_KEY = os.environ.get("TWITTER_API_KEY", "")
TW_API_SECRET = os.environ.get("TWITTER_API_SECRET", "")
TW_ACCESS_TOKEN = os.environ.get("TWITTER_ACCESS_TOKEN", "")
TW_ACCESS_SECRET = os.environ.get("TWITTER_ACCESS_TOKEN_SECRET", "")

# Telegram
TG_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TG_CHAT_ID = os.environ.get("TELEGRAM_OWNER_ID", "")

# Grok (xAI)
GROK_API_KEY = os.environ.get("GROK_API_KEY", "")

# Twitter handle (para el link post-publicación)
TWITTER_HANDLE = os.environ.get("TWITTER_HANDLE", "mateos")

# Google News RSS
NEWS_FEEDS = [
    "https://news.google.com/rss/search?q=inteligencia+artificial+argentina&hl=es-419&gl=AR&ceid=AR:es-419",
    "https://news.google.com/rss/search?q=tecnolog%C3%ADa+pymes+argentina&hl=es-419&gl=AR&ceid=AR:es-419",
    "https://news.google.com/rss/search?q=automatizaci%C3%B3n+negocios+argentina&hl=es-419&gl=AR&ceid=AR:es-419",
    "https://news.google.com/rss/search?q=chatbot+whatsapp+empresas&hl=es-419&gl=AR&ceid=AR:es-419",
]

# Content types — rotan automáticamente entre slots
CONTENT_TYPES = ["caso_de_uso", "educativo", "noticias", "agente", "opinión"]

# Reglas de honestidad
HONESTY_RULES = (
    "\n\nREGLAS OBLIGATORIAS:"
    "\n- MateOS es una empresa nueva. NO decir que tenemos X clientes, X empresas, ni métricas inventadas."
    "\n- NO decir '50+ empresas', '99.9% uptime', ni ningún número que no sea real."
    "\n- Podés hablar de lo que HACEMOS y lo que OFRECEMOS, no de resultados que no tenemos todavía."
    "\n- Podés usar ejemplos hipotéticos pero sin presentarlos como casos reales. Ej: 'Imaginate que tu veterinaria...' en vez de 'Una veterinaria ya lo usa'."
    "\n- El precio es real: $2.000.000 setup + $500.000/mes. Eso sí se puede decir."
    "\n- Somos de Argentina, hablamos argentino, eso es real."
    "\n- Si querés transmitir confianza, hacelo con conocimiento técnico, no con números falsos."
)

CONTENT_PROMPTS = {
    "caso_de_uso": (
        "Tu objetivo es generar UN tweet (máximo 280 caracteres) que cuente un caso de uso hipotético "
        "de un agente de IA para un negocio argentino específico.\n"
        "REGLAS: Argentino real con voseo. CERO hashtags, CERO buzzwords. Máximo 1 emoji. "
        "Nunca inventar métricas ni clientes reales. Siempre hipotético: 'Imaginate', 'Pensá en', "
        "'Sabés cuando', '¿Viste cuando...'. No vendas, contá una historia cortita de un problema "
        "real y cómo se resuelve. Soná como un tipo charlando en un asado, no como un post de LinkedIn.\n"
        "ESTRUCTURA (elegí UNA): 1) DOLOR→SOLUCIÓN: problema cotidiano + cómo un agente lo resuelve. "
        "2) DÍA EN LA VIDA: momento específico del dueño. 3) PREGUNTA PROVOCADORA. "
        "4) CONTRASTE ABSURDO: lo ridículo de cómo se hace hoy vs. cómo podría ser.\n"
        "INDUSTRIAS (rotá): panadería, veterinaria, consultorio, estudio contable, inmobiliaria, "
        "gym, restaurante, peluquería, taller mecánico, ferretería, academia, óptica, florería, "
        "cervecería artesanal, centro de estética.\n"
        "PROHIBIDO: 'Revolucionar', 'potenciar', 'escalar', 'el futuro', 'game changer', "
        "'IA de última generación', 'solución integral', cualquier frase de pitch deck.\n"
        "Generá UN solo tweet. Solo el texto, nada más."
    ),
    "educativo": (
        "Tu objetivo es escribir UN tweet educativo sobre IA aplicada a negocios. Máximo 280 caracteres.\n"
        "REGLAS: Argentino natural con voseo. Máximo 1 emoji. CERO hashtags. "
        "PROHIBIDO: 'revolucionar', 'disruptivo', 'game changer', 'el futuro es hoy', "
        "'transformación digital', 'potenciar', 'sinergia'. La empresa es NUEVA, no inventés "
        "casos de éxito ni métricas. No vendas. No cierres con CTA. "
        "Nunca seas condescendiente. No uses '¿Sabías que...?'. Compartí perspectiva como quien "
        "charla con un par.\n"
        "TONO: Ingeniero que le explica algo a un amigo empresario tomando un café. Directo, claro, "
        "con opinión. Puede ser filoso o provocador, siempre respetuoso.\n"
        "ESTRUCTURA (elegí UNA al azar): 1) Observación concreta sobre negocios hoy. "
        "2) Distinción útil (chatbot vs agente, automatizar vs IA). 3) Mito vs realidad. "
        "4) Pregunta incómoda. 5) Analogía simple de concepto técnico.\n"
        "TEMAS (elegí uno): diferencia chatbot/agente, qué puede y no puede la IA, "
        "costo oculto del trabajo manual, velocidad como ventaja, PyMEs adoptan IA más rápido "
        "que corporaciones, la IA reemplaza tareas no personas.\n"
        "Devolvé SOLO el texto del tweet, nada más."
    ),
    "agente": (
        "Generá UN tweet presentando uno de los agentes de MateOS aplicado a un negocio concreto.\n"
        "AGENTES: El Baqueano (atención al cliente WhatsApp/email), El Relator (contenido/community), "
        "El Tropero (ventas/leads/reuniones), El Domador (admin/datos/reportes), "
        "El Rastreador (soporte técnico L1), El Paisano (agente a medida).\n"
        "REGLAS: Máximo 280 caracteres. Argentino con voseo natural. Máximo 1 emoji. CERO hashtags. "
        "CERO buzzwords. La empresa es NUEVA: nunca decir que ya tiene clientes usando los agentes. "
        "Hablá en condicional o plantealo como posibilidad ('imaginate que...', 'mientras vos dormís, "
        "El Baqueano...'). No expliques por qué se llama así. Usá el nombre como si fuera obvio.\n"
        "TONO: Emprendedor que habla en serio pero no se toma demasiado en serio. Nada corporativo, "
        "nada motivacional. Variá estructura: a veces problema primero, a veces nombre del agente "
        "primero, a veces una situación, a veces una pregunta.\n"
        "RUBROS (rotá): inmobiliaria, estudio contable, clínica, restaurante, gym, peluquería, "
        "veterinaria, taller, ferretería, academia.\n"
        "Devolvé SOLO el texto del tweet, nada más."
    ),
    "opinión": (
        "Escribí UN SOLO tweet de opinión/reflexión sobre IA y negocios en Argentina. "
        "Máximo 280 caracteres.\n"
        "REGLAS: Argentino con voseo real. CERO hashtags. Máximo 1 emoji. "
        "PROHIBIDO: 'disruptivo', 'transformador', 'revolucionario', 'game changer', 'innovador', "
        "'potenciar', 'escalar', 'ecosistema', 'sinergia'. NO menciones métricas de la empresa. "
        "NO hables como speaker de TEDx ni gurú de LinkedIn.\n"
        "TONO: Como un mensaje de WhatsApp a un amigo que también tiene empresa, pero publicado en "
        "Twitter. Provocador nunca soberbio. Gracioso nunca forzado. Directo nunca agresivo. "
        "Preferí observación concreta al consejo genérico. Si podés decirlo en 1 oración, no uses 2.\n"
        "TEMAS (elegí UNO al azar): por qué los negocios pierden plata por responder lento, "
        "lo que la IA realmente puede hacer vs lo que la gente cree, IA reemplaza tareas no personas, "
        "contexto argentino importa para implementar IA, el costo de seguir haciendo las cosas "
        "'como siempre', la mayoría no necesita 'más IA' sino resolver un proceso roto primero.\n"
        "Devolvé SOLO el texto del tweet, nada más."
    ),
    "noticias": (
        "Te voy a pasar titulares de noticias de hoy sobre IA, tecnología y negocios en Argentina. "
        "Tu trabajo es elegir LA MÁS relevante para MateOS y escribir UN tweet comentándola.\n"
        "REGLAS: Máximo 280 caracteres. Argentino con voseo. CERO hashtags. Máximo 1 emoji. "
        "NO copies el titular — dá tu opinión como CEO de una empresa de IA. "
        "Conectá la noticia con lo que hacemos: agentes de IA para negocios argentinos. "
        "Pero no seas obvio ('esto demuestra que necesitás nuestros servicios'). "
        "Sé más sutil: comentá la noticia con perspectiva de alguien que labura en esto todos los días.\n"
        "TONO: Informado, con opinión propia, directo. Como si la hubieras leído en el desayuno "
        "y le mandás un voice a tu socio. No la expliques, opiná.\n"
        "Si ningún titular es relevante, ignorá las noticias y hacé un tweet de opinión general "
        "sobre IA y negocios en Argentina.\n"
        "Devolvé SOLO el texto del tweet, nada más."
    ),
}


# =============================================================================
# Helpers
# =============================================================================


def log(msg):
    print(f"[{datetime.now(ART).strftime('%Y-%m-%d %H:%M:%S')}] tweet-scheduler: {msg}")


def truncate_safe(text, limit=277, suffix="..."):
    """Trunca texto a `limit` caracteres sin cortar emojis multi-byte.
    Encode a UTF-8, corta, y decodea ignorando bytes incompletos al final."""
    if len(text) <= limit + len(suffix):
        return text
    encoded = text.encode("utf-8")[:limit * 4]  # generous upper bound
    # Walk character by character to find the last safe cut point
    truncated = ""
    for char in text:
        if len(truncated) + len(char) > limit:
            break
        truncated += char
    return truncated.rstrip() + suffix


def retry(fn, retries=3, delay=5):
    """Ejecuta fn() con reintentos. Para internet intermitente.
    Si fn() retorna False (sentinel), aborta sin reintentar (error no recuperable).
    Si fn() retorna None, reintenta (error de red recuperable).
    """
    for attempt in range(retries):
        try:
            result = fn()
            if result is False:
                # Non-retryable failure (e.g. missing API key)
                return None
            if result is not None:
                return result
        except Exception as e:
            log(f"attempt {attempt + 1}/{retries} failed: {e}")
        if attempt < retries - 1:
            time.sleep(delay * (attempt + 1))  # backoff: 5s, 10s, 15s
    return None


def load_env():
    """Carga .env del deployment."""
    env_file = DEPLOY_DIR / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())


def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_state(state):
    """Escribe state atómicamente: temp file + os.replace()."""
    dir_path = STATE_FILE.parent
    fd, tmp_path = tempfile.mkstemp(dir=dir_path, suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, STATE_FILE)
    except Exception:
        # Limpiar temp file si os.replace() falló
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def notify_telegram(text, parse_mode=None):
    """Envía mensaje a Telegram. Costo: $0."""
    token = TG_BOT_TOKEN or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = TG_CHAT_ID or os.environ.get("TELEGRAM_OWNER_ID", "")
    if not token or not chat_id:
        log("no telegram credentials")
        return False
    payload = {"chat_id": chat_id, "text": text[:4000]}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    data = json.dumps(payload).encode()
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{token}/sendMessage",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=15)
        return True
    except Exception as e:
        log(f"telegram error: {e}")
        return False


def get_telegram_updates(offset=None):
    """Lee mensajes nuevos de Telegram. Costo: $0."""
    token = TG_BOT_TOKEN or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        return []
    url = f"https://api.telegram.org/bot{token}/getUpdates?timeout=5"
    if offset:
        url += f"&offset={offset}"
    try:
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        return data.get("result", [])
    except Exception:
        return []


# =============================================================================
# Slot logic ($0 — puro Python, sin LLM)
# =============================================================================


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
    """Rota tipos de contenido para no repetir el mismo en slots consecutivos."""
    if last_type in CONTENT_TYPES:
        idx = CONTENT_TYPES.index(last_type)
        return CONTENT_TYPES[(idx + 1) % len(CONTENT_TYPES)]
    return CONTENT_TYPES[0]


# =============================================================================
# Tweet generation (Grok/Gemini — NO usa tokens de Anthropic/OpenClaw)
# =============================================================================


def fetch_news_headlines():
    """Scrappea titulares de Google News Argentina. Costo: $0."""
    import xml.etree.ElementTree as ET

    headlines = []
    for feed_url in NEWS_FEEDS:
        try:
            req = urllib.request.Request(
                feed_url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; GauchoBot/1.0)"},
            )
            resp = urllib.request.urlopen(req, timeout=10)
            xml_data = resp.read()
            root = ET.fromstring(xml_data)
            for item in root.findall(".//item")[:5]:
                title = item.find("title")
                if title is not None and title.text:
                    headlines.append(title.text.strip())
        except Exception as e:
            log(f"news fetch failed: {e}")
            continue

    seen = set()
    unique = []
    for h in headlines:
        short = h[:50].lower()
        if short not in seen:
            seen.add(short)
            unique.append(h)
    return unique[:10]


def generate_with_grok(prompt):
    """Genera tweet con Grok API (xAI). Costo: crédito xAI (no Anthropic)."""
    api_key = GROK_API_KEY or os.environ.get("GROK_API_KEY", "")
    if not api_key:
        return None
    try:
        payload = {
            "model": "grok-3-mini",
            "messages": [
                {"role": "system", "content": "Sos Mateo, CEO de MateOS. Respondé SOLO con el tweet, nada más."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 300,
            "temperature": 0.8,
        }
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            "https://api.x.ai/v1/chat/completions",
            data=data,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        )
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        tweet = result["choices"][0]["message"]["content"].strip()
        if tweet.startswith('"') and tweet.endswith('"'):
            tweet = tweet[1:-1]
        return tweet
    except Exception as e:
        log(f"grok failed: {e}")
        return None


def generate_with_gemini(prompt):
    """Genera tweet con Gemini. Costo: gratis (tier gratuito Google).
    Returns: str (tweet), None (network/API failure, retryable), or False (no API key, not retryable).
    """
    google_key = os.environ.get("GOOGLE_API_KEY", "")
    if not google_key:
        try:
            profiles = json.load(open(Path.home() / ".openclaw/agents/main/agent/auth-profiles.json"))
            google_key = profiles.get("profiles", {}).get("google:default", {}).get("key", "")
        except Exception:
            pass
    if not google_key:
        return False  # sentinel: no API key, don't retry
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={google_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
        )
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        tweet = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if tweet.startswith('"') and tweet.endswith('"'):
            tweet = tweet[1:-1]
        return tweet
    except Exception as e:
        log(f"gemini failed: {e}")
        return None


def generate_tweet(content_type):
    """Genera tweet usando Grok (preferido) o Gemini (fallback). NO usa Anthropic."""
    prompt = CONTENT_PROMPTS.get(content_type, CONTENT_PROMPTS["caso_de_uso"])

    news_context = ""
    if content_type == "noticias":
        headlines = fetch_news_headlines()
        if headlines:
            news_lines = "\n".join(f"- {h}" for h in headlines)
            news_context = f"\n\nTITULARES DE HOY:\n{news_lines}\n"
        else:
            log("no news, falling back to opinión")
            prompt = CONTENT_PROMPTS["opinión"]

    full_prompt = (
        "Sos Mateo, CEO de MateOS, una empresa argentina NUEVA que arma agentes de IA para negocios. "
        f"{prompt}"
        f"{news_context}"
        f"{HONESTY_RULES}\n\n"
        "IMPORTANTE: respondé SOLO con el texto del tweet, nada más. "
        "Sin comillas, sin explicación, sin prefijo. Solo el tweet listo para publicar."
    )

    # Intento 1: Grok (sin retry — si no tiene crédito, no insistir)
    tweet = generate_with_grok(full_prompt)
    if tweet:
        return tweet

    # Intento 2: Gemini con retry (internet intermitente)
    tweet = retry(lambda: generate_with_gemini(full_prompt), retries=3, delay=5)
    return tweet


# =============================================================================
# Twitter posting
# =============================================================================


def post_tweet(text):
    """Publica tweet en Twitter/X con timeout, retry y exception handling."""
    api_key = TW_API_KEY or os.environ.get("TWITTER_API_KEY", "")
    api_secret = TW_API_SECRET or os.environ.get("TWITTER_API_SECRET", "")
    access_token = TW_ACCESS_TOKEN or os.environ.get("TWITTER_ACCESS_TOKEN", "")
    access_secret = TW_ACCESS_SECRET or os.environ.get("TWITTER_ACCESS_TOKEN_SECRET", "")

    if not all([api_key, api_secret, access_token, access_secret]):
        return False, "Twitter credentials missing"

    auth = OAuth1(api_key, api_secret, access_token, access_secret)

    last_error = None
    for attempt in range(3):
        try:
            r = requests.post(
                "https://api.x.com/2/tweets",
                json={"text": text},
                auth=auth,
                timeout=30,
            )
            if r.status_code == 201:
                tweet_id = r.json().get("data", {}).get("id", "")
                return True, tweet_id
            else:
                last_error = f"HTTP {r.status_code}: {r.text}"
                # Don't retry on auth errors or bad requests
                if r.status_code in (400, 401, 403):
                    return False, last_error
        except requests.exceptions.RequestException as e:
            last_error = str(e)
            log(f"post_tweet attempt {attempt + 1}/3 failed: {e}")

        if attempt < 2:
            time.sleep(5 * (attempt + 1))  # backoff: 5s, 10s

    return False, last_error or "post_tweet failed after 3 attempts"


# =============================================================================
# Main logic
# =============================================================================


def check_telegram_responses(state):
    """Chequea si el operador respondió a la sugerencia pendiente. Costo: $0."""
    offset = state.get("last_update_id")
    updates = get_telegram_updates(offset)

    expected_chat = TG_CHAT_ID or os.environ.get("TELEGRAM_OWNER_ID", "")

    for update in updates:
        update_id = update["update_id"]
        state["last_update_id"] = update_id + 1
        msg = update.get("message", {})
        text = msg.get("text", "").strip()
        chat_id = str(msg.get("chat", {}).get("id", ""))

        if chat_id != expected_chat:
            continue

        text_lower = text.lower()

        if text_lower in ["✅", "si", "sí", "dale", "enviar", "publicar", "ok"]:
            tweet_text = state.get("draft", "")
            if not tweet_text:
                notify_telegram("⚠️ No hay tweet pendiente para publicar.")
                # Clear draft/pending but preserve last_update_id, last_slot, content_type
                state.pop("pending", None)
                state.pop("draft", None)
                save_state(state)
                return True

            ok, result = post_tweet(tweet_text)
            if ok:
                handle = TWITTER_HANDLE or os.environ.get("TWITTER_HANDLE", "mateos")
                notify_telegram(f"✅ Tweet publicado!\nhttps://x.com/{handle}/status/{result}")
            else:
                notify_telegram(f"❌ Error al publicar: {result}")
            # Clear draft/pending but preserve last_update_id, last_slot, content_type
            state.pop("pending", None)
            state.pop("draft", None)
            state.pop("slot", None)
            state.pop("created_at", None)
            save_state(state)
            return True

        elif text_lower.startswith("✏️") or text_lower.startswith("modificar"):
            new_text = text.replace("✏️", "").replace("modificar", "").replace("Modificar", "").strip()
            if new_text:
                state["draft"] = new_text
                save_state(state)
                notify_telegram(
                    f"🐦 Tweet actualizado:\n\n{new_text}\n\n"
                    f"Respondé: ✅ publicar | ✏️ modificar | ❌ descartar"
                )
            else:
                notify_telegram("Mandame el texto nuevo del tweet.")
            return True

        elif text_lower in ["❌", "no", "descartar", "cancelar"]:
            notify_telegram("❌ Tweet descartado.")
            # Clear draft/pending but preserve last_update_id, last_slot, content_type
            state.pop("pending", None)
            state.pop("draft", None)
            state.pop("slot", None)
            state.pop("created_at", None)
            save_state(state)
            return True

    # No hubo respuesta relevante
    save_state(state)
    return False


LOCK_FILE = DEPLOY_DIR / ".tweet-scheduler.lock"


def main():
    # Acquire exclusive lock — exit silently if another instance is running
    lock_fd = open(LOCK_FILE, "w")
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        # Another instance is running
        lock_fd.close()
        return

    try:
        _main_locked()
    finally:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        lock_fd.close()


def _main_locked():
    load_env()
    state = load_state()
    current_slot = get_current_slot()

    # --- Si hay tweet pendiente: solo chequear Telegram ---
    if state.get("pending"):
        # Chequear si estamos en un NUEVO slot → auto-descartar
        last_slot = state.get("last_slot")
        if current_slot and current_slot != last_slot:
            log(f"new slot {current_slot}, auto-discarding unconfirmed draft")
            notify_telegram("⏭️ Sugerencia anterior descartada (no confirmada a tiempo).")
            # Caemos al bloque de generación abajo
        else:
            # Mismo slot: solo chequear respuesta de Telegram ($0)
            check_telegram_responses(state)
            return

    # --- No hay pendiente o se auto-descartó → ¿toca generar? ---
    if not current_slot:
        log("before first slot of the day, nothing to do")
        return

    last_slot = state.get("last_slot")
    if last_slot == current_slot:
        # Ya se generó para este slot y fue procesado (aprobado/descartado)
        return

    # --- NUEVO SLOT: generar tweet ---
    last_type = state.get("content_type", "")
    new_type = next_content_type(last_type)
    log(f"new slot {current_slot}, generating type={new_type}")

    tweet = generate_tweet(new_type)
    if not tweet:
        log("generation failed")
        notify_telegram("⚠️ Mateo no pudo generar el tweet. Revisá los logs.")
        # Marcar slot como procesado para no reintentar cada 2 min
        state["last_slot"] = current_slot
        state["content_type"] = new_type
        state.pop("pending", None)
        state.pop("draft", None)
        save_state(state)
        return

    # Truncar a 280 (safe: no corta emojis)
    if len(tweet) > 280:
        tweet = truncate_safe(tweet, limit=277, suffix="...")

    # Guardar como pendiente (preserve last_update_id from state)
    now = datetime.now(ART)
    state.update({
        "pending": True,
        "draft": tweet,
        "content_type": new_type,
        "slot": current_slot,
        "last_slot": current_slot,
        "created_at": now.isoformat(),
    })
    save_state(state)

    # Enviar sugerencia a Telegram
    type_labels = {
        "caso_de_uso": "Caso de uso",
        "educativo": "Educativo",
        "noticias": "Noticias",
        "agente": "Agente",
        "opinión": "Opinión",
    }
    label = type_labels.get(new_type, new_type)

    notify_telegram(
        f"🐦 Sugerencia ({label}):\n\n"
        f"{tweet}\n\n"
        f"Respondé: ✅ publicar | ✏️ modificar [texto] | ❌ descartar\n"
        f"(Se auto-descarta en el próximo horario si no respondés)"
    )
    log(f"proposal sent: {label}")


if __name__ == "__main__":
    main()
