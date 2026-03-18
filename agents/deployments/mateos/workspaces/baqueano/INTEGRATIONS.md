# INTEGRATIONS.md — Guía de Integraciones

## Estado de integraciones

| Integración | Estado | Skill/Herramienta | Costo | Auth |
|---|---|---|---|---|
| **Telegram** | ✅ Activo | Nativo OpenClaw | $0 | Bot token |
| **Email** | ✅ Activo | himalaya CLI | $0 | Gmail App Password |
| **Twitter/X** | ✅ Configurado | opentweet-x-poster | $0 (free tier, 1500/mes) | API Key + Access Token |
| **WhatsApp** | ✅ Configurado | Nativo OpenClaw (Baileys) | $0 | QR code scan |
| **Google Sheets** | ✅ Configurado | Gog CLI (Google Workspace) | $0 | Service Account JSON |
| **Google Calendar** | ✅ Configurado | Gog CLI (Google Workspace) | $0 | Service Account JSON |
| **Instagram** | ⏳ Pendiente | Meta Graph API | $0 | Business account + review |
| **LinkedIn** | ⏳ Pendiente | LinkedIn API | $0 | OAuth complejo |
| **Notion** | ⏳ Pendiente | clawhub skill | $0 | API key |
| **CRM (HubSpot)** | ⏳ Pendiente | clawhub skill | $0 (free tier) | API key |

---

## WhatsApp (Baileys — nativo OpenClaw)

### Qué es
Canal nativo de OpenClaw que usa la librería Baileys para conectarse a WhatsApp via WebSocket. Gratis, sin necesidad de Meta Business API.

### Setup

**1. Habilitar en .env:**
```
WHATSAPP_ENABLED=true
WHATSAPP_DM_POLICY=open
WHATSAPP_ALLOW_FROM=
```

**2. Ya está en openclaw.json.template** — el bloque `whatsapp` se activa automáticamente con `WHATSAPP_ENABLED=true`.

**3. Después de `docker compose up`, conectar WhatsApp:**
```bash
docker exec -it <container> openclaw channels login --channel whatsapp
```
Esto muestra un QR code. Escanealo con WhatsApp (Ajustes > Dispositivos vinculados > Vincular dispositivo).

**4. Credenciales se guardan** en el volumen Docker `whatsapp-creds`. No necesitás re-escanear salvo que el teléfono se desconecte >14 días.

### Recomendaciones
- Usá un **número dedicado** (no tu personal) — riesgo de ban por ser API no oficial
- Mantené el teléfono conectado a internet
- No hagas spam — mantené volumen bajo y natural
- Si el número se banea, MateOS no pierde nada — el agente sigue funcionando por email/Telegram

### Limitaciones
- Write-only en free tier de WhatsApp (no podés leer el timeline como en la API oficial)
- WhatsApp puede actualizar su protocolo y romper Baileys temporalmente
- No soporta mensajes interactivos (botones, listas) como la API oficial

---

## Google Sheets (API gratuita)

### Qué es
Permite al agente leer y escribir spreadsheets de Google. Útil para:
- **El Tropero**: trackear leads, pipeline de ventas
- **El Domador**: reportes, datos, inventario
- **El Baqueano**: registrar consultas, métricas de soporte

### Setup

