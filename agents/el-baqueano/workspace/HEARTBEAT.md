# HEARTBEAT.md — El Baqueano

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker handles cleanup.
3. If it has `pendingMessageId`:
   - Check `channel` field:
     - If "whatsapp" and message is a simple greeting ("hola", "buenas"): draft a warm but brief greeting response. SLA is < 15 min so act fast.
     - If "email": standard flow, SLA is < 4 hours.
   - If `draft` is missing/null/empty:
     Check `receivedAt`. If < 2 min ago, reply HEARTBEAT_OK. If > 2 min, draft response as fallback:
     a. Read `SOUL.md` for templates and tone
     b. Draft response personalized with `fromName`
     c. Save draft in `channel-state.json`
     d. Reply HEARTBEAT_OK
   - If `draft` has content: waiting for operator. Reply HEARTBEAT_OK.
   - If "whatsapp" and pending > 15 min without draft: alert operator via Telegram about SLA risk.
4. If empty `{}`: reply HEARTBEAT_OK

IMPORTANT: NEVER write to channel-state.json except to save a new draft. NEVER send proposals to Telegram yourself.
