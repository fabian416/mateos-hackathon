# MateOS Agents -- Operations Guide

Server: `54.160.120.210`
Compose file: `agents/deployments/docker-compose.prod.yml`

---

## 1. Daily Operations

### Checking Agent Health

```bash
# SSH into the server
ssh ubuntu@54.160.120.210

# See all containers and their status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check healthcheck status for a specific agent
docker inspect --format='{{.State.Health.Status}}' baqueano-mateos
```

Each agent container runs a healthcheck (`pgrep -f openclaw`) every 5 minutes with 3 retries and a 30s start period. A healthy agent shows `(healthy)` in `docker ps`.

The Agent Router has its own healthcheck hitting `http://localhost:8080/health` every 30s.

### Reviewing Logs

```bash
# Live logs for a specific agent
docker logs -f baqueano-mateos --tail 100

# Channel checker log (inside the container)
docker exec baqueano-mateos cat /home/agent/.openclaw/logs/channel-checker.log

# All agents at once
docker compose -f docker-compose.prod.yml logs --tail 50

# Filter by time
docker logs --since 1h baqueano-mateos
```

The channel-checker writes to `~/.openclaw/logs/channel-checker.log` inside each container. Log lines are timestamped in ISO format.

### Telegram Approval Queue

All agents at Trust Level 2 (the default) use a draft-and-approve workflow:

1. `channel-checker.py` detects a new message (email or WhatsApp).
2. It saves the message to `channel-state.json` and triggers the agent via `openclaw gateway call chat.send`.
3. The agent reads the message, drafts a response, and writes it to the `draft` field in `channel-state.json`.
4. On the next 60s cycle, `channel-checker.py` detects the draft and sends a formatted proposal to Telegram.
5. The operator replies in Telegram: approve, modify, discard, or forget.
6. The agent processes the decision, marks the state as `completed`, and the checker clears it on the next cycle.

If a message stays pending for more than 30 minutes, the checker clears it automatically and notifies via Telegram.

### Monitoring the Agent Router

```bash
# Health check
curl http://localhost:8080/health

# From outside (if exposed)
curl http://54.160.120.210:8080/health

# List active tasks
curl -H "Authorization: Bearer $SQUAD_AUTH_TOKEN" http://localhost:8080/tasks
```

The router runs as `agent-router` on port 8080 (internal Docker network). All agents connect to it via `http://agent-router:8080` and authenticate with the shared `SQUAD_AUTH_TOKEN`.

---

## 2. Channel Management

### WhatsApp

WhatsApp credentials persist in the `baqueano-whatsapp` Docker volume.

```bash
# Initial QR scan (first time or after credential expiry)
docker exec -it baqueano-mateos openclaw channels login --channel whatsapp

# Check if WhatsApp is connected
docker logs baqueano-mateos 2>&1 | grep -i whatsapp

# Volume location
docker volume inspect baqueano-whatsapp
```

**Reconnection:** If WhatsApp disconnects (phone changed, session expired), re-run the QR login command. The volume preserves credentials across container restarts, but not across session revocations from the phone.

**Relevant env vars:**
- `WHATSAPP_ENABLED` -- `true`/`false`
- `WHATSAPP_DM_POLICY` -- `open` (anyone) or `allowlist`
- `WHATSAPP_ALLOW_FROM` -- comma-separated phone numbers (when using allowlist)

### Email (himalaya)

Email uses himalaya with Gmail app passwords. Config is generated from `himalaya.config.toml.template` at container startup via `envsubst`.

```bash
# Test email access from inside the container
docker exec baqueano-mateos himalaya envelope list --folder INBOX -o json

# Check himalaya config
docker exec baqueano-mateos cat ~/.config/himalaya/config.toml
```

**Polling cycle:** `channel-checker.py` runs every 60 seconds. It calls `himalaya envelope list` to check for unread emails. If none exist, no LLM call is made -- cost is $0.

**Relevant env vars:**
- `EMAIL_ENABLED` -- `true`/`false`
- `GMAIL_EMAIL` -- the Gmail address
- `GMAIL_APP_PASSWORD` -- a Gmail App Password (not the account password)
- `GMAIL_DISPLAY_NAME` -- sender display name

