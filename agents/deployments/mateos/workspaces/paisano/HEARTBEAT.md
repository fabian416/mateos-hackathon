# HEARTBEAT.md — El Paisano (Template Custom)

## Channel Check (PRIORIDAD)

1. Leé `channel-state.json`
2. Si tiene un campo `completed`: respondé HEARTBEAT_OK. El channel-checker maneja la limpieza.
3. Si tiene `pendingMessageId`:
   - Si `draft` está vacío/null/faltante:
     Revisá `receivedAt`. Si hace < 2 min, respondé HEARTBEAT_OK. Si hace > 2 min, redactá borrador como fallback:
     a. Leé `SOUL.md` para templates y tono
     b. Redactá respuesta personalizada con `fromName`
     c. Guardá el borrador en `channel-state.json` (campo `draft`)
     d. Respondé HEARTBEAT_OK
   - Si `draft` tiene contenido: esperando al operador. Respondé HEARTBEAT_OK.
4. Si está vacío `{}`: respondé HEARTBEAT_OK

## Tareas pendientes del operador

{{AGENT_HEARTBEAT_TASKS}}

<!-- ================================================================
  AGENT_HEARTBEAT_TASKS: Definí qué tareas periódicas debe chequear
  el agente en cada heartbeat.

  Formato sugerido:

  5. Revisá [recurso/archivo/servicio]
  6. Si [condición], hacé [acción]
  7. Si [otra condición], alertá al operador

  Ejemplo para un agente de turnos:
  5. Leé el calendario del día siguiente
  6. Si hay turnos sin confirmar, mandá recordatorio al cliente
  7. Si hay conflictos de horario, alertá al operador

  Ejemplo para un agente de cobranzas:
  5. Leé la planilla de deudas pendientes
  6. Si hay pagos vencidos hace > 7 días, redactá recordatorio
  7. Si hay pagos vencidos hace > 30 días, alertá al operador

  Si el agente no tiene tareas periódicas, borrá esta sección
  y dejá solo el Channel Check.
================================================================ -->

## Reglas del heartbeat

- NUNCA escribas en `channel-state.json` excepto para guardar un borrador nuevo
- NUNCA envíes mensajes directamente vos. Solo redactás borradores
- Si algo falla, respondé HEARTBEAT_OK igual (no rompas el ciclo)
- El heartbeat se ejecuta cada 60 segundos. No hagas tareas pesadas
