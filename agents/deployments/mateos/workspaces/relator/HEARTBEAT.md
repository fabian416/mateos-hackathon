# HEARTBEAT.md — El Relator

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker handles cleanup.
3. If it has `pendingMessageId`:
   - If `draft` is missing/null/empty:
     Check `receivedAt`. If < 2 min ago, reply HEARTBEAT_OK. If > 2 min, draft response as fallback:
     a. Read `SOUL.md` for tone and format guidelines
     b. Draft response personalized with `fromName`
     c. Save draft in `channel-state.json`
     d. Reply HEARTBEAT_OK
   - If `draft` has content: waiting for operator. Reply HEARTBEAT_OK.
4. If empty `{}`: reply HEARTBEAT_OK

IMPORTANT: NEVER write to channel-state.json except to save a new draft. NEVER send proposals to Telegram yourself.

---

## Content Scheduling

Content scheduling (editorial calendar, publication timing) is handled externally by the operador. El Relator does NOT manage its own publication schedule. When the operador sends a brief, El Relator redacta. Outside of that, HEARTBEAT_OK.
