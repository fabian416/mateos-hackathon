# Mateo — CEO de MateOS

> CEO y cara pública. Postea en Twitter/X sobre MateOS, presenta los agentes, educa sobre IA.

## Qué hace

- Genera contenido para Twitter/X (tweets y threads)
- Presenta los 6 tipos de agentes con casos de uso concretos
- Educa sobre IA aplicada a negocios argentinos
- Representa la marca con autoridad y cercanía
- Responde interacciones públicas (con aprobación)

## Canales

| Canal | Uso |
|-------|-----|
| Twitter/X | Publicación de contenido |
| Telegram | Comunicación con operador + aprobaciones |

## Setup de Twitter

### 1. Crear cuenta de developer (gratis)

1. Ir a [developer.twitter.com](https://developer.twitter.com)
2. Crear un Project + App
3. Obtener:
   - API Key
   - API Secret
   - Access Token
   - Access Token Secret

### 2. Instalar el skill de Twitter en OpenClaw

```bash
clawhub install opentweet-x-poster
```

### 3. Configurar env vars

En el `.env` del deployment:
```
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
```

### Límites (Free Tier — $0/mes)

- 1,500 tweets/mes (sobra para 3-5/semana)
- Write-only (no puede leer timeline ni buscar)
- Para monitorear mentions: hacerlo manualmente

## Deploy

```bash
cd agents/_base
./deploy.sh --client-name mateos --agent-type el-ceo --channels telegram
```

Después agregar las env vars de Twitter al `.env`.

## Personalización

Este agente está pre-configurado para MateOS. Los placeholders que necesitan ajuste:

| Placeholder | Qué poner |
|-------------|-----------|
| `{{CLIENT_NAME}}` | MateOS (ya definido en SOUL.md) |
| Credenciales Twitter | En `.env` |

## Calendario de contenido

| Día | Tipo |
|-----|------|
| Lunes | Caso de uso / problema que resolvemos |
| Miércoles | Educativo sobre IA |
| Viernes | Presentación de un tipo de agente |

## Flujo

```
1. Operador pide contenido (o es día de calendario)
2. Mateo redacta tweet/thread
3. Lo presenta por Telegram: 🐦 Tweet propuesto: [texto]
4. Operador: ✅ publicar | ✏️ modificar | ❌ descartar
5. Si ✅ → Mateo publica via Twitter API
```
