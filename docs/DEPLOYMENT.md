# MateOS Agent Platform -- Deployment Guide

This document covers the full lifecycle of deploying MateOS agents: from local development through production on EC2, including CI/CD and ongoing maintenance.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Creating a New Agent Instance](#2-creating-a-new-agent-instance)
3. [Local Development](#3-local-development)
4. [Production Deployment (EC2)](#4-production-deployment-ec2)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Adding a New Agent to Production](#6-adding-a-new-agent-to-production)
7. [Updating Agents](#7-updating-agents)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

### Software

- **Docker** >= 24.x and **Docker Compose** v2 (plugin)
- **Node.js** >= 24 (used inside the agent image; not required on the host unless doing local dev without Docker)
- **Git** for cloning the repository
- **Caddy** >= 2.x (production only -- runs as a Docker container)
- **Python 3** (installed inside agent containers; only needed on host for running scripts outside Docker)

### API Keys and Credentials

| Key | Where to get it | Required? |
|-----|-----------------|-----------|
| `TELEGRAM_BOT_TOKEN` | Create a bot via [@BotFather](https://t.me/BotFather) on Telegram | Yes |
| `TELEGRAM_OWNER_ID` | Send `/start` to [@userinfobot](https://t.me/userinfobot) | Yes |
| `GATEWAY_AUTH_TOKEN` | Self-generated (see Section 4) | Yes |
| `SQUAD_AUTH_TOKEN` | Self-generated, shared across all agents (see Section 4) | Yes (production) |
| `GMAIL_EMAIL` + `GMAIL_APP_PASSWORD` | Google Account > App Passwords | Only if `EMAIL_ENABLED=true` |
| `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET` | Twitter Developer Portal | Only if `TWITTER_ENABLED=true` |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Google Cloud Console > Service Accounts | Only if `GOOGLE_ENABLED=true` |

### Server Requirements (Production)

- EC2 instance (t3.medium or larger recommended)
- At least 4 GB RAM (each agent container uses ~200-400 MB)
- 20 GB+ disk space
- Ports 80 and 443 open (Caddy handles HTTPS)
- A domain name pointed to the server IP (for automatic TLS via Caddy)

---

## 2. Creating a New Agent Instance

### Using deploy.sh (Recommended)

The `deploy.sh` script generates a complete deployment directory for a new client, copying base files, applying the agent-type overlay, and generating an `.env` file with sane defaults.

```bash
cd agents/_base
./deploy.sh --client-name <client-name> --agent-type <agent-type> [--channels <channels>]
```

**Parameters:**

| Flag | Description | Example |
|------|-------------|---------|
| `--client-name` | Client identifier (lowercase, hyphens) | `panaderia-carlos` |
| `--agent-type` | Agent archetype directory name | `el-baqueano`, `el-tropero`, `el-domador`, `el-rastreador`, `el-relator`, `el-paisano` |
| `--channels` | Comma-separated channel list (default: `telegram,whatsapp`) | `telegram,whatsapp,email` |

**Example:**

```bash
./deploy.sh --client-name panaderia-carlos --agent-type el-baqueano --channels telegram,whatsapp,email
```

This creates `agents/deployments/panaderia-carlos/` with the following structure:

```
panaderia-carlos/
  .env                        # Generated from .env.example with client defaults
  .env.example                # Reference
  .gitignore
  Dockerfile                  # Copied from docker/Dockerfile.template
  docker-compose.yml          # Copied from docker/docker-compose.yml.template
  docker-entrypoint.sh        # Entry point with placeholders replaced
  config/
    openclaw.json.template    # OpenClaw config template
    himalaya.config.toml.template  # Email config template
  workspace/
    SOUL-BASE.md              # Base personality
    AGENTS-BASE.md            # Inter-agent awareness
    HEARTBEAT-BASE.md         # Heartbeat schedule
    TOOLS-BASE.md             # Tool definitions
    SOUL.md                   # Agent-type specific personality (overlaid)
    TOOLS.md                  # Agent-type specific tools (overlaid)
    ...
  scripts/
    channel-checker.py        # Monitors channel health
    tweet-scheduler.py        # Tweet scheduling (if applicable)
  memory/
  logs/
```

### Manual Setup

If you need to set up a deployment directory without the script:

1. Create the deployment directory:
   ```bash
   mkdir -p agents/deployments/<client-name>/{workspace,config,scripts,memory,logs}
   ```

2. Copy base files:
   ```bash
   cp agents/_base/workspace/*-BASE.md agents/deployments/<client-name>/workspace/
   cp agents/_base/config/*.template agents/deployments/<client-name>/config/
   cp agents/_base/scripts/channel-checker.py agents/deployments/<client-name>/scripts/
   cp agents/_base/docker/Dockerfile.template agents/deployments/<client-name>/Dockerfile
   cp agents/_base/docker/docker-compose.yml.template agents/deployments/<client-name>/docker-compose.yml
   cp agents/_base/docker/docker-entrypoint.sh.template agents/deployments/<client-name>/docker-entrypoint.sh
   chmod +x agents/deployments/<client-name>/docker-entrypoint.sh
   ```

3. Copy agent-type overlay:
   ```bash
   cp agents/<agent-type>/workspace/* agents/deployments/<client-name>/workspace/
   ```

4. Copy the `.env.example` and create your `.env`:
   ```bash
   cp agents/_base/.env.example agents/deployments/<client-name>/.env.example
   cp agents/deployments/<client-name>/.env.example agents/deployments/<client-name>/.env
   ```

5. Edit `docker-compose.yml` to replace `${SERVICE_NAME}` and `${CONTAINER_NAME}` placeholders.

6. Edit `docker-entrypoint.sh` to replace `{{AGENT_DISPLAY_NAME}}`.

### Customizing Workspace Files

Workspace markdown files define the agent's personality, knowledge, and behavior. After generating a deployment, customize:

- **SOUL.md** -- Brand voice, personality traits, tone guidelines. Replace any remaining `{{CLIENT_NAME}}`, `{{BRAND_MANTRA}}` placeholders.
- **TOOLS.md** -- Client-specific FAQ, product information, pricing. Replace `{{CLIENT_CONTEXT}}`, `{{CLIENT_FAQ}}` placeholders.
- **HEARTBEAT-BASE.md** -- Scheduled tasks and their cadence.
- **TRUST-LADDER.md** -- Authorization levels for autonomous actions.

The `deploy.sh` script replaces common placeholders automatically (`{{CLIENT_NAME}}`, `{{AGENT_NAME}}`, `{{DEPLOY_DATE}}`, etc.), but client-specific content placeholders must be filled in manually.

### Setting Up .env

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

At minimum, set:

```
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_OWNER_ID=<your-chat-id>
GATEWAY_AUTH_TOKEN=<generate-a-secure-token>
```

The `.env` file is git-ignored and must never be committed.

---

## 3. Local Development

### Running a Single Agent

From the agent's deployment directory:

```bash
cd agents/deployments/<client-name>

# Build and start
docker compose build
docker compose up -d
```

The local `docker-compose.yml` builds the image from `agents/Dockerfile` with the appropriate `AGENT_TYPE` build arg and mounts volumes for logs and WhatsApp credentials.

### Testing Channels

**Telegram:**
1. Send `/start` to your bot on Telegram.
2. The agent should respond. Check logs if it does not.

**WhatsApp (QR scan):**
1. WhatsApp authentication requires scanning a QR code on first run.
2. Exec into the container and run the login command:
   ```bash
   docker exec -it <container-name> openclaw channels login --channel whatsapp
   ```
3. A QR code will appear in the terminal. Scan it with WhatsApp on your phone (Linked Devices > Link a Device).
4. WhatsApp credentials are persisted in the `whatsapp-creds` volume, so you only need to scan once unless the session expires.

**Email:**
- Email is handled via himalaya. Ensure `EMAIL_ENABLED=true` and the Gmail app password is set in `.env`.
- The `channel-checker.py` script polls for new emails every 60 seconds.

### Logs and Debugging

```bash
# Follow all logs
docker compose logs -f

# Follow only the agent container
docker compose logs -f <service-name>

# Check channel-checker logs inside the container
docker exec -it <container-name> tail -f /home/agent/.openclaw/logs/channel-checker.log

# Check tweet-scheduler logs (if Twitter enabled)
docker exec -it <container-name> tail -f /home/agent/.openclaw/logs/tweet-scheduler.log

# Inspect the generated openclaw.json config
docker exec -it <container-name> cat /home/agent/.openclaw/openclaw.json
```

To check if the agent process is running:

```bash
docker exec -it <container-name> pgrep -fa openclaw
```

---

## 4. Production Deployment (EC2)

### Server Setup

Production server: `54.160.120.210`

1. **Install Docker and Docker Compose:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   # Log out and back in for group changes to take effect
   ```

2. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd mateos
   ```

3. **Caddy** runs as a Docker container defined in `docker-compose.prod.yml`. It handles automatic HTTPS via Let's Encrypt. The `Caddyfile` is mounted as a volume:
   ```
   mateos.xyz {
       encode gzip zstd
       reverse_proxy frontend:3000
   }
   ```
   The domain must have an A record pointing to `54.160.120.210`.

### Environment Variables and Secrets

Each agent has its own `.env` file under `agents/deployments/<agent-name>/.env`. These are referenced via `env_file` in `docker-compose.prod.yml`.

There is also a shared `.env` at the `agents/deployments/` level for stack-wide secrets:

```bash
# agents/deployments/.env
SQUAD_AUTH_TOKEN=<shared-token-for-inter-agent-auth>
```

### SQUAD_AUTH_TOKEN Generation

The `SQUAD_AUTH_TOKEN` is a shared secret that authenticates inter-agent communication through the agent router. All agents and the router must share the same value.

Generate a secure token:

```bash
openssl rand -hex 32
```

Set it in `agents/deployments/.env`:

```
SQUAD_AUTH_TOKEN=<generated-token>
```

This token is injected into each agent container and the router via the `environment` section in `docker-compose.prod.yml`.

### docker-compose.prod.yml Overview

The production compose file (`agents/deployments/docker-compose.prod.yml`) defines the full stack:

| Service | Image | Role |
|---------|-------|------|
| `agent-router` | `ghcr.io/.../agent-router:latest` | FastAPI inter-agent communication bus |
| `caddy` | `caddy:2-alpine` | Reverse proxy with automatic HTTPS |
| `frontend` | `ghcr.io/.../frontend:latest` | Next.js web application |
| `mateo-ceo` | `ghcr.io/.../el-ceo:latest` | Twitter/X tweet scheduler |
| `baqueano-mateos` | `ghcr.io/.../el-baqueano:latest` | Customer support agent |
| `tropero-mateos` | `ghcr.io/.../el-tropero:latest` | Sales/leads agent |
| `domador-mateos` | `ghcr.io/.../el-domador:latest` | Admin/data agent |
| `rastreador-mateos` | `ghcr.io/.../el-rastreador:latest` | L1 technical support agent |
| `relator-mateos` | `ghcr.io/.../el-relator:latest` | Content creation agent |

Key architectural details:

- **YAML anchor `x-agent-base`**: All agents inherit from `&agent-base`, which defines the common entrypoint logic, restart policy, Watchtower label, and healthcheck.
- **Volume mounts**: Workspace files are mounted read-only from the host at `/mnt/workspace` and copied into the container at startup. This allows hot-reloading workspace content without rebuilding images.
- **Inter-agent communication**: Each agent gets `SQUAD_AUTH_TOKEN`, `ROUTER_URL=http://agent-router:8080`, and its own `AGENT_NAME`. The `delegate.py` script handles sending tasks between agents via the router.
- **Watchtower labels**: All services have `com.centurylinklabs.watchtower.enable=true` for automatic image updates.

### Starting the Stack

```bash
cd agents/deployments

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Verify all containers are running
docker compose -f docker-compose.prod.yml ps
```

### Verifying Health

```bash
# Check container status and health
docker compose -f docker-compose.prod.yml ps

# Verify the agent router is healthy
curl -s http://localhost:8080/health

# Check individual agent logs
docker compose -f docker-compose.prod.yml logs -f baqueano-mateos

# Verify a specific agent process is running
docker exec baqueano-mateos pgrep -fa openclaw

# Check Caddy is serving HTTPS
curl -I https://mateos.xyz
```

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is defined in `.github/workflows/build-agents.yml`. It triggers on every push to `main`.

### Image Building

The workflow builds three categories of images in parallel:

1. **Frontend** (1 image):
   - Context: repository root
   - Dockerfile: `./Dockerfile`
   - Tag: `ghcr.io/<owner>/mateos/frontend:latest`

2. **Agent Router** (1 image):
   - Context: `./agents/router`
   - Dockerfile: `./agents/router/Dockerfile`
   - Tag: `ghcr.io/<owner>/gaucho-agents/agent-router:latest`

3. **Agent Types** (7 images via matrix strategy):
   - Context: `./agents`
   - Dockerfile: `./agents/Dockerfile`
   - Build arg: `AGENT_TYPE=<type>`
   - Tags: `ghcr.io/<owner>/gaucho-agents/<agent-type>:latest`

   The matrix includes:
   - `el-baqueano`
   - `el-ceo`
   - `el-domador`
   - `el-paisano`
   - `el-relator`
   - `el-rastreador`
   - `el-tropero`

All builds use Docker Buildx with GitHub Actions cache (`type=gha`) for faster rebuilds.

### GHCR Pushing

Images are pushed to GitHub Container Registry (GHCR) automatically after a successful build. Authentication uses `GITHUB_TOKEN` with `packages: write` permission.

### Watchtower Auto-Updates

On the production server, [Watchtower](https://containrrr.dev/watchtower/) monitors GHCR for new image versions. When a new `:latest` image is pushed:

1. Watchtower detects the updated digest.
2. It pulls the new image.
3. It recreates the container with the same configuration.

All services in `docker-compose.prod.yml` have the Watchtower label enabled:

```yaml
labels:
  - "com.centurylinklabs.watchtower.enable=true"
```

This means pushing to `main` triggers a fully automated deployment: code push -> GitHub Actions build -> GHCR push -> Watchtower pull -> container restart.

---

## 6. Adding a New Agent to Production

Follow these steps to add a new agent type or a new instance of an existing type to the production stack.

### Step 1: Create the Deployment Directory

Use `deploy.sh` or create it manually (see Section 2):

```bash
cd agents/_base
./deploy.sh --client-name <client-name> --agent-type <agent-type> --channels telegram,whatsapp
```

### Step 2: Configure the .env

```bash
cd agents/deployments/<client-name>
cp .env.example .env
# Edit .env with real credentials
```

### Step 3: Customize Workspace Files

Edit the workspace markdown files with client-specific content (FAQ, brand voice, etc.).

### Step 4: If This Is a New Agent Type

If you created a new agent type (not just a new instance of an existing type):

1. Add the type directory under `agents/`:
   ```
   agents/<new-agent-type>/
     workspace/
       SOUL.md
       TOOLS.md
   ```

2. Add the new type to the GitHub Actions matrix in `.github/workflows/build-agents.yml`:
   ```yaml
   matrix:
     agent:
       - el-baqueano
       - el-new-type    # Add here
       ...
   ```

3. Push to `main` to trigger image builds.

### Step 5: Add to docker-compose.prod.yml

Add the new service to `agents/deployments/docker-compose.prod.yml`:

```yaml
  <service-name>:
    <<: *agent-base
    image: ghcr.io/<owner>/gaucho-agents/<agent-type>:latest
    container_name: <service-name>
    hostname: <service-name>
    env_file: ./<deployment-dir>/.env
    environment:
      - SQUAD_AUTH_TOKEN=${SQUAD_AUTH_TOKEN}
      - ROUTER_URL=http://agent-router:8080
      - AGENT_NAME=<agent-name>
    depends_on:
      agent-router:
        condition: service_healthy
    volumes:
      - <service-name>-logs:/home/agent/.openclaw/logs
      - ./<deployment-dir>/workspace:/mnt/workspace:ro
      - ./<deployment-dir>/docker-entrypoint.sh:/mnt/entrypoint.sh:ro
      - ./<deployment-dir>/config/openclaw.json.template:/mnt/openclaw.json.template:ro
      - ./<deployment-dir>/agents/main/agent/auth-profiles.json:/mnt/auth-profiles.json:ro
```

Add the volume to the `volumes:` section at the bottom:

```yaml
volumes:
  <service-name>-logs:
```

### Step 6: Deploy

```bash
cd agents/deployments

# Pull new images (if applicable)
docker compose -f docker-compose.prod.yml pull

# Start the new service (without restarting existing ones)
docker compose -f docker-compose.prod.yml up -d <service-name>

# Verify
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f <service-name>
```

### Step 7: Connect WhatsApp (If Enabled)

```bash
docker exec -it <container-name> openclaw channels login --channel whatsapp
# Scan the QR code with your phone
```

---

## 7. Updating Agents

### Workspace File Updates (Hot Reload via Volumes)

In production, workspace files are mounted as read-only volumes from the host into the container at `/mnt/workspace`. The container entrypoint copies them to the working directory on startup.

To update workspace content without rebuilding:

1. Edit the workspace files on the host:
   ```bash
   cd agents/deployments/<agent-name>/workspace
   vi TOOLS.md   # Make your changes
   ```

2. Restart the container to pick up changes:
   ```bash
   docker compose -f docker-compose.prod.yml restart <service-name>
   ```

The container's entrypoint runs `cp /mnt/workspace/* /home/agent/.openclaw/workspace/` on every start, so workspace changes take effect on restart without needing a new image.

### Image Updates (Rebuild + Push)

For changes to the base image (Dockerfile, system dependencies, scripts, base workspace files baked into the image):

1. Make changes to `agents/Dockerfile`, `agents/_base/`, or `agents/<agent-type>/`.
2. Push to `main`.
3. GitHub Actions builds and pushes new images to GHCR.
4. Watchtower automatically pulls the new image and restarts affected containers.

To manually trigger an update on the server:

```bash
cd agents/deployments
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Rolling Updates

Docker Compose does not natively support rolling updates. To minimize downtime when updating multiple agents:

1. Update one agent at a time:
   ```bash
   docker compose -f docker-compose.prod.yml pull <service-name>
   docker compose -f docker-compose.prod.yml up -d <service-name>
   ```

2. Verify health before proceeding to the next:
   ```bash
   docker compose -f docker-compose.prod.yml ps <service-name>
   ```

3. Repeat for each agent.

Watchtower handles this automatically with a configurable interval, updating containers one at a time.

---

## 8. Troubleshooting

### Agent Not Starting

**Symptoms:** Container exits immediately or enters a restart loop.

1. Check the container logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs <service-name>
   ```

2. The entrypoint validates required environment variables on startup. If any are missing, you will see:
   ```
   Error: TELEGRAM_BOT_TOKEN is not set
   ```
   Fix: ensure the `.env` file has all required values set.

3. Check if the image was pulled correctly:
   ```bash
   docker images | grep <agent-type>
   ```

4. Try running the container interactively to debug:
   ```bash
   docker run --rm -it --env-file ./<agent-dir>/.env <image> /bin/bash
   ```

### Channel-Checker Issues

The `channel-checker.py` script runs in a background loop inside each agent container (every 60 seconds). If channels are not being monitored:

1. Check the channel-checker log:
   ```bash
   docker exec <container-name> cat /home/agent/.openclaw/logs/channel-checker.log
   ```

2. Verify the script is running:
   ```bash
   docker exec <container-name> ps aux | grep channel-checker
   ```

3. If the script crashed, restart the container:
   ```bash
   docker compose -f docker-compose.prod.yml restart <service-name>
   ```

### WhatsApp QR Expired

WhatsApp sessions expire periodically. When this happens:

1. The agent will stop receiving WhatsApp messages.
2. Re-authenticate by scanning a new QR code:
   ```bash
   docker exec -it <container-name> openclaw channels login --channel whatsapp
   ```
3. Scan the QR code displayed in the terminal with WhatsApp on your phone (Settings > Linked Devices > Link a Device).

WhatsApp credentials are stored in a Docker volume (`whatsapp-creds` or `<agent>-whatsapp`). If the volume is deleted, you must scan again.

### Gateway Auth Failures

If requests to the agent gateway return 401/403 errors:

1. Verify `GATEWAY_AUTH_TOKEN` is set in the agent's `.env` and matches what the client is sending.
2. Check the token was correctly injected into the openclaw config:
   ```bash
   docker exec <container-name> cat /home/agent/.openclaw/openclaw.json | grep -i auth
   ```
3. Regenerate the token if needed:
   ```bash
   openssl rand -hex 32
   ```
   Update the `.env` file and restart the container.

### Inter-Agent Communication Issues

Agents communicate through the agent router at `http://agent-router:8080`, authenticated by `SQUAD_AUTH_TOKEN`.

1. **Router not reachable:** Verify the router container is healthy:
   ```bash
   docker compose -f docker-compose.prod.yml ps agent-router
   docker exec agent-router python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"
   ```

2. **Auth failures between agents:** Ensure all agents and the router share the same `SQUAD_AUTH_TOKEN`. Check the value in:
   - `agents/deployments/.env` (stack-level)
   - Each agent's `environment` section in `docker-compose.prod.yml`

   They should all reference `${SQUAD_AUTH_TOKEN}` which resolves from the stack-level `.env`.

3. **Agent not registered with router:** The router discovers agents by hostname. Verify the agent has both `container_name` and `hostname` set in `docker-compose.prod.yml` and that `AGENT_NAME` matches the expected identifier.

4. **Network issues:** All services must be on the same Docker Compose network (the default network created by the compose file). Verify:
   ```bash
   docker network ls
   docker network inspect <network-name>
   ```

5. **Test delegation manually:**
   ```bash
   docker exec <source-agent> python /home/agent/delegate.py <target-agent-name> "test message"
   ```
