# SERVICES.md — Matriz de Acceso por Agente

## Servicios disponibles

| Servicio   | Baqueano | Tropero | Domador | Rastreador | Relator | CEO (Marcos) |
|------------|----------|---------|---------|------------|---------|--------------|
| Telegram   | ✅       | ✅      | ✅      | ✅         | ✅      | ✅           |
| Email      | ✅       | ✅      | ✅      | ✅         | ❌      | ✅           |
| WhatsApp   | ✅       | ✅      | ❌      | ❌         | ❌      | ✅           |
| Sheets     | ❌       | ✅      | ✅      | ❌         | ❌      | ✅           |
| Calendar   | ❌       | ❌      | ✅      | ❌         | ❌      | ✅           |
| Twitter/X  | ❌       | ❌      | ❌      | ❌         | ✅      | ✅           |
| Web        | ✅       | ✅      | ❌      | ✅         | ✅      | ✅           |

## Credenciales (variables de entorno)

| Servicio   | Variable(s)                                        |
|------------|----------------------------------------------------|
| Telegram   | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_ID`          |
| Email      | `GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`                |
| WhatsApp   | Sesión interna de OpenClaw (login con QR)          |
| Sheets     | `GOG_SERVICE_ACCOUNT` o credenciales gog           |
| Calendar   | `GOG_SERVICE_ACCOUNT` o credenciales gog           |
| Twitter/X  | `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET` |
| Web        | Sin credenciales (skills nativas browser/search)   |

## Notas

- Cada agente solo debe usar los servicios marcados con ✅ para su rol.
- Si necesitás un servicio que no tenés, delegá al agente correcto con `delegate.py`.
- Las credenciales nunca se leen directamente — están inyectadas en el entorno del container.
