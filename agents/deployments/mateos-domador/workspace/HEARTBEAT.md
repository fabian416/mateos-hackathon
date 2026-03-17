# HEARTBEAT.md — El Domador

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker handles cleanup.
3. If it has `pendingMessageId`:
   - If `draft` is missing/null/empty:
     Check `receivedAt`. If < 2 min ago, reply HEARTBEAT_OK. If > 2 min, draft response as fallback:
     a. Read `SOUL.md` for templates and tone
     b. Draft response personalized with context
     c. Save draft in `channel-state.json`
     d. Reply HEARTBEAT_OK
   - If `draft` has content: waiting for operator. Reply HEARTBEAT_OK.
4. If empty `{}`: continue to Admin Checks.

## Admin Checks

### 1. Tareas vencidas en Sheets

1. Leé la planilla de tareas activa
2. Buscá tareas con fecha de vencimiento anterior a hoy y estado != "completada"
3. Si hay tareas vencidas:
   - Generá alerta usando template "Alerta de tarea pendiente/vencida" de SOUL.md
   - Guardá en `channel-state.json` como draft para aprobación
4. Si no hay: continuá

### 2. Deadlines próximos (< 48hs)

1. Leé Google Calendar para eventos de las próximas 48 horas
2. Leé la planilla de tareas buscando vencimientos en las próximas 48 horas
3. Si hay deadlines próximos:
   - Generá recordatorio usando template "Recordatorio de deadline" de SOUL.md
   - Guardá en `channel-state.json` como draft para aprobación
4. Si no hay: continuá

### 3. Resumen diario (si es horario programado)

1. Chequeá si es la hora del resumen diario (configurable, default 09:00 ART)
2. Si es la hora y no se envió hoy:
   - Leé planilla de tareas + calendar
   - Generá resumen usando template "Resumen diario" de SOUL.md
   - Guardá en `channel-state.json` como draft
3. Si no es la hora o ya se envió: continuá

### 4. Reporte semanal (si es lunes)

1. Chequeá si es lunes y la hora del reporte semanal (default 09:00 ART)
2. Si corresponde y no se envió esta semana:
   - Compilá datos de la semana anterior
   - Generá reporte usando template "Reporte semanal" de SOUL.md
   - Guardá en `channel-state.json` como draft
3. Si no corresponde: continuá

### 5. Emails pendientes de procesar

1. Chequeá bandeja de entrada por nuevos emails con facturas/documentos
2. Si hay emails nuevos:
   - Clasificá el documento
   - Registrá en la planilla correspondiente
   - Generá confirmación usando template "Procesamiento de factura/documento"
   - Guardá en `channel-state.json` como draft
3. Si no hay: reply HEARTBEAT_OK

IMPORTANT: NEVER write to channel-state.json except to save a new draft. NEVER send proposals to Telegram yourself.
