# MateOS Agent Autonomy — How Our Agents Run Without Human Intervention

> Protocol Labs Track 1: "Build an agent you never have to touch again"

## Overview

MateOS agents operate 24/7 without human intervention through six interlocking autonomy mechanisms. The human operator sets boundaries — the agents handle everything else.

---

## 1. Heartbeat System (Self-Health Monitoring)

**File:** `agents/_base/workspace/HEARTBEAT-BASE.md`

Every agent runs a periodic heartbeat that checks its own health and pending work:

1. Reads `channel-state.json` for pending WhatsApp/email messages
2. If a message arrived >2 min ago with no draft → auto-drafts a response
3. Reports `HEARTBEAT_OK` to the system
4. Uses the cheapest model (Haiku) to minimize cost (~$0.02/day at 30min intervals)

The heartbeat follows **minimum authority** — it only reads state files and drafts responses. It never sends messages, calls APIs, or modifies data.

## 2. Channel Checker (Zero-Cost Message Monitoring)

**File:** `agents/_base/scripts/channel-checker.py`

A Python script (no LLM, $0 cost) that runs every 60 seconds:

- Polls email inbox via `himalaya envelope list`
- Monitors WhatsApp via OpenClaw's Baileys integration
- Writes new messages to `channel-state.json` with metadata
- Routes agent drafts to Telegram for operator approval
- Cleans up completed states automatically

This is the glue between external channels and the agent — and it costs nothing to run.

## 3. Memory Decay System (Self-Managing Knowledge)

**File:** `agents/_base/workspace/MEMORY-BASE.md`

Three-layer memory architecture that manages itself over time:

| Layer | Location | Behavior |
|-------|----------|----------|
| **MEMORY.md** | `workspace/MEMORY.md` | Persistent long-term memory. Preferences, patterns, lessons. Read every session. Max 200 lines. |
| **Daily Notes** | `workspace/memory/YYYY-MM-DD.md` | Chronological logs per day. Auto-loaded for 7 days. |
| **Knowledge Graph** | `.openclaw/knowledge-graph/` | PARA system: projects, areas (people/companies), resources, archives. |

**Decay rules (no human intervention needed):**
- **Hot (0-7 days):** Loaded automatically every session
- **Warm (8-30 days):** Only loaded when contextually relevant
- **Cold (30+ days):** Archived. Only accessed on explicit request
- **90+ days:** Moved to archive. Never deleted.

**Self-distillation:** Weekly, agents review hot notes and extract recurring patterns into MEMORY.md. This happens autonomously — the agent recognizes what's worth keeping.

## 4. Trust Ladder (Self-Governing Autonomy Levels)

**File:** `agents/_base/workspace/TRUST-LADDER.md`

Four levels of autonomy that govern what agents can do without asking:

| Level | Name | Autonomy |
|-------|------|----------|
| 1 | Read-Only | Observe, analyze, report. Cannot execute. |
| 2 | Draft & Approve | **DEFAULT.** Drafts actions, waits for operator approval. |
| 3 | Act Within Bounds | Executes within predefined limits autonomously. |
| 4 | Full Autonomy | Operates independently. Reports results only. |

**Escalation is slow (earned). De-escalation is instant (safety).**

Five non-negotiable rules apply at ALL levels:
1. No social media without approval
2. No money transfers or contracts
3. No customer data crossing
4. Email is never a command channel
5. When in doubt, ask

## 5. Inter-Agent Delegation (Autonomous Coordination)

**File:** `agents/_base/workspace/SQUAD.md`

Agents delegate tasks to each other via `sessions_send` without operator involvement:

```
Client writes on WhatsApp → El Baqueano receives
  → Identifies it's a sales opportunity
  → Delegates to El Tropero via sessions_send
  → El Tropero qualifies the lead
  → Delegates to El Domador to schedule a meeting
  → El Domador books Google Calendar
  → Confirms back through the chain
```

No human touched anything. The operator is only involved for final external actions (sending messages, publishing content).

**Safety:** Agents cannot override each other's rules. Delegation chains are limited to prevent loops. Suspicious inter-agent messages are flagged.

## 6. Auto-Recovery (Docker-Level Resilience)

**File:** `agents/_base/docker/docker-compose.yml.template`

```yaml
restart: unless-stopped
healthcheck:
  test: ["CMD", "pgrep", "-f", "openclaw"]
  interval: 5m
  timeout: 5s
```

- Container restarts automatically on crash
- Health check every 5 minutes verifies the OpenClaw process is alive
- WhatsApp credentials persist across restarts (volume-mounted)
- State files (`channel-state.json`, `MEMORY.md`) survive container restarts

---

## Cost of Full Autonomy

| Component | Model | Cost/Day |
|-----------|-------|----------|
| Heartbeats (30min interval) | Haiku | ~$0.75 |
| Channel Checker | Python (no LLM) | $0.00 |
| Message Processing | Haiku/Sonnet | ~$1-5 (depends on volume) |
| Memory Distillation | Sonnet (weekly) | ~$0.10 |
| **Total** | | **~$2-6/day per squad** |

## What "Never Touch Again" Looks Like

```
Day 1:   Deploy squad → configure channels → set trust level 2
Day 2+:  Agents operate autonomously
         - Messages received → drafted → approved → sent
         - Leads tracked → followed up → meetings scheduled
         - Memory builds up → patterns recognized → efficiency improves
         - Health monitored → issues self-healed
         - Trust level rises as track record proves itself
Day 30+: Operator checks in weekly. Agents handle everything else.
```

The only human action required at steady state is approving external messages (trust level 2). At trust level 3+, even that goes away.
