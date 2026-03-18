# MateOS -- Zero Human Factory

AI agent squads for Argentine SMEs. Autonomous operations, real customers, zero fluff.

## What is MateOS

MateOS is an AI-powered operations platform built by MateOS. It deploys squads of specialized agents that handle sales, support, admin, content, and technical operations for small and medium businesses in Argentina. Each agent runs autonomously on its own Docker container, communicates with teammates through an internal router, and interacts with the outside world via WhatsApp, email, Telegram, Twitter, Google Sheets, and Google Calendar. The system is designed to replace entire operational teams at a fraction of the cost.

## Architecture

```
                         +-------------------+
                         |     Caddy         |
                         |  (HTTPS / Proxy)  |
                         +--------+----------+
                                  |
                    +-------------+-------------+
                    |                           |
             +------+------+          +--------+--------+
             |  Frontend   |          |  Agent Router   |
             |  (Next.js)  |          |  (FastAPI)      |
             +-------------+          +--------+--------+
                                               |
                  +----------+---------+-------+-------+---------+----------+
                  |          |         |               |         |          |
              +---+---+ +---+---+ +---+---+     +-----+---+ +--+----+ +---+---+
              |  CEO  | |Tropero| |Domador|     |Rastreador| |Relator| |Baquean|
              |Twitter| | Sales | | Admin |     | Tech L1  | |Content| |Support|
              +-------+ +-------+ +-------+     +----------+ +-------+ +-------+
                  |          |         |               |         |          |
                  +----------+---------+-------+-------+---------+----------+
                                               |
                                     Shared: SQUAD_AUTH_TOKEN
                                     Protocol: HTTP + JSON
```

## Agent Types

| Agent | Codename | Role | Capabilities |
|-------|----------|------|-------------|
| Mateo CEO | `el-ceo` | Brand / Twitter | Tweet scheduling, content calendar, public-facing persona |
| El Tropero | `el-tropero` | Sales / Leads | Lead contact in <5 min, follow-up at 48h, pipeline in Sheets, meeting scheduling |
| El Domador | `el-domador` | Admin / Data | Google Sheets and Calendar, daily reports, deadline tracking, task automation |
| El Rastreador | `el-rastreador` | Tech Support L1 | Diagnostics, step-by-step guides, L2/L3 escalation, known issue tracking |
| El Relator | `el-relator` | Content / Marketing | Articles, social posts, newsletters, editorial calendar, brand storytelling |
| El Baqueano | `el-baqueano` | Customer Support | Email and WhatsApp support, SLA <15 min WA / <4h email, diagnosis before resolution |
| El Paisano | `el-paisano` | Custom (Template) | Blank template -- define role, personality, tools, and channels per client |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| Agent Runtime | OpenClaw (AI agent framework) |
| Agent Router | FastAPI (Python) -- inter-agent communication bus |
| Reverse Proxy | Caddy 2 (automatic HTTPS) |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions -- builds and pushes to GHCR |
| Channels | WhatsApp, Telegram, Email (himalaya), Twitter/X, Google Sheets, Google Calendar |
| Google APIs | `gog` CLI + Service Account |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- An `.env` file per agent (see each agent's deployment directory)

### Clone and Install

```bash
git clone https://github.com/fabian416/mateos.git
cd mateos
npm install
```

### Run the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run the Agents

```bash
cd agents/deployments
docker compose -f docker-compose.prod.yml up
```

Each agent requires its own `.env` file. See the `agents/deployments/mateos-*/` directories for examples.

## Project Structure

```
mateos/
  src/                          # Next.js frontend (app router)
  public/                       # Static assets
  agents/
    _base/                      # Shared agent template + deploy script
      workspace/                # Template workspace files (IDENTITY, SOUL, AGENTS, TOOLS, HEARTBEAT)
      deploy.sh                 # Script to scaffold new agent deployments
      docker/                   # Dockerfile template
    router/                     # Agent Router (FastAPI inter-agent bus)
      registry.json             # Agent discovery registry
    el-baqueano/                # Agent type: Customer Support
    el-ceo/                     # Agent type: Brand / Twitter
    el-domador/                 # Agent type: Admin / Data
    el-paisano/                 # Agent type: Custom Template
    el-rastreador/              # Agent type: Tech Support L1
    el-relator/                 # Agent type: Content / Marketing
    el-tropero/                 # Agent type: Sales / Leads
    deployments/                # Per-client deployment configs
      docker-compose.prod.yml   # Full production stack
      Caddyfile                 # Reverse proxy config
      mateos-*/                 # Individual agent deployment directories
  docs/                         # Documentation
  Dockerfile                    # Frontend Docker image
  .github/workflows/            # CI/CD pipelines
```

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Full deployment guide (EC2, Docker, Caddy, DNS) |
| [docs/INTER-AGENT.md](docs/INTER-AGENT.md) | Inter-agent communication protocol and delegation |
| [docs/AGENT-TYPES.md](docs/AGENT-TYPES.md) | Detailed reference for each agent type |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Day-to-day operations, monitoring, and troubleshooting |

## Deployment

The production stack runs on a single EC2 instance. The workflow:

1. Push to `main` triggers GitHub Actions, which builds Docker images and pushes them to GHCR.
2. On the server: `docker compose pull && docker compose up -d`.
3. Caddy handles HTTPS automatically.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full guide.

## Inter-Agent Communication

Agents communicate through the Agent Router, a FastAPI service that acts as a message bus. Each agent can delegate tasks to any other agent in the squad using a shared `SQUAD_AUTH_TOKEN` for authentication. The router resolves agent names to container hostnames via `registry.json`.

See [docs/INTER-AGENT.md](docs/INTER-AGENT.md) for protocol details.

## License

TBD
