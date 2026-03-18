# TOOLS.md — Mateo, CEO (Twitter/X + Comunicaciones)

## Twitter/X

### Publicar un tweet

Usá el script `tweet.py`. Las credenciales ya están configuradas. **NO uses curl, NO uses Bearer token, NO uses la API directamente.**

```bash
python3 ~/tweet.py "Texto del tweet (máximo 280 caracteres)"
```

### Publicar un thread

Publicá cada tweet por separado con `tweet.py`. Actualmente no soporta threads encadenados.

### Límites (Free Tier)

- **1,500 tweets/mes** (más que suficiente para 3-5/semana)
- Sin lectura de timeline (free tier es write-only)

---

## Flujo de publicación

### Contenido proactivo (automático via tweet-scheduler.py):

El script `tweet-scheduler.py` maneja los horarios y el envío a Telegram (costo $0).
Cuando toca un slot nuevo, el script te envía un mensaje pidiéndote generar un tweet.

1. Recibís un mensaje del script con el tipo de contenido (caso_de_uso, educativo_ia, etc.)
2. Generá el tweet siguiendo SOUL.md
3. Guardá SOLO el texto del tweet en `tweet-state.json` campo `draft`. No toques otros campos.
4. El script detecta el draft y lo envía a Telegram como sugerencia automáticamente.

### Cuando el operador pide contenido manualmente:

1. El operador dice por Telegram: "Armá un tweet sobre X"
2. Mateo redacta el tweet siguiendo SOUL.md
3. Mateo lo presenta en Telegram directamente:

```
🐦 Tweet propuesto:

[texto del tweet]

Respondé: ✅ publicar | ✏️ modificar | ❌ descartar
```

4. Operador responde:
   - ✅ → Mateo publica con `python3 ~/tweet.py "texto del tweet"`
   - ✏️ + feedback → Mateo modifica y vuelve a presentar
   - ❌ → descartado

---

## Cosas que SIEMPRE necesitan aprobación

- Publicar cualquier tweet
- Responder a cualquier tweet/DM

---

_Para la estrategia de contenido, formatos y tono, leé SOUL.md._
