# MateOS -- Architecture Document

> Last updated: 2026-03-18

---

## 1. System Overview

### What is MateOS

MateOS (formerly "Gaucho Solutions") is an AI agent platform for Argentine SMEs. Instead of hiring employees for repetitive operational tasks -- customer support, sales follow-up, admin, content creation, tech support -- a business deploys a **squad** of 7 specialized AI agents that work 24/7 on WhatsApp, Telegram, Twitter, and Google Workspace.

Each agent has a distinct personality rooted in Argentine gaucho culture, speaks rioplatense Spanish with natural voseo, and operates within strict autonomy boundaries defined by a Trust Ladder.

### Key Info

| Item | Value |
|------|-------|
| Brand | MateOS |
| CEO Agent | Mateo (was "Marcos") |
| Repo | `git@github.com:fabian416/mateos.git` |
| Frontend | https://mateos.tech |
| EC2 | 54.160.120.210 (ec2-user, key `~/.ssh/lendoor_keys`) |

---

## 2. Single Container Architecture

All 7 agents run inside **one OpenClaw container** (`mateos-agents`), NOT separate containers. This replaced the previous multi-container architecture.

- Uses `agentToAgent` for inter-agent communication (built into OpenClaw)
- Each agent has its own Telegram bot and workspace directory
- ~1.7GB RAM total (vs 6GB+ with separate containers)

### Docker Compose (3 services total)

| Service | Image | Role | Memory Limit |
|---------|-------|------|--------------|
| `caddy` | `caddy:2-alpine` | HTTPS reverse proxy (Let's Encrypt) | 256MB |
| `frontend` | `ghcr.io/fabian416/mateos-hackathon/frontend` | Next.js web app | 512MB |
| `mateos-agents` | `ghcr.io/fabian416/mateos-hackathon/agents` | Single OpenClaw with 7 agents | 4GB |

There is **no agent-router container**. Inter-agent communication happens inside the single OpenClaw process via `sessions_send`.

---

## 3. The 7 Agents

| # | Agent | Telegram Bot | Role |
|---|-------|-------------|------|
| 1 | Mateo CEO | @mateo_ceo_bot | Twitter content, tweet scheduling |
| 2 | El Tropero | @mateos_tropero_bot | Sales, leads, Google Sheets pipeline, Calendar |
| 3 | El Domador | @mateos_domador_bot | Admin, data, reports, Google Sheets |
| 4 | El Rastreador | @mateos_rastreador_bot | Tech support L1, triage |
| 5 | El Relator | @mateos_relator_bot | Content, blog, newsletters |
| 6 | El Paisano | @mateos_paisano_bot | Custom agent |
| 7 | El Baqueano | @mateos_baqueano_bot | Customer support (WhatsApp when enabled) |

All agents start at Trust Level 2 (Draft & Approve).

---

## 4. Inter-Agent Communication

With the single-container architecture, agents communicate via OpenClaw's built-in `sessions_send` tool. There is no external HTTP router or scripts. All agents share the same OpenClaw process and can send messages to each other directly using `sessions_send(sessionKey="agent:<id>:main", message="...")`. See `docs/INTER-AGENT.md` for full details.

---

## 5. Infrastructure

### EC2 Server

| Item | Value |
|------|-------|
| IP | 54.160.120.210 |
| User | ec2-user |
| SSH Key | `~/.ssh/lendoor_keys` |
| Path | `/opt/docker/mateos/` |
| Systemd | `docker-compose@mateos.service` |
| Swap | 8GB configured |

### Key Files on EC2

| Path | Purpose |
|------|---------|
| `/opt/docker/mateos/compose.yml` | Docker Compose config |
| `/opt/docker/mateos/Caddyfile` | HTTPS reverse proxy config |
| `/opt/docker/mateos/mateos/.env` | All tokens and environment config |
| `/opt/docker/mateos/mateos/workspaces/{agent}/` | Per-agent workspace MDs |
| `/opt/docker/mateos/mateos/config/openclaw.json.template` | Multi-agent OpenClaw config |
| `/opt/docker/mateos/mateos/docker-entrypoint.sh` | Container startup script |
| `/opt/docker/mateos/mateos/tweet-scheduler.py` | Mateo CEO tweet scheduler |
| `/opt/docker/mateos/mateos/agents/main/agent/auth-profiles.json` | Google API key |

### Caddy (HTTPS)

Caddy auto-provisions TLS certificates via Let's Encrypt. The `Caddyfile` reverse-proxies `mateos.tech` to the `frontend` container on port 3000. DNS must point to `54.160.120.210`.

---

## 6. CI/CD Pipeline

### GitHub Actions

Only **2 images** are built (was 7+ before):

| Image | Purpose |
|-------|---------|
| `ghcr.io/fabian416/mateos-hackathon/frontend` | Next.js web app |
| `ghcr.io/fabian416/mateos-hackathon/agents` | Single agent image with all 7 agents |

Triggered on push to `main`. Uses Docker Buildx with GitHub Actions cache.

### Auto-Deploy with Watchtower

Watchtower runs on EC2 and monitors GHCR for new image digests. When a new `:latest` is pushed:

1. Watchtower detects the update.
2. Pulls the new image.
3. Recreates the container with the same config.

Full pipeline: `git push main` -> GitHub Actions build -> GHCR push -> Watchtower pull -> container restart.

---

## 7. Google Integrations

| Item | Value |
|------|-------|
| Service Account | `gaucho@signup-workroom-1667850088701.iam.gserviceaccount.com` |
| Sheet ID | `1s0q07UKWiPyhsf9_o1R3uWMNPbZCJ29c7MAbgZP7ZiE` |
| Calendar ID | `945cbda6b9a14d5a7cb6a0bd79ccb3587783bd16f307b0cb2d9da7402f331314@group.calendar.google.com` |
| CLI tool | `gog` (installed in Docker image from steipete/gogcli) |

The service account must be shared on each Sheet/Calendar the agents need to access.

---

## 8. Tweet Scheduler (Mateo CEO)

- Runs as a background process inside the unified `mateos-agents` container
- Script: `tweet-scheduler.py`
- 6 slots/day: 09:00, 11:00, 13:00, 16:00, 19:00, 21:00 ART
- Generates tweets with Gemini (Grok as fallback)
- Auto-discards unconfirmed suggestions when the next slot arrives
- Operator approves/rejects via Telegram

### Twitter API (Free Tier)

- 1,500 tweets/month (sufficient for 3-5 per week)
- Write-only (cannot read timeline or search)

---

## 9. Trust Ladder

| Level | Name | Description |
|-------|------|-------------|
| 1 | Read-Only | Observe, analyze, report. No actions. |
| 2 | Draft & Approve (DEFAULT) | Drafts proposals, operator approves via Telegram. |
| 3 | Act Within Bounds | Executes within predefined limits. Escalates outside bounds. |
| 4 | Full Autonomy | Operates independently. Reports results. Rare. |

All agents start at Level 2.

**Non-negotiable rules at ALL levels:**
- No social media posts without approval.
- No money transfers or contract signing.
- No cross-client data sharing.
- Email is never a trusted command channel.
- When in doubt, ask.

---

## 10. Agent Templates

| Path | Purpose |
|------|---------|
| `agents/_base/` | Shared workspace files, scripts, Docker templates |
| `agents/el-{type}/` | Generic templates with `{{placeholders}}` |
| `agents/deployments/mateos/` | Unified deployment with all workspaces filled |