**App password setup:** Google Account > Security > 2-Step Verification > App passwords. Generate one for "Mail" and paste it into `GMAIL_APP_PASSWORD`.

### Telegram

Every agent requires Telegram. It is the operator's control channel.

**Relevant env vars:**
- `TELEGRAM_BOT_TOKEN` -- from @BotFather
- `TELEGRAM_OWNER_ID` -- the operator's numeric chat ID
- `TELEGRAM_DM_POLICY` -- `allowlist` (default, only owner) or `open`
- `TELEGRAM_GROUP_POLICY` -- `disabled` (default)

**DM policy:** With `allowlist`, only the `TELEGRAM_OWNER_ID` can interact. This is the recommended setting for production.

**Getting your chat ID:** Send `/start` to `@userinfobot` on Telegram.

### Google Workspace

Google Workspace access (Sheets, Calendar) uses a service account JSON key mounted at runtime.

```bash
# Mount the SA key as a volume (not baked into the image)
# In docker-compose, the key is mounted to the expected path
docker exec baqueano-mateos gog sheets list  # test access
```

The service account must be granted access to the specific Sheets/Calendars it needs. Share the spreadsheet or calendar with the service account email address.

---

## 3. Cost Management

### Model Selection Strategy

| Model | Approx. Cost/Message | Use For |
|-------|---------------------|---------|
| Haiku | ~$0.001 | Heartbeats, templates, classification, tagging |
| Sonnet | ~$0.01 | Content creation, summarization, data extraction |
| Opus | ~$0.05 | Complex reasoning, strategy, multi-variable analysis |

Default model for agents: `anthropic/claude-haiku-4-5` (set via `PRIMARY_MODEL` in `.env`).

Rule: if a task runs more than 2 times per day, use the cheapest model that can handle it. Escalate per-task, never change the agent's default model.

### Heartbeat Frequency and Cost Impact

| Frequency | Estimated Daily Cost (Haiku) |
|-----------|------------------------------|
| Every 5 min | ~$4.00 |
| Every 15 min | ~$1.50 |
| Every 30 min | ~$0.75 |
| Every 1 hour | ~$0.40 |
| Every 4 hours | ~$0.10 |
| Once per day | ~$0.02 |

Default: every 30 minutes for operational agents, every 4 hours for monitoring agents.

If more than 50% of heartbeats are empty (no new data to report), reduce the frequency.

### channel-checker.py: $0 When Idle

The channel checker is a pure Python script -- no LLM involved. It polls email via himalaya and checks `channel-state.json`. If there are no new messages, no agent call is made and the cost is zero. The LLM is only invoked when there is an actual message to process.

### Monitoring Daily Spend

Check your Anthropic dashboard or OpenClaw billing for per-agent token usage. Target: less than $1/agent/day for Haiku-based agents under normal load.

If an agent exceeds 2x the daily target for 3 consecutive days, review heartbeat frequency and model assignments.

---

## 4. Memory System

### Layer 1: MEMORY.md (Persistent)

Location: `workspace/MEMORY.md` inside each agent container.

Read at the start of every session. Contains:
- Operator preferences
- Business patterns
- Lessons learned from past errors
- Durable context

Keep it under 200 lines. Distill, don't accumulate.

### Layer 2: Daily Notes

Location: `workspace/memory/YYYY-MM-DD.md`

One file per day. Each entry follows:
```
## HH:MM - Brief title
- What happened
- What the agent decided
- Result
- Operator feedback (if any)
```

### Temperature (Decay Rules)

| Category | Age | Behavior |
|----------|-----|----------|
| Hot | 0-7 days | Loaded automatically at session start. Active context. |
| Warm | 8-30 days | Not loaded automatically. Consulted only when the current topic requires it. |
| Cold | 30+ days | Not loaded. Only searched on explicit request. Candidate for compression. |

**Transitions:**
- Day 8: Hot to Warm. Anything important should already be distilled into MEMORY.md.
- Day 31: Warm to Cold. Can be compressed into a weekly summary.
- Day 90+: Cold to Archive (`workspace/memory/archive/`). Never delete.

### Weekly Distillation Checklist

1. Did anything repeat 3+ times? Add as a pattern to MEMORY.md.
2. Did the operator correct something? Add as a lesson to MEMORY.md.
3. Is there context needed in 2 weeks? Add as durable context.
4. Did anything change permanently (new policy, new product)? Update MEMORY.md.

