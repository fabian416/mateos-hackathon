# Nightly Memory Extraction — Specification

## Overview

Automated job that runs every night to extract durable facts from the day's conversations and update the agent's long-term memory.

## Schedule

- **Time:** 23:00 daily (local time)
- **Frequency:** Once per day
- **Model:** Sonnet

## Process

1. Review all conversations from the current day across all active channels.
2. Extract durable facts: preferences, patterns, corrections, and context that should persist beyond the conversation.
3. Write a daily note summarizing the day's activity.
4. Update the agent's long-term memory file with new information.

## Daily Note Output

Each daily note is written to `memory/YYYY-MM-DD.md` with the following format:

```
# Daily Note — YYYY-MM-DD

## Messages Processed
- WhatsApp: X
- Email: X
- Telegram (operador): X

## Operator Decisions
- Approved: X
- Modified: X
- Discarded: X

## Lessons Learned
- (What the agent got wrong or could improve)

## New Context
- (New facts about the client, their business, preferences, etc.)

## Pending Items
- (Unresolved queries, items escalated, follow-ups needed)
```

## MEMORY.md Updates

After writing the daily note, the extraction job reviews `MEMORY.md` and appends or updates entries based on:

- New client preferences discovered during the day
- Patterns in operator corrections (e.g., tone adjustments, terminology fixes)
- Lessons learned from modified or discarded drafts
- New business context relevant to future interactions

Duplicate or outdated entries should be consolidated, not duplicated.

## Implementation

**Status:** Pending

**Options under consideration:**

- **OpenClaw cron:** Native scheduled task within the platform
- **External script:** Standalone script triggered by system cron or task scheduler
- **Webhook:** Endpoint triggered by an external scheduler (e.g., Cloud Scheduler, GitHub Actions)

The chosen approach should support per-agent execution, meaning each deployed agent runs its own nightly extraction against its own conversation history and memory files.
