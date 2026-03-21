# MateOS — Human-Agent Collaboration Log

> Synthesis Hackathon 2026 — March 21-22

## Session Overview

**Human:** Luciano (product/strategy) + Fabian (infra/agents)
**Agent:** Claude Opus 4.6 (1M context) via Claude Code CLI
**Duration:** ~12 hours continuous session
**Stack:** Next.js 16, OpenClaw, ERC-8004, Solidity, Base Mainnet

---

## Phase 1: Project Analysis & Strategy (2 hrs)

### What happened
- Agent analyzed the full codebase: frontend (Next.js), agent infrastructure (OpenClaw, 7 agents), CI/CD (GitHub Actions), deployment (EC2/Docker/Caddy)
- Agent researched the Synthesis hackathon: all 28+ bounties, judging criteria, submission requirements
- Together we evaluated which tracks MateOS could compete in

### Key decision
We identified 6 tracks that align naturally with the product without feeling like a Frankenstein:
- **Bankr** ($7,590) — self-funding loop
- **Protocol Labs Autonomy** ($4,000) — agents that run without human touch
- **Protocol Labs ERC-8004** ($4,000) — trust layer for agent identity
- **Base** ($5,000) — service on Base
- **OpenServ** ($5,000) — multi-agent system as real product
- **Open Track** ($28,300) — automatic

The unified pitch: *"MateOS is a self-sustaining network of AI-operated businesses with verifiable onchain trust."*

---

## Phase 2: Product Vision Refinement (1.5 hrs)

### The breakthrough conversation
Human challenged the agent: *"Why would squads communicate with each other?"*

This led to a critical insight: ERC-8004 shouldn't be used for intra-squad trust (they already trust each other via sessions_send) — it should be the **passport for external verification**. How the outside world trusts your agents.

Then human pushed further: *"And if the employees ARE AI... doesn't that make inter-business communication MORE important?"*

This reframed the entire product:
- Human-to-human: WhatsApp works fine
- AI-to-AI: fundamentally different — continuous, proactive, context-rich, self-healing

### Outcome
MateOS redefined from "AI agents for your business" to **"a self-sustaining network of AI-operated businesses."**

The mate metaphor clicked: *Mate is shared in a round. Nobody drinks mate alone. MateOS is the operating system for a round of businesses that help each other.*

---

## Phase 3: Infrastructure Alignment (1 hr)

### What happened
- Pulled latest code, discovered misalignment between repo and production server
- Server's `compose.yml` pointed to old GHCR images (`fabian416/mateos`)
- Updated to `lucholeonel/mateos-hackathon`
- Added agents build job to CI (was frontend-only)
- Synced production `openclaw.json.template` to repo (had bindings, hooks, model aliases not in repo)
- Resolved GHCR permission issues by renaming image packages

### Deployment verified
- Frontend + agents running on EC2 with correct images
- Watchtower auto-deploys on push
- All 7 agents operational on production

---

## Phase 4: ERC-8004 Identity & Reputation (2 hrs)

### Agent cards
Created 7 ERC-8004 agent card JSONs with real capabilities, SLAs, channels, and trust levels. Uploaded to IPFS via Pinata.

### Squad architecture decision
Human insight: *"Registering 7 individual NFTs doesn't make sense if they're all in the same container. The NFT should represent the SQUAD, not the individual agent."*

Solution: CEO NFT = squad representative. Internal agents tracked via Trust Ladder (off-chain, fast).

### Onchain execution
- Registered 6 squad NFTs on Base Mainnet (6 different wallets = 6 different businesses)
- 15+ cross-squad reputation feedbacks via giveFeedback()
- Real commercial relationships: Buenos Table ↔ Andes Vineyard ↔ Central Logistics

### Squads registered
| Squad | agentId | City |
|-------|---------|------|
| Buenos Table | 35270 | Buenos Aires |
| Andes Vineyard | 35303 | Mendoza |
| Central Logistics | 35304 | Rosario |
| Altura Wines | 35305 | Salta |
| Norte Citrus Co. | 35306 | Tucumán |
| Estancia Meats | 35307 | Córdoba |

---

## Phase 5: Self-Validation Contract (1.5 hrs)

### The debate
Human asked: *"Does self-verification actually add value or is it just for the track?"*

Agent's honest answer: It's not "self-verification" — it's **publishing your work onchain so others can verify you later.** An immutable audit trail. When the agent says "Batch #47 is premium grade," that claim is hash-anchored. If the wine arrives and it's mediocre, anyone can dispute it within 48 hours.