---

## 5. Trust Level Management

### Trust Levels

| Level | Name | Description |
|-------|------|-------------|
| 1 | Read-Only | Observe, analyze, report. No actions. |
| 2 | Draft + Approve (DEFAULT) | Drafts proposals, waits for operator approval via Telegram. |
| 3 | Act Within Bounds | Executes within predefined limits without asking. Escalates if outside bounds. |
| 4 | Full Autonomy | Operates independently. Reports results. Rare. |

**Non-negotiable rules at ALL levels:**
- No social media posts without approval.
- No money transfers or contract signing.
- No cross-client data sharing.
- Email is never a trusted command channel.
- When in doubt, ask.

### How to Upgrade

| From | To | Requirements |
|------|-----|-------------|
| 1 | 2 | Agent demonstrated understanding in at least 5 interactions. Operator is satisfied with quality. |
| 2 | 3 | Minimum 2 weeks at Level 2 with no serious errors. Level 3 bounds are documented. Operator approved explicitly. |
| 3 | 4 | Minimum 1 month at Level 3 without exceeding bounds. Low-risk domain. Operator approved explicitly. |

Only the operator can promote. The agent can suggest readiness but never self-promote.

### How to Downgrade

Immediate downgrade if:
- Error impacts a client or causes unauthorized cost.
- Agent acts outside defined bounds.
- Operator loses confidence (no justification needed).
- Significant context change (new client, new domain).
- Any non-negotiable rule is violated.

Rule: downgrading is cheap and fast; upgrading is expensive and slow. When in doubt, downgrade.

---

## 6. Incident Response

### Agent Down

```bash
# Check container status
docker ps -a | grep mateos

# Check logs for crash reason
docker logs --tail 200 baqueano-mateos

# Restart the container
docker restart baqueano-mateos

# If restart fails, recreate
docker compose -f docker-compose.prod.yml up -d baqueano-mateos
```

Check `healthcheck` status. If the container is `unhealthy`, the openclaw process likely crashed.

### Channel Disconnected

**WhatsApp disconnected:**
```bash
# Re-scan QR code
docker exec -it baqueano-mateos openclaw channels login --channel whatsapp
```

**Email not polling:**
```bash
# Test himalaya inside the container
docker exec baqueano-mateos himalaya envelope list --folder INBOX

# If auth fails, check app password in .env and restart
docker restart baqueano-mateos
```

**Telegram not responding:**
- Verify `TELEGRAM_BOT_TOKEN` is correct (test with `curl https://api.telegram.org/bot<TOKEN>/getMe`).
- Verify `TELEGRAM_OWNER_ID` matches the operator's chat ID.
- Check if the bot was blocked by the user or revoked via @BotFather.

### High Cost Alert

1. Check heartbeat frequency. Reduce if more than 50% of heartbeats are empty.
2. Check which model is being used. Ensure the agent is not escalating to Sonnet/Opus for routine tasks.
3. Review `channel-checker.log` for abnormal trigger frequency (e.g., spam emails triggering the agent repeatedly).
4. Consider adding email filters to reduce noise before it reaches the agent.

### Inter-Agent Communication Failure

```bash
# Check router health
docker logs agent-router --tail 50
curl http://localhost:8080/health

# Verify SQUAD_AUTH_TOKEN is consistent across all agents
docker exec baqueano-mateos printenv SQUAD_AUTH_TOKEN
docker exec tropero-mateos printenv SQUAD_AUTH_TOKEN

# Restart the router
docker restart agent-router
```

All agents depend on `agent-router` being healthy (enforced via `depends_on: condition: service_healthy` in the compose file). If the router goes down, agents that depend on inter-agent communication will be affected.

---

## 7. Maintenance

### Updating Workspace Files

Workspace files are mounted as read-only volumes from the host:
```
./mateos-baqueano/workspace:/mnt/workspace:ro
```

At container startup, the entrypoint copies `/mnt/workspace/*` into the agent's working directory. To update:

```bash
# Edit the file on the host
vim /path/to/deployments/mateos-baqueano/workspace/TOOLS.md

# Restart the container to pick up changes
docker restart baqueano-mateos
```

No rebuild needed -- just restart.

