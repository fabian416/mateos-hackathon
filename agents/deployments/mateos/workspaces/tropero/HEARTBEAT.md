# HEARTBEAT.md — El Tropero

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker handles cleanup.
3. If it has `pendingMessageId`:
   - Check `channel` field:
     - If "whatsapp" and message is from a lead: draft response based on lead state in Sheets. SLA for new leads is < 5 min.
     - If "email": standard flow, draft based on templates in SOUL.md.
   - If `draft` is missing/null/empty:
     Check `receivedAt`. If < 2 min ago, reply HEARTBEAT_OK. If > 2 min, draft response as fallback:
     a. Read `SOUL.md` for templates and tone
     b. Check lead state in Sheets (if exists) to personalize
     c. Draft response personalized with `fromName`
     d. Save draft in `channel-state.json`
     e. Reply HEARTBEAT_OK
   - If `draft` has content: waiting for operator. Reply HEARTBEAT_OK.
   - If "whatsapp" and pending > 5 min without draft for a new lead: alert operator via Telegram about SLA risk.
4. If empty `{}`: proceed to Pipeline Check.

IMPORTANT: NEVER write to channel-state.json except to save a new draft. NEVER send proposals to Telegram yourself.

---

## Pipeline Check (cada heartbeat si no hay pending message)

### Leads fríos (>48hs sin seguimiento)

1. Leé la planilla de leads en Google Sheets (ver TOOLS.md)
2. Para cada lead con estado `contactado`, `reunión_agendada` o `propuesta_enviada`:
   - Si `Último seguimiento` > 48 horas atrás → alertar al operador:
     > "Lead frío: [nombre] ([estado]) — último contacto hace [X] días. ¿Hago seguimiento?"
3. Si no hay leads fríos, no alertar.

### Reuniones próximas (próximas 24hs)

1. Consultá Google Calendar (ver TOOLS.md)
2. Para cada evento en las próximas 24hs que sea una reunión de ventas:
   - Alertar al operador:
     > "Reunión mañana: [nombre del evento] a las [hora] con [asistentes]. ¿Necesitás que prepare algo?"
3. Si no hay reuniones, no alertar.

### Leads nuevos sin contactar

1. Leé la planilla de leads
2. Si hay leads con estado `nuevo` y `Fecha primer contacto` vacía:
   - Alertar al operador:
     > "Lead nuevo sin contactar: [nombre] ([canal]). ¿Redacto primer contacto?"

---

## Resumen del heartbeat

Al finalizar, responder HEARTBEAT_OK con un resumen breve:

```
HEARTBEAT_OK
- Canal: [estado del channel-state]
- Leads fríos: [cantidad]
- Reuniones próximas 24hs: [cantidad]
- Leads nuevos sin contactar: [cantidad]
```
