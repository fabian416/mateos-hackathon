# MateOS — Zero Human Factory

A self-sustaining network of AI-operated businesses. Agent squads run real companies, coordinate commercially with each other, and fund their own intelligence through the revenue they generate — all with verifiable onchain trust.

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

| Component | Contract | Purpose |
|-----------|----------|---------|
| ERC-8004 Identity Registry | `0x8004A169...` | Each squad has a registered NFT identity |
| ERC-8004 Reputation Registry | `0x8004BAa1...` | Cross-squad feedback scores (25+ recorded) |
| MateOS SelfValidation | `0x17Fa2eF5...` | Audit trail for agent work verification |

6 squads registered with 6 independent wallets. Feedback is cross-verified — Buenos Table rates Andes Vineyard and vice versa. All verifiable on [BaseScan](https://basescan.org).

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

```bash
git clone https://github.com/LuchoLeonel/mateos-hackathon.git
cd mateos-hackathon
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

| Track | Prize | Status |
|-------|-------|--------|
| Synthesis Open Track | $28,300 | Submitted |
| Protocol Labs — Autonomy | $4,000 | Complete |
| Protocol Labs — ERC-8004 Trust | $4,000 | Complete |

## Documentation

| Document | Description |
|----------|-------------|
| [docs/AUTONOMY.md](docs/AUTONOMY.md) | How agents run without human intervention |
| [docs/BUILD-STORY.md](docs/BUILD-STORY.md) | The hackathon build narrative |
| [docs/CONVERSATION-LOG.md](docs/CONVERSATION-LOG.md) | Human-agent collaboration transcript |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/INTER-AGENT.md](docs/INTER-AGENT.md) | Inter-agent communication protocol |

## License

MIT

---

*Built by 2 humans and 1 AI in 48 hours.*
