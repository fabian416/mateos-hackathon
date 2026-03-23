# MateOS — Zero Human Factory

A self-sustaining network of AI-operated businesses. Agent squads run real companies, coordinate commercially with each other, and fund their own intelligence through the revenue they generate — all with verifiable onchain trust.

> **[Read the Build Story](docs/BUILD-STORY.md)** — How 2 builders and 1 AI created a self-sustaining business network in 48 hours.

## Live Demo

**[mateos.tech](https://mateos.tech)** — Watch 6 AI squads coordinate across Argentina in real-time.

- **[/network](https://mateos.tech/network)** — Live supply chain map with real onchain events (green ⛓ pulses = Base Mainnet transactions)
- **[/dashboard](https://mateos.tech/dashboard)** — Intra-squad agent activity and inter-agent delegation
- **[/explore](https://mateos.tech/explore)** — Directory of all 6 squads with live stats
- **[/onboarding](https://mateos.tech/onboarding)** — Deploy your own squad (wallet required)

## What is MateOS

MateOS deploys squads of specialized AI agents that operate real businesses end-to-end. Each squad handles sales, support, admin, content, and coordination autonomously. Squads communicate with each other through an ERC-8004 verified trust layer — before accepting a message from another squad, the receiving agent checks the sender's onchain identity and reputation on Base Mainnet.

The network currently runs 6 squads across Argentina's supply chain: wineries in Mendoza and Salta, a citrus processor in Tucumán, a cured meats producer in Córdoba, a logistics hub in Rosario, and a farm-to-table restaurant in Buenos Aires. All coordinating autonomously, all verifiable onchain.

## Architecture

```
                    mateos.tech
                        │
                   ┌────┴────┐
                   │  Caddy  │  (HTTPS, reverse proxy)
                   └────┬────┘
                        │
              ┌─────────┴─────────┐
              │                   │
        ┌─────┴─────┐    ┌───────┴────────┐
        │ Frontend   │    │ Buenos Table   │  (7 agents, main squad)
        │ Next.js 16 │    │ OpenClaw       │
        └────────────┘    └───────┬────────┘
                                  │ ERC-8004 verified
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────┴───────┐  ┌───────┴──────┐  ┌────────┴───────┐
     │ Andes Vineyard │  │ Central      │  │ Altura Wines   │
     │ Mendoza        │  │ Logistics    │  │ Salta          │
     │ (1 CEO agent)  │  │ Rosario      │  │ (1 CEO agent)  │
     └────────────────┘  │ (1 CEO agent)│  └────────────────┘
                         └──────────────┘
              ┌───────────────────┼───────────────────┐
              │                                       │
     ┌────────┴───────┐                     ┌────────┴───────┐
     │ Norte Citrus   │                     │ Estancia Meats │
     │ Tucumán        │                     │ Córdoba        │
     │ (1 CEO agent)  │                     │ (1 CEO agent)  │
     └────────────────┘                     └────────────────┘
```

## Onchain Infrastructure (Base Mainnet)

| Component | Contract | Link |
|-----------|----------|------|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | [BaseScan](https://basescan.org/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |
| ERC-8004 Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | [BaseScan](https://basescan.org/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63) |
| MateOS SelfValidation | `0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149` | [BaseScan](https://basescan.org/address/0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149) |

6 squads registered with 6 independent wallets. 25+ cross-squad reputation feedbacks recorded onchain. 3 complete self-validation cycles (submit + verify + dispute window). All verifiable on BaseScan.

## Agent Types

| Agent | Name | Role |
|-------|------|------|
| ChatGod | WhatsApp Support | Responds to customers 24/7, resolves complaints |
| BagChaser | Billing & Collections | Invoices, payments, debt follow-up |
| CalendApe | Scheduling | Appointments, reminders, zero double-bookings |
| DM Sniper | Lead Outreach | Prospect finding, qualification, conversion |
| PostMalone | Social Media | Instagram, stories, engagement |
| HypeSmith | Content & Marketing | Newsletters, articles, brand storytelling |
| OpsChad | Coordination | Squad orchestration, reports, optimization |

## Supply Chain Demo

The network map (`/network`) shows a live supply chain across Argentina:

- **Wine Route**: Andes Vineyard (Mendoza) + Altura Wines (Salta) → Central Logistics (Rosario)
- **Food Route**: Norte Citrus Co. (Tucumán) + Estancia Meats (Córdoba) → Central Logistics (Rosario)
- **Both converge at**: Buenos Table (Buenos Aires) — farm-to-table restaurant

Inter-squad messages flow through an ERC-8004 verification hook. After each interaction, `giveFeedback()` is called onchain. The frontend polls Base Mainnet every 12 seconds and shows real transactions as green pulses (⛓) with a `tx ↗` link to BaseScan.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion, viem |
| Agent Runtime | OpenClaw (7 agents in main squad, 1 CEO per satellite squad) |
| Onchain | ERC-8004 (identity + reputation), custom SelfValidation contract |
| Blockchain | Base Mainnet (Ethereum L2) |
| Reverse Proxy | Caddy 2 (automatic HTTPS) |
| Containers | Docker (6 independent containers on EC2) |
| CI/CD | GitHub Actions → GHCR → Watchtower auto-deploy |
| Channels | WhatsApp, Telegram, Email, Twitter/X, Google Sheets/Calendar |

## Quick Start

### See it live (30 seconds)
Visit **[mateos.tech](https://mateos.tech)** and explore the network map.

### Run locally
```bash
git clone https://github.com/LuchoLeonel/mateos-hackathon.git
cd mateos-hackathon
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For agent deployment, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project Structure

```
mateos-hackathon/
  src/                          # Next.js frontend (app router)
    app/
      hackathon/                # Landing page
      dashboard/                # Intra-squad agent network view
      network/                  # Argentina map — inter-squad supply chain
      explore/                  # Squad directory
      onboarding/               # Squad deployment wizard
      deploy/                   # Deployment animation
    components/
      network/ArgentinaNetwork  # Real-time onchain event visualization
      dashboard/AgentNetworkVisual  # Intra-squad agent communication
    lib/
      erc8004.ts                # Reads reputation from Base Mainnet
      onchainEvents.ts          # Polls FeedbackGiven events in real-time
  agents/
    _base/                      # Shared agent templates and config
      hooks/erc8004-hook/       # Inter-squad verification hook (OpenClaw)
      config/                   # OpenClaw config template
    erc-8004/                   # Onchain infrastructure
      contracts/SelfValidation.sol  # Audit trail contract
      proxy/verify.ts           # Inter-squad verification library
      cards/                    # Agent card JSONs (hosted on IPFS)
    squads/                     # Multi-squad deployment
      supply-chain-loop.sh      # Automated inter-squad orchestrator
      compose.squads.yml        # Docker compose for satellite squads
  docs/
    AUTONOMY.md                 # 6 autonomy mechanisms
    BUILD-STORY.md              # Hackathon build narrative
    CONVERSATION-LOG.md         # Human-agent collaboration log
```

## Hackathon Tracks

| Track | Prize | Status | Key Implementation |
|-------|-------|--------|--------------------|
| Synthesis Open Track | $28,300 | Submitted | Full MateOS system — 6 squads, 7 agent types, onchain trust |
| Protocol Labs — ERC-8004 Trust | $4,000 | Complete | Identity registry, reputation registry, verification hook, SelfValidation contract |
| Protocol Labs — Autonomy | $4,000 | Complete | 6 autonomy mechanisms: heartbeat, channel-checker, memory decay, trust ladder, delegation, auto-recovery |
| OpenServ | $5,000 | Complete | Multi-agent system as real product + x402 agent-to-agent commerce + [build story](docs/BUILD-STORY.md) |
| Base — Agent Service | $5,000 | Complete | x402 payment endpoint ($0.01 USDC per request on Base Mainnet) |

### Why MateOS Wins Each Track

**Protocol Labs — ERC-8004 Trust ($4,000):**
6 squads registered with identity NFTs and cross-verified reputation on Base Mainnet. Agents verify each other's credentials onchain before inter-business transactions. 25+ feedbacks, 3 validation cycles with dispute windows. See [ARCHITECTURE.md](docs/ARCHITECTURE.md).

**Protocol Labs — Autonomy ($4,000):**
Six interlocking mechanisms for agents that run without human intervention: heartbeat monitoring, zero-cost channel checker, memory decay system, trust ladder governance, inter-agent delegation, and auto-recovery. Cost: ~$2-6/day per squad. See [AUTONOMY.md](docs/AUTONOMY.md).

**OpenServ ($5,000):**
Real multi-agent system operating live — not a demo. Each squad is a business (winery, logistics, restaurant) with 7 specialized agents coordinating via `sessions_send`. x402-native agent-to-agent commerce on Base. See [BUILD-STORY.md](docs/BUILD-STORY.md).

**Synthesis Open Track ($28,300):**
First autonomous AI-operated business network with verifiable onchain trust. Combines identity (ERC-8004), autonomy (6 mechanisms), coordination (inter-squad supply chain), and commerce (x402 payments) into a self-sustaining system.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/BUILD-STORY.md](docs/BUILD-STORY.md) | The hackathon build narrative — *start here for the human story* |
| [docs/AUTONOMY.md](docs/AUTONOMY.md) | 6 autonomy mechanisms in detail |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and infrastructure |
| [docs/INTER-AGENT.md](docs/INTER-AGENT.md) | Inter-agent communication protocol |
| [docs/X402_INTEGRATION.md](docs/X402_INTEGRATION.md) | x402 payment protocol implementation |
| [docs/AGENT-TYPES.md](docs/AGENT-TYPES.md) | All 7 agent types and their capabilities |
| [docs/CONVERSATION-LOG.md](docs/CONVERSATION-LOG.md) | Human-agent collaboration transcript |

## License

MIT

---

*Built by 2 humans and 1 AI in 48 hours.*
