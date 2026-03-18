# INTEGRATIONS.md — Guía de Integraciones

## Estado de integraciones

| Integración | Estado | Skill/Herramienta | Costo | Auth |
|---|---|---|---|---|
| **Telegram** | ✅ Activo | Nativo OpenClaw | $0 | Bot token |
| **Email** | ❌ Deshabilitado | himalaya CLI | $0 | Gmail App Password |
| **Twitter/X** | ⏳ Pendiente | opentweet-x-poster | $0 (free tier, 1500/mes) | API Key + Access Token |
| **WhatsApp** | ❌ Deshabilitado | Nativo OpenClaw (Baileys) | $0 | QR code scan |
| **Google Sheets** | ⏳ Pendiente | Gog CLI (Google Workspace) | $0 | Service Account JSON |
| **Instagram** | ⏳ Pendiente | Meta Graph API | $0 | Business account + review |
| **LinkedIn** | ⏳ Pendiente | LinkedIn API | $0 | OAuth complejo |

---

## Notas para El Relator

El Relator opera principalmente via Telegram con el operador. El contenido que genera se publica manualmente o a través de otros agentes/herramientas. Las integraciones directas de publicación se habilitarán según necesidad.

---

## Checklist de setup para un cliente nuevo

1. [x] Crear bot de Telegram con @BotFather
2. [ ] Configurar email (Gmail + App Password) si usa email
3. [ ] Conectar WhatsApp (QR code) si usa WhatsApp
4. [ ] Crear proyecto Google Cloud + Service Account si usa Sheets/Calendar
5. [ ] Instalar skills según necesidad
