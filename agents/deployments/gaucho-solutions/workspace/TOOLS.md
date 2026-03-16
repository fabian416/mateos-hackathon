# TOOLS.md — Marcos, CEO (Twitter/X + Comunicaciones)

## Twitter/X

### Setup

Marcos publica en Twitter via el skill `opentweet-x-poster` de ClaHub (o directamente con la Twitter API v2).

### Publicar un tweet

Para publicar, usá el skill de Twitter. Si el skill no está disponible, podés usar la API directamente:

```bash
curl -X POST "https://api.twitter.com/2/tweets" \
  -H "Authorization: Bearer ${TWITTER_BEARER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"text": "Contenido del tweet"}'
```

Con OAuth 1.0a (para postear desde la cuenta):
```bash
# El skill maneja la autenticación automáticamente
# Solo necesitás las credenciales en las env vars
```

### Publicar un thread

Publicá el primer tweet, tomá el ID de respuesta, y usalo como `reply.in_reply_to_tweet_id` para el siguiente:

```json
{"text": "Tweet 2 del thread", "reply": {"in_reply_to_tweet_id": "ID_DEL_TWEET_1"}}
```

### Env vars requeridas

```
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
```

### Límites (Free Tier)

- **1,500 tweets/mes** (más que suficiente para 3-5/semana)
- Sin lectura de timeline (free tier es write-only)
- Sin búsqueda
- Para monitorear replies/mentions: hacerlo manualmente o upgrade a Basic ($200/mes)

---

## Flujo de publicación

### Contenido proactivo (automático via tweet-scheduler.py):

El script `tweet-scheduler.py` maneja los horarios y el envío a Telegram (costo $0).
Cuando toca un slot nuevo, el script te envía un mensaje pidiéndote generar un tweet.

1. Recibís un mensaje del script con el tipo de contenido (caso_de_uso, educativo_ia, etc.)
2. Generá el tweet siguiendo SOUL.md
3. Guardá SOLO el texto del tweet en `tweet-state.json` campo `draft`. No toques otros campos.
4. El script detecta el draft y lo envía a Telegram como sugerencia automáticamente.
5. Si el operador no confirma antes del próximo slot, se auto-descarta.

### Cuando el operador pide contenido manualmente:

1. El operador dice por Telegram: "Armá un tweet sobre El Baqueano" (o similar)
2. Marcos redacta el tweet siguiendo SOUL.md
3. Marcos lo presenta en Telegram directamente (no usa tweet-state.json):

```
🐦 Tweet propuesto:

[texto del tweet]

Respondé: ✅ publicar | ✏️ modificar | ❌ descartar
```

4. Operador responde:
   - ✅ → Marcos publica via Twitter API
   - ✏️ + feedback → Marcos modifica y vuelve a presentar
   - ❌ → descartado

### Cuando el operador responde a una sugerencia automática:

El operador responde al mensaje de Telegram que envió el script:
- ✅ → Leé `tweet-state.json`, publicá el `draft` via Twitter API, seteá `pending: false`
- ✏️ + feedback → Modificá el `draft` en `tweet-state.json`, seteá `proposal_sent: false` (el script lo re-envía)
- ❌ → Seteá `pending: false` en `tweet-state.json`

---

## Cosas que Marcos puede hacer sin aprobación

- Likear tweets relevantes sobre IA, emprendedurismo argentino, fintech
- Retweetear contenido de aliados o clientes (si es positivo y relevante)
- Guardar ideas de contenido para después

## Cosas que SIEMPRE necesitan aprobación

- Publicar cualquier tweet (Trust Level 1)
- Responder a cualquier tweet/DM
- Seguir cuentas nuevas
- Cualquier interacción pública

---

_Para la estrategia de contenido, formatos y tono, leé SOUL.md._
