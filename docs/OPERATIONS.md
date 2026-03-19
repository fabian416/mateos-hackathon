# MateOS -- Operations Guide

> Last updated: 2026-03-18

Server: `54.160.120.210` (ec2-user, key `~/.ssh/lendoor_keys`)
Path: `/opt/docker/mateos/`
Systemd: `docker-compose@mateos.service`

---

## 1. CRITICAL RULES

- **NEVER** use `--force-recreate` on the `mateos-agents` container -- it loses WhatsApp session.
- Use `docker compose restart mateos-agents` instead.
- `NODE_OPTIONS=--max-old-space-size=3072` is required for OpenClaw in the container.
- DNS for `mateos.tech` must point to `54.160.120.210`.

---

## 2. Daily Operations

### Checking Health

```bash
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210

# All containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Agent container logs
docker logs -f mateos-agents --tail 100

# Frontend
curl -I https://mateos.tech

# Memory usage
docker stats --no-stream
```

### Telegram Approval Queue

All agents at Trust Level 2 (default) use draft-and-approve:

1. Agent receives a message (WhatsApp, email, inter-agent).
2. Agent drafts a response.
3. Draft is sent to operator via Telegram for approval.
4. Operator replies: approve / modify / discard.
5. Agent sends the approved response.

If a draft stays pending > 30 minutes, it is auto-cleared with a Telegram notification.

---

## 3. Channel Management

### WhatsApp

WhatsApp session is inside the `mateos-agents` container.

```bash
# Initial QR scan (first time or after session expiry)
docker exec -it mateos-agents openclaw channels login --channel whatsapp

# Check connection
docker logs mateos-agents 2>&1 | grep -i whatsapp
```

**Reconnection:** If WhatsApp disconnects, re-run the QR login command. NEVER recreate the container.

**Env vars:**
- `WHATSAPP_ENABLED` -- true/false
- `WHATSAPP_DM_POLICY` -- open / allowlist
- `WHATSAPP_ALLOW_FROM` -- comma-separated phone numbers

### Email (himalaya)

```bash
# Test email access
docker exec mateos-agents himalaya envelope list --folder INBOX -o json

# Check config
docker exec mateos-agents cat ~/.config/himalaya/config.toml
```

Polling: every 60 seconds. No LLM call if no new emails ($0 when idle).

**Env vars:**
- `EMAIL_ENABLED` -- true/false
- `GMAIL_EMAIL` -- Gmail address
- `GMAIL_APP_PASSWORD` -- App Password (not account password)
- `GMAIL_DISPLAY_NAME` -- sender name

### Telegram

Every agent has its own Telegram bot. Operator control channel.

**Env vars (per agent):**
- `TELEGRAM_BOT_TOKEN` -- from @BotFather (7 different tokens)
- `TELEGRAM_OWNER_ID` -- operator's numeric chat ID
- `TELEGRAM_DM_POLICY` -- allowlist (default, only owner)

### Google Workspace

```bash
# Test Sheets access
docker exec mateos-agents gog sheets list
```

Service Account: `gaucho@signup-workroom-1667850088701.iam.gserviceaccount.com`
Sheet ID: `1s0q07UKWiPyhsf9_o1R3uWMNPbZCJ29c7MAbgZP7ZiE`
Calendar ID: `945cbda6...@group.calendar.google.com`

Share Sheets/Calendars with the service account email.

---

## 4. Cost Management

### Model Selection

| Model | ~Cost/Message | Use For |
|-------|--------------|---------|
| Haiku | ~$0.001 | Heartbeats, templates, classification |
| Sonnet | ~$0.01 | Content creation, summarization |
| Opus | ~$0.05 | Complex reasoning, strategy |

Default: `anthropic/claude-haiku-4-5`. If a task runs > 2x/day, use the cheapest viable model.

### $0 When Idle

The channel checker is pure Python -- no LLM. If there are no new messages, no agent call is made. Cost is zero when idle.

Target: < $1/agent/day for Haiku-based agents under normal load.

---

## 5. Memory System

### MEMORY.md (Persistent)

Per-agent file in workspace. Read at session start. Contains operator preferences, patterns, lessons. Keep under 200 lines.

### Daily Notes