**It's accountability for machines.** Humans have social reputation. AI agents need onchain reputation.

### Contract development
- V1: Basic submit/respond (hackathon-grade)
- Human demanded: *"Profesionalizame un poco más el contrato. No seas puto."*
- V2: Added self-validation prevention, 24h deadline, 48h dispute window, custom errors, authorization system, view functions, immutable Identity Registry reference
- Deployed to `0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149` on Base Mainnet
- 3 full validation cycles executed across 3 squads

---

## Phase 6: Network Map & Supply Chain (2.5 hrs)

### The narrative
Instead of abstract cards, we built a map of Argentina showing a real supply chain:

**Wine Route:** Mendoza (Andes Vineyard) + Salta (Altura Wines) → Rosario (Central Logistics)
**Food Route:** Tucumán (Norte Citrus Co.) + Córdoba (Estancia Meats) → Rosario (Central Logistics)
**Both converge at:** Buenos Aires (Buenos Table — farm-to-table restaurant)

### Why this matters
Human challenged: *"Does AI actually add value to a supply chain?"*

For ONE chain with ONE restaurant — no. WhatsApp works fine.

But when EVERY business has AI agents and they talk to each other continuously:
- Frequency: every hour, not once a week
- Context: full data sharing, not a WhatsApp message
- Proactivity: "Your Saturday reservations spiked 40%, need extra wine?"
- Self-healing: Mendoza frost → Rosario reroutes → Buenos Table changes menu → all in 30 seconds

### Frontend implementation
- New `/network` page with real Argentina SVG outline
- 6 squad nodes positioned by actual lat/lon coordinates
- Live inter-squad activity feed with supply chain task templates
- Click node → navigates to squad dashboard
- Squad privacy: non-owner viewers see blurred revenue, redacted comms
- Back to Network navigation

### Iterative design
Multiple rounds of human feedback:
- *"The map is too small"* → 200vh scrollable
- *"Two businesses in Buenos Aires looks weird"* → moved to Tucumán
- *"Business name should be big, city name small"* → swapped labels
- *"The activity feed should always be visible"* → fixed to bottom
- *"Non-owners shouldn't see inter-agent message content"* → blurred with redaction bars
- *"Crypto bro names don't make sense for businesses"* → classic names (Andes Vineyard, Buenos Table, etc.)

---

## Phase 7: Frontend Polish (1 hr)

- Agent names aligned across all pages (OpsChad, ChatGod, BagChaser, etc.)
- Translated remaining Spanish to English (metadata, revenue labels)
- Compacted stats bar
- Collapsible revenue panel
- Agent node positions adjusted to prevent glow clipping
- Activity feed capped at 10 entries
- ERC-8004 verified badge reads real onchain reputation score

---

## Onchain Artifacts Summary

| Contract | Address | Type |
|----------|---------|------|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | Official ERC-8004 |
| ERC-8004 Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | Official ERC-8004 |
| MateOS SelfValidation | `0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149` | Custom (deployed by us) |

| Onchain Action | Count |
|----------------|-------|
| Squad NFTs registered | 6 + 7 internal agents |
| Cross-squad reputation feedbacks | 15+ |
| Self-validation cycles | 3 (submit + verify) |
| Unique wallets used | 6 |

---

## Key Pivots & Decisions

1. **ERC-8004 for inter-squad, not intra-squad** — blockchain adds latency, internal trust doesn't need it
2. **CEO NFT = squad identity** — one NFT per business, not per agent
3. **Supply chain narrative** — proves AI-to-AI coordination has real value when both sides are AI
4. **Privacy model** — non-owners see activity but not sensitive data
5. **Self-validation as audit trail** — not self-review, but publishing work for others to verify
6. **Classic business names** — credibility over memes for the businesses (agents keep crypto names)

---

## Tools & Frameworks Used

- **Claude Code (Claude Opus 4.6)** — architecture, code, onchain execution, strategy
- **OpenClaw** — 7-agent runtime, inter-agent communication
- **Next.js 16 + React 19** — frontend
- **Foundry (cast/forge)** — contract deployment and onchain interactions
- **viem** — frontend blockchain reads
- **Pinata** — IPFS hosting for agent cards
- **Base Mainnet** — all onchain artifacts
- **ERC-8004** — agent identity and reputation standard

---

*Built by 2 humans and 1 AI in ~12 hours.*
