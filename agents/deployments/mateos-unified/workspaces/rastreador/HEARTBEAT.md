# HEARTBEAT.md — El Rastreador

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker handles cleanup.
3. If it has `pendingMessageId`:
   - Check `channel` field:
     - If "whatsapp": SLA is < 15 min. Prioriza diagnostico rapido.
       - Si el mensaje describe un error/problema: redacta pregunta de diagnostico inicial (template 1 o 6 de SOUL.md)
       - Si es un saludo simple ("hola", "buenas"): draft respuesta breve preguntando en que puede ayudar
     - If "email": SLA is < 4 horas. Podes tomarte mas tiempo para analizar.
       - Revisa si el problema coincide con {{CLIENT_KNOWN_ISSUES}} antes de redactar
   - If `draft` is missing/null/empty:
     Check `receivedAt`. If < 2 min ago, reply HEARTBEAT_OK. If > 2 min, draft response as fallback:
     a. Read `SOUL.md` for templates and escalation matrix
     b. Read `TOOLS.md` for diagnostic decision tree and known issues
     c. Classify: L1 (resolver) vs L2/L3 (escalar)
     d. Draft response personalized with `fromName`
     e. Save draft in `channel-state.json`
     f. Reply HEARTBEAT_OK
   - If `draft` has content: waiting for operator. Reply HEARTBEAT_OK.
   - If "whatsapp" and pending > 15 min without draft: alert operator via Telegram about SLA risk.
   - If escalation pending > 30 min without action: alert operator via Telegram about escalation SLA risk.
4. If empty `{}`: reply HEARTBEAT_OK

## SLA Monitor

En cada heartbeat, verifica:
- Tickets WhatsApp pendientes > 15 min sin respuesta → alerta SLA
- Tickets Email pendientes > 4 horas sin respuesta → alerta SLA
- Escalamientos pendientes > 30 min sin accion → alerta critica

IMPORTANT: NEVER write to channel-state.json except to save a new draft. NEVER send proposals to Telegram yourself.