`workspace/memory/YYYY-MM-DD.md` -- one per day per agent.

### Temperature (Decay)

| Age | Status | Behavior |
|-----|--------|----------|
| 0-7 days | Hot | Auto-loaded at session start |
| 8-30 days | Warm | Consulted only when relevant |
| 30+ days | Cold | Only on explicit request |
| 90+ days | Archive | Move to `memory/archive/`, never delete |

---

## 6. Trust Level Management

| Level | Name | Description |
|-------|------|-------------|
| 1 | Read-Only | Observe, analyze, report |
| 2 | Draft & Approve (DEFAULT) | Drafts, operator approves via Telegram |
| 3 | Act Within Bounds | Autonomous within limits, escalates outside |
| 4 | Full Autonomy | Independent, reports results |

**Upgrade path:** L1->L2 (5+ good interactions) -> L2->L3 (2+ weeks, no errors) -> L3->L4 (1+ month, low-risk).

Only the operator can promote. Downgrade is immediate if: error impacts client, agent exceeds bounds, operator loses confidence, or non-negotiable rule violated.

---

## 7. Incident Response

### Agent Container Down

```bash
# Check status
docker ps -a | grep mateos-agents

# Check logs
docker logs --tail 200 mateos-agents

# Restart (safe for WhatsApp)
docker compose restart mateos-agents

# If restart fails
cd /opt/docker/mateos
docker compose up -d mateos-agents
```

### Out of Memory

```bash
docker stats --no-stream
free -h
swapon --show   # Should show 8GB
```

Container has 4GB limit + `NODE_OPTIONS=--max-old-space-size=3072`.

### WhatsApp Disconnected

```bash
docker exec -it mateos-agents openclaw channels login --channel whatsapp
# Scan QR with phone
```

### Telegram Not Responding

- Verify bot token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- Verify `TELEGRAM_OWNER_ID` matches operator's chat ID
- Check if bot was blocked or revoked via @BotFather

### Tweet Scheduler Issues

```bash
docker exec mateos-agents ps aux | grep tweet-scheduler
docker exec mateos-agents tail -100 /path/to/tweet-scheduler.log
```

---

## 8. Maintenance

### Updating Workspace Files

```bash
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210
cd /opt/docker/mateos/mateos/workspaces/<agent>/
vi TOOLS.md
# Restart to pick up changes
cd /opt/docker/mateos
docker compose restart mateos-agents
```

### Rotating Secrets

Edit `/opt/docker/mateos/mateos/.env`, then restart:

```bash
docker compose restart mateos-agents
```

Secrets to rotate periodically:
- `GMAIL_APP_PASSWORD` (if compromised)
- `TELEGRAM_BOT_TOKEN` (only if compromised; revoke via @BotFather)
- Twitter API keys (if compromised)

### Cleaning Old Data

```bash
# Inside the container
docker exec mateos-agents bash -c 'rm -rf /home/agent/.openclaw/workspace/attachments/*'

# Archive old daily notes (90+ days)
docker exec mateos-agents bash -c 'mkdir -p ~/.openclaw/workspace/memory/archive && mv ~/.openclaw/workspace/memory/202[0-4]-*.md ~/.openclaw/workspace/memory/archive/ 2>/dev/null || true'
```

---

## 9. Quick Reference Commands

```bash
# SSH
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210

# Container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Agent logs
docker logs -f mateos-agents --tail 100

# Restart agents (SAFE for WhatsApp)
cd /opt/docker/mateos && docker compose restart mateos-agents

# Pull latest and redeploy
cd /opt/docker/mateos && docker compose pull && docker compose up -d

# Memory usage
docker stats --no-stream

# WhatsApp re-auth
docker exec -it mateos-agents openclaw channels login --channel whatsapp

# Test Google Sheets
docker exec mateos-agents gog sheets list

# Test email
docker exec mateos-agents himalaya envelope list --folder INBOX -o json

# Stop everything
cd /opt/docker/mateos && docker compose down
```

### Active Services (Production)

| Container | Role |
|-----------|------|
| `mateos-agents` | All 7 agents (single OpenClaw container) |
| `frontend` | Next.js web app |
| `caddy` | HTTPS reverse proxy |
