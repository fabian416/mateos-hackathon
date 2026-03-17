# HEARTBEAT-BASE.md

## Channel Check (PRIORITY)

1. Read `channel-state.json`
2. If it has a `completed` field: reply HEARTBEAT_OK. The channel-checker script will handle cleanup and next-message processing within 1 minute. Do NOT process, modify, or clear this state.
3. If it has `pendingMessageId`:
   - If the `draft` field is missing, null, or empty string "":
     Check the `receivedAt` field. If the message arrived less than 2 minutes ago, reply HEARTBEAT_OK and do nothing — the channel-checker already triggered the agent to handle it. Only proceed if `receivedAt` is more than 2 minutes ago (fallback).
     a. Read `SOUL.md` for tono, estructura de mensaje, vocabulario y templates
     b. Draft a response (personalizar con nombre si hay `fromName`)
     c. Save the draft in `channel-state.json` (field `draft`)
     d. Reply HEARTBEAT_OK — the channel-checker script will send the proposal to Telegram automatically.
   - If `draft` has actual content (not empty): The message is waiting for user response. Reply HEARTBEAT_OK.
4. If channel-state.json is empty `{}` or has no pendingMessageId: reply HEARTBEAT_OK

IMPORTANT: The heartbeat must NEVER write to channel-state.json except in step 3c (saving a draft for a new message). If channel-state.json is `{}` or has a `completed` field, do NOT touch it.

IMPORTANT: Do NOT send the proposal to Telegram yourself. The channel-checker script handles that automatically.
