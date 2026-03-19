# MateOS -- Deployment Guide

> Last updated: 2026-03-18

---

## 1. Prerequisites

### Server Requirements

- EC2 instance (current: 54.160.120.210, ec2-user, key `~/.ssh/lendoor_keys`)
- At least 4GB RAM (8GB swap configured)
- Docker >= 24.x and Docker Compose v2
- Ports 80/443 open (Caddy handles HTTPS)
- DNS: `mateos.tech` -> 54.160.120.210

### API Keys and Credentials

| Key | Source | Required? |
|-----|--------|-----------|
| `TELEGRAM_BOT_TOKEN` (per agent) | @BotFather | Yes (7 tokens, one per agent) |
| `TELEGRAM_OWNER_ID` | @userinfobot | Yes |
| `TWITTER_API_KEY/SECRET/ACCESS_TOKEN/ACCESS_TOKEN_SECRET` | Twitter Dev Portal | For Mateo CEO |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Google Cloud Console | For Sheets/Calendar agents |
| `GMAIL_EMAIL` + `GMAIL_APP_PASSWORD` | Google Account > App Passwords | For email-enabled agents |

---

## 2. Production Architecture

### 3 Services (compose.yml)

| Service | Image | Role | Memory Limit |
|---------|-------|------|--------------|
| `caddy` | `caddy:2-alpine` | HTTPS reverse proxy | 256MB |
| `frontend` | `ghcr.io/fabian416/mateos-hackathon/frontend` | Next.js web app | 512MB |
| `mateos-agents` | `ghcr.io/fabian416/mateos-hackathon/agents` | Single OpenClaw with 7 agents | 4GB |

All 7 agents run in ONE container. Inter-agent communication uses OpenClaw's `agentToAgent`.

### Key EC2 Paths

| Path | Purpose |
|------|---------|
| `/opt/docker/mateos/compose.yml` | Docker Compose |
| `/opt/docker/mateos/Caddyfile` | HTTPS config |
| `/opt/docker/mateos/mateos/.env` | All tokens and config |
| `/opt/docker/mateos/mateos/workspaces/{agent}/` | Per-agent workspace MDs |
| `/opt/docker/mateos/mateos/config/openclaw.json.template` | Multi-agent OpenClaw config |
| `/opt/docker/mateos/mateos/docker-entrypoint.sh` | Startup script |
| `/opt/docker/mateos/mateos/tweet-scheduler.py` | Mateo CEO scheduler |
| `/opt/docker/mateos/mateos/agents/main/agent/auth-profiles.json` | Google API key |

---

## 3. CI/CD Pipeline

### GitHub Actions

Only 2 images built (on push to `main`):

| Image | Source |
|-------|--------|
| `ghcr.io/fabian416/mateos-hackathon/frontend` | Next.js app |
| `ghcr.io/fabian416/mateos-hackathon/agents` | Single agent image (all 7 agents) |

Uses Docker Buildx with GitHub Actions cache (`type=gha`). Auth via `GITHUB_TOKEN` with `packages: write`.

### Watchtower Auto-Deploy

Watchtower runs on EC2 and monitors GHCR. Full pipeline:

```
git push main -> GitHub Actions build -> GHCR push -> Watchtower pull -> container restart
```

No manual SSH needed for routine deployments.

---

## 4. First-Time EC2 Setup

### 1. SSH into the server

```bash
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210
```

### 2. Verify Docker is installed

```bash
docker --version
docker compose version
```

### 3. Create the directory structure

```bash
sudo mkdir -p /opt/docker/mateos/mateos
```

### 4. Copy files to EC2

From your local machine:

```bash
scp -i ~/.ssh/lendoor_keys compose.yml ec2-user@54.160.120.210:/opt/docker/mateos/
scp -i ~/.ssh/lendoor_keys Caddyfile ec2-user@54.160.120.210:/opt/docker/mateos/
scp -ri ~/.ssh/lendoor_keys mateos/ ec2-user@54.160.120.210:/opt/docker/mateos/mateos/
```

### 5. Configure .env

```bash
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210
cd /opt/docker/mateos/mateos
vi .env  # Fill in all tokens
```

### 6. Start the stack

```bash
cd /opt/docker/mateos
docker compose up -d
```

### 7. Enable systemd service

```bash
sudo systemctl enable docker-compose@mateos.service
```

---

## 5. Updating Workspace Files (No Rebuild)

Workspace files are mounted into the container. To update agent behavior:

```bash
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210
cd /opt/docker/mateos/mateos/workspaces/<agent>/
vi TOOLS.md   # Edit as needed
```

Then restart the container:

```bash
cd /opt/docker/mateos
docker compose restart mateos-agents
```

No image rebuild needed.

---

## 6. Agent Template System

### Templates (in this repo)

| Path | Purpose |
|------|---------|
| `agents/_base/` | Shared workspace files, scripts, Docker templates |
| `agents/el-{type}/` | Generic agent-type templates with `{{placeholders}}` |
| `agents/deployments/mateos/` | Unified MateOS deployment with all workspaces filled |

### Workspace Files Per Agent

| File | Defines |
|------|---------|
| `IDENTITY.md` | Name, role, scope, model, channels |
| `SOUL.md` | Personality, response templates, escalation rules, SLAs |
| `AGENTS.md` | Autonomy table, inter-agent awareness |
| `TOOLS.md` | Active integrations, client FAQ, knowledge base |
| `HEARTBEAT.md` | Periodic tasks and schedules |

### Using deploy.sh for new clients

```bash
cd agents/_base
./deploy.sh --client-name <name> --agent-type <type> --channels telegram,whatsapp
```

This creates a deployment directory with all base + agent-type files merged, placeholders partially filled. Client-specific content must be filled manually.

---

## 7. Verifying Health

```bash
# SSH in
ssh -i ~/.ssh/lendoor_keys ec2-user@54.160.120.210

# Container status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Agent container logs
docker logs -f mateos-agents --tail 100

# Frontend
curl -I https://mateos.tech

# Check Caddy
docker logs caddy --tail 50
```

---

## 8. Troubleshooting

### Agent container not starting

```bash
docker logs mateos-agents --tail 200
```

Common causes: missing env vars, bad `.env` file, memory limit hit (check `docker stats`).

### WhatsApp session expired

```bash
docker exec -it mateos-agents openclaw channels login --channel whatsapp
# Scan QR code with phone
```

IMPORTANT: Never use `--force-recreate` on containers with WhatsApp -- it loses the session. Use `docker compose restart` instead.

### Email not polling

```bash
docker exec mateos-agents himalaya envelope list --folder INBOX -o json
```

Check `GMAIL_APP_PASSWORD` in `.env`. Must be a Google App Password, not the account password.

### Out of memory

```bash
docker stats --no-stream
free -h
```

The container has `NODE_OPTIONS=--max-old-space-size=3072` set. If still OOM, check swap: `swapon --show` (should show 8GB).

### Tweet scheduler not running

```bash
docker exec mateos-agents ps aux | grep tweet-scheduler
docker exec mateos-agents tail -100 /path/to/tweet-scheduler.log
```