**1. Crear proyecto en Google Cloud Console:**
- Ir a [console.cloud.google.com](https://console.cloud.google.com)
- Crear proyecto nuevo (ej: "gaucho-agents")
- Habilitar Google Sheets API (APIs & Services > Library > "Google Sheets API" > Enable)

**2. Crear Service Account (recomendado para agentes):**
- IAM & Admin > Service Accounts > Create Service Account
- Nombre: `gaucho-agent`
- Rol: no necesita rol de proyecto (accede por compartir sheets)
- Crear key > JSON > Descargar

**3. Compartir el spreadsheet:**
- Abrir el Google Sheet que el agente necesita
- Compartir con el email del service account (ej: `gaucho-agent@tu-proyecto.iam.gserviceaccount.com`)
- Darle permiso de Editor

**4. Configurar en el agente:**

En `.env`:
```
GOOGLE_ENABLED=true
GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
```

**5. Instalar skill Gog (Google Workspace CLI):**
```bash
clawhub install gog
```

### Comandos disponibles

```bash
# Leer un rango
gog sheets get <spreadsheetId> "Sheet1!A1:D10" --json

# Escribir datos
gog sheets update <spreadsheetId> "Sheet1!A1" --values-json '[["nombre","email","estado"],["Juan","juan@x.com","nuevo"]]'

# Agregar fila al final
gog sheets append <spreadsheetId> "Sheet1!A1" --values-json '[["nuevo lead","tel","fecha"]]' --insert INSERT_ROWS

# Leer metadata del sheet
gog sheets get <spreadsheetId> --json
```

### Quotas (gratis)
- 300 requests/minuto por proyecto
- 60 requests/minuto por usuario
- Sin límite diario
- Si excedés: error 429 (no cobra, solo esperar)

### Casos de uso por agente

**El Tropero (ventas):**
```
Sheet: "Pipeline de Ventas"
Columnas: Nombre | Email | WhatsApp | Estado | Fecha primer contacto | Último seguimiento | Notas
```

**El Domador (admin):**
```
Sheet: "Reportes Diarios"
Columnas: Fecha | Mensajes procesados | Aprobados | Rechazados | Escalados | Notas
```

**El Baqueano (soporte):**
```
Sheet: "Registro de Consultas"
Columnas: Fecha | Canal | Cliente | Tema | Estado | Tiempo respuesta | Satisfacción
```

---

## Google Calendar (API gratuita)

### Qué es
Permite al agente leer y crear eventos en Google Calendar. Útil para:
- **El Tropero**: agendar reuniones con leads
- **El Domador**: recordatorios, deadlines
- **El Baqueano**: agendar turnos/citas para clientes

### Setup

**1. En el mismo proyecto de Google Cloud Console:**
- Habilitar Google Calendar API (APIs & Services > Library > "Google Calendar API" > Enable)
- Usar el mismo Service Account creado para Sheets

**2. Compartir el calendario:**
- Abrir Google Calendar > Settings > el calendario que querés
- "Share with specific people" > agregar email del service account
- Permiso: "Make changes to events"

**3. El skill Gog ya incluye Calendar** — no necesitás instalar nada extra.

### Comandos disponibles

```bash
# Listar eventos de hoy
gog calendar events primary --from "$(date -I)" --to "$(date -I -d tomorrow)" --json

# Listar eventos de esta semana
gog calendar events primary --from "2026-03-16" --to "2026-03-22" --json

# Crear evento
gog calendar create primary \
  --title "Reunión con Juan - MiPyME" \
  --start "2026-03-20T10:00:00-03:00" \
  --end "2026-03-20T10:30:00-03:00" \
  --description "Consulta sobre agente de soporte"

# Crear evento con invitados
gog calendar create primary \
  --title "Demo MateOS" \
  --start "2026-03-21T15:00:00-03:00" \
  --end "2026-03-21T15:30:00-03:00" \
  --attendees "cliente@empresa.com"
```

### Quotas (gratis)
- 1,000,000 requests/día por proyecto
- Más que suficiente para cualquier uso de agentes

### Casos de uso por agente

**El Tropero (ventas):**
- Agendar calls con leads después de calificarlos
- Enviar recordatorio 24hs antes via WhatsApp
- Registrar reuniones completadas en Google Sheets

**El Domador (admin):**
- Crear recordatorios de deadlines
- Agendar tareas recurrentes
- Alertar al operador sobre eventos próximos

**El Baqueano (soporte):**
- Agendar turnos/citas para clientes
- Consultar disponibilidad antes de proponer horarios

---

## Checklist de setup para un cliente nuevo

1. [ ] Crear bot de Telegram con @BotFather
2. [ ] Configurar email (Gmail + App Password) si usa email
3. [ ] Conectar WhatsApp (QR code) si usa WhatsApp
4. [ ] Crear proyecto Google Cloud + Service Account si usa Sheets/Calendar
5. [ ] Compartir sheets y calendarios con el service account
6. [ ] Instalar skills: `clawhub install himalaya gog`
7. [ ] Si usa Twitter: crear app en developer.twitter.com + `clawhub install opentweet-x-poster`
