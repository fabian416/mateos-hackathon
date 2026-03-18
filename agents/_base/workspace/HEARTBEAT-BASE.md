# HEARTBEAT-BASE.md

## Channel Check

El heartbeat solo necesita revisar `channel-state.json` para mensajes de **email/WhatsApp** pendientes. Los mensajes de **Telegram se responden directamente** — no pasan por channel-state.json.

1. Read `channel-state.json`
2. If empty `{}` or has no `pendingMessageId`: reply HEARTBEAT_OK
3. If it has a `completed` field: reply HEARTBEAT_OK (el channel-checker limpia)
4. If it has `pendingMessageId` (email/WhatsApp pendiente):
   - If `draft` has content: waiting for operator approval. Reply HEARTBEAT_OK.
   - If `draft` is missing/empty and `receivedAt` > 2 min ago (fallback):
     a. Read `SOUL.md` for tono y templates
     b. Draft a response, save in `channel-state.json` field `draft`
     c. Reply HEARTBEAT_OK

IMPORTANT: Do NOT write to channel-state.json for Telegram messages. Solo para email/WhatsApp.
IMPORTANT: Do NOT send proposals to Telegram yourself. El channel-checker lo hace.

## Minimum Authority

The heartbeat runs frequently and with a cheap model. Keep its scope minimal:
- Only read channel-state.json and SOUL.md (when drafting).
- Never read, modify, or delete files outside its scope.
- Never execute external commands (email, API calls, etc.) — those are for the main agent session.
- If something looks wrong in channel-state.json, report HEARTBEAT_OK and let the main session handle it.