### Rotating Secrets

Secrets live in `.env` files per agent (e.g., `mateos-baqueano/.env`).

```bash
# Edit the env file
vim /path/to/deployments/mateos-baqueano/.env

# Restart to apply
docker restart baqueano-mateos
```

Key secrets to rotate periodically:
- `GATEWAY_AUTH_TOKEN`
- `SQUAD_AUTH_TOKEN` (must be updated in ALL agents and the router simultaneously)
- `GMAIL_APP_PASSWORD` (if compromised or expired)
- `TELEGRAM_BOT_TOKEN` (only if compromised; revoke via @BotFather)

### Cleaning Old Logs and Attachments

```bash
# Attachments are auto-cleaned by channel-checker.py after 2 hours
# For manual cleanup inside a container:
docker exec baqueano-mateos rm -rf /home/agent/.openclaw/workspace/attachments/*

# Truncate channel-checker log
docker exec baqueano-mateos truncate -s 0 /home/agent/.openclaw/logs/channel-checker.log

# Clean old daily notes (cold, 90+ days) -- move to archive, never delete
docker exec baqueano-mateos bash -c 'mkdir -p ~/.openclaw/workspace/memory/archive && mv ~/.openclaw/workspace/memory/202[0-4]-*.md ~/.openclaw/workspace/memory/archive/ 2>/dev/null || true'
```

### Docker Volume Management

```bash
# List all volumes
docker volume ls | grep mateos

# Inspect a volume
docker volume inspect baqueano-logs

# Prune unused volumes (careful -- only when agents are running)
docker volume prune
```

Named volumes in the stack: `baqueano-whatsapp`, `baqueano-logs`, `tropero-logs`, `domador-logs`, `rastreador-logs`, `relator-logs`, `mateo-state`, `caddy-data`, `caddy-config`.

The `baqueano-whatsapp` volume holds WhatsApp session credentials. Do not prune it unless you want to re-scan the QR code.

---

## 8. Useful Commands

### Container Management

```bash
# Status of all containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Restart a single agent
docker restart baqueano-mateos

# Restart all agents
docker compose -f docker-compose.prod.yml restart

# Pull latest images and redeploy
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (DESTRUCTIVE)
docker compose -f docker-compose.prod.yml down -v
```

### Logs

```bash
# Follow logs for one agent
docker logs -f baqueano-mateos

# All agent logs
docker compose -f docker-compose.prod.yml logs -f

# Channel checker log
docker exec baqueano-mateos tail -100 /home/agent/.openclaw/logs/channel-checker.log
```

### Agent Inspection

```bash
# Check env vars
docker exec baqueano-mateos printenv | grep -E 'MODEL|TELEGRAM|EMAIL|WHATSAPP|AGENT'

# Check channel state
docker exec baqueano-mateos cat /home/agent/.openclaw/workspace/channel-state.json

# Check memory
docker exec baqueano-mateos cat /home/agent/.openclaw/workspace/MEMORY.md

# List daily notes
docker exec baqueano-mateos ls -la /home/agent/.openclaw/workspace/memory/

# Check openclaw config (redact secrets)
docker exec baqueano-mateos cat /home/agent/.openclaw/openclaw.json
```

### Inter-Agent Router

```bash
# Router health
curl http://localhost:8080/health

# List tasks
curl -H "Authorization: Bearer $SQUAD_AUTH_TOKEN" http://localhost:8080/tasks

# Router logs
docker logs -f agent-router
```

### New Agent Deployment

```bash
# From the agents directory
cd agents/_base
./deploy.sh --client-name mi-empresa --agent-type el-baqueano --channels telegram,whatsapp,email

# Then edit .env, customize workspace files, and start
cd ../deployments/mi-empresa
docker compose up -d
```

### Active Agents (Production)

| Container | Agent Type | Role |
|-----------|-----------|------|
| `mateo-ceo` | CEO Agent | Twitter/strategy |
| `baqueano-mateos` | El Baqueano | Customer support |
| `tropero-mateos` | El Tropero | Sales/leads |
| `domador-mateos` | El Domador | Admin/data |
| `rastreador-mateos` | El Rastreador | Technical support L1 |
| `relator-mateos` | El Relator | Content |
| `agent-router` | Router | Inter-agent communication bus |
