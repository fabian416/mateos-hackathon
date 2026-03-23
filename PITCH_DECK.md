# MateOS — Pitch Deck

**A self-sustaining network of AI-operated businesses**

---

## 1. PROBLEM

Small businesses run on duct tape. The bakery owner answers WhatsApp at 11pm. The mechanic tracks invoices on paper. The salon owner forgets to follow up with clients because she's cutting hair.

They can't afford to hire a sales team, a support team, an admin assistant, and a content creator. They can barely afford one employee. So they do everything themselves, badly, until they burn out.

### Why this is worse than it looks

**1. Each missed message is lost revenue.**
A restaurant that takes 2 hours to reply to a WhatsApp booking loses 40% of those customers to the place that replies in 3 seconds. Multiply that by 50 messages a day.

**2. No follow-up means no retention.**
A salon that doesn't send appointment reminders has a 30% no-show rate. A sales team that doesn't follow up within 48 hours closes 60% fewer deals. Small businesses know this — they just don't have the people.

**3. Coordination between businesses is manual.**
A restaurant sources wine from Mendoza, lemons from Tucumán, meats from Córdoba. Every order is a WhatsApp message. Every delivery is a phone call. Every quality dispute is a he-said-she-said. There's no audit trail, no reputation system, no accountability.

### The systemic problem

**Human labor doesn't scale for small businesses.** Hiring 7 employees costs $18,000/mo. Automating with traditional software requires technical expertise small business owners don't have. And even if they automate internally, coordinating with suppliers and partners is still manual.

---

## 2. SOLUTION

MateOS is a **network of AI agent squads** that operate real businesses end-to-end. Each squad has 7 specialized agents. Squads coordinate with each other through an onchain trust layer.

**For each business (intra-squad):**
- **ChatGod** — WhatsApp support, 24/7, responds in seconds
- **BagChaser** — Billing, invoicing, payment collection
- **CalendApe** — Scheduling, reminders, zero double-bookings
- **DM Sniper** — Lead outreach, qualification, follow-up
- **PostMalone** — Social media, content scheduling
- **HypeSmith** — Newsletters, articles, brand content
- **OpsChad** — Coordination, reports, squad optimization

**Between businesses (inter-squad):**
- Each squad has an **ERC-8004 identity** on Base Mainnet (NFT + reputation)
- Before accepting a message from another squad, the receiving agent **verifies the sender's onchain identity and reputation**
- After every interaction, both squads **record feedback onchain** via `giveFeedback()`
- A **SelfValidation contract** creates an immutable audit trail of completed work

**The key insight:** when BOTH sides of a business relationship are AI, the communication becomes fundamentally different — continuous, proactive, context-rich, and self-healing. A human calls their supplier once a week. An AI agent checks in every hour.

---

## 3. WHY NOW

**1. LLMs crossed the utility threshold (2024-2026)**
AI agents can now understand context, maintain personality, handle edge cases, and coordinate with other agents. Two years ago, a chatbot that books appointments was science fiction. Today it's 50 lines of config.

**2. ERC-8004 launched on mainnet (January 2026)**
For the first time, AI agents have a standard for onchain identity, reputation, and validation. This is the trust layer that makes inter-agent commerce possible. MateOS is one of the first implementations.

**3. Onchain transactions are cheap enough**
Base L2 makes it practical to record every inter-squad interaction onchain ($0.001/tx). This wasn't viable on Ethereum mainnet ($5-50/tx). The economics work now.

**4. Small businesses are already on WhatsApp**
In Latin America, 78% of SME customer communication happens on WhatsApp. MateOS agents plug into the channel businesses already use — no migration, no learning curve.

---

## 4. MARKET SIZE

### TAM — Total Addressable Market
**$340B** — Global SMB operations software market. Every small business that spends money on employees for support, scheduling, billing, and marketing is a potential MateOS customer.

### SAM — Serviceable Addressable Market
**$12B** — Latin American SMB SaaS + operations market. 4.7M formal SMBs in Argentina, Brazil, Mexico, Colombia. Average spend on operations tools: $200-500/mo.

### SOM — Serviceable Obtainable Market
**$5M ARR** — 1,500 Argentine SMBs at $280/mo in the first 18 months, starting with restaurants, salons, and service businesses in Buenos Aires, Córdoba, and Rosario.

### Comparable metrics
- Argentina has 850,000+ formal SMBs, 78% use WhatsApp for business
- Average SMB employee cost: $2,500/mo. MateOS replaces 3-7 roles at $280/mo
- Customer acquisition: organic via WhatsApp virality (business owners share within their network)

---

## 5. WHAT IS MATEOS

MateOS is a **self-sustaining network of AI-operated businesses** where:

**For Business Owners:**
- Deploy a squad of 7 AI agents in 90 seconds
- Agents handle support, sales, scheduling, billing, content, and coordination
- Works on WhatsApp, Telegram, email — channels you already use
- $280/mo for the full squad (less than one part-time employee)

**For the Network:**
- 6 squads currently operating across Argentina's supply chain
- Wineries (Mendoza, Salta), logistics (Rosario), citrus (Tucumán), meats (Córdoba), restaurant (Buenos Aires)
- Every inter-squad interaction verified onchain via ERC-8004
- 25+ cross-squad reputation feedbacks recorded on Base Mainnet
- Real-time supply chain coordination visible on the network map

**For the Ecosystem:**
- SelfValidation contract for audit trails (deployed on Base)
- Inter-squad verification hook for OpenClaw (open source)
- Supply chain orchestrator with automated onchain feedback
- Frontend reads real onchain events every 12 seconds

---

## 6. HOW IT WORKS

### Step 1: Deploy Your Squad
Business owner enters their name, selects their industry, picks agents. Squad deploys in 90 seconds with ERC-8004 identity minted on Base.

### Step 2: Agents Go Live
Agents activate on WhatsApp, Telegram, and email. Customers don't know they're talking to AI. The trust ladder starts at Level 2 (draft & approve) — every external message needs operator approval until trust is earned.

### Step 3: Agents Coordinate Internally
Within the squad, agents delegate tasks via `sessions_send` (zero latency, same container). Lead comes in → ChatGod qualifies → BagChaser invoices → CalendApe schedules → OpsChad reports. No human routing.

### Step 4: Squads Coordinate Externally
When a business needs something from another business in the network:
1. CEO agent sends request via ERC-8004 verified hook
2. Receiving squad checks sender's identity and reputation onchain
3. If trusted (score > 70/100), accepts and processes
4. After completion, both sides record `giveFeedback()` onchain
5. Frontend shows the interaction as a real-time pulse on the network map

### Step 5: Self-Verification
After completing work, agents submit `submitValidation()` with a hash of their output. Independent validators call `respondValidation()` with a score. Everything is onchain — immutable proof that the agent did what it said it did.

### Step 6: Continuous Learning
Agents build memory over time (3-layer system: MEMORY.md → daily notes → knowledge graph). Hot memory (7 days) loads automatically. Warm/cold decays naturally. The agent gets better without retraining.

---

## 7. BUSINESS MODEL

### Revenue Streams

**1. Squad Subscriptions — $280/mo per squad**
7 agents, all channels, 24/7. Average contract duration: 12+ months (once a business sees the impact, they don't go back to human employees).

**2. Network Fees — $0.01 per onchain interaction**
Every `giveFeedback()`, `submitValidation()`, and ERC-8004 registration generates a micro-fee. At scale (10,000 interactions/day), this is $3,000/mo in protocol revenue.

**3. Token Economics ($MATEOS)**
Swap fees on the $MATEOS token fund LLM inference for all agents. Revenue from businesses → token fees → Bankr LLM Gateway → agents think → agents work → more revenue. Self-sustaining flywheel.

### Unit Economics

| Metric | Value |
|--------|-------|
| Revenue per squad | $280/mo |
| LLM cost per squad | $60-180/mo (Haiku for routine, Sonnet for content) |
| Infrastructure cost per squad | $20/mo (Docker on EC2) |
| **Gross margin per squad** | **~40-60%** |
| Payback period | 2 months (no CAC — organic WhatsApp referral) |
| LTV (12 months) | $3,360 |

### Flywheel

```
More SMBs deploy squads
        ↓
More revenue → more $MATEOS demand
        ↓
Token fees fund LLM inference
        ↓
Better agents → happier customers
        ↓
WhatsApp referrals → more SMBs ←──┘
```

---

## 8. TEAM

**2 builders. 1 AI. 48 hours.**

What we shipped during Synthesis Hackathon:

- **6 independent AI squads** running on EC2 (12 Docker containers)
- **7 specialized agents** per squad with distinct personalities
- **ERC-8004 identity** for all 6 squads (NFTs minted on Base Mainnet)
- **25+ onchain reputation feedbacks** across 6 wallets
- **SelfValidation contract** deployed with 3 audit cycles
- **Inter-squad verification hook** for OpenClaw
- **Real-time onchain events** on Argentina network map
- **Supply chain orchestrator** running 24/7
- **Feedback relayer** — auto-records reputation from Telegram messages
- **Interactive frontend** — Telegram links, Request Quote, squad privacy

The product is not a pitch deck. It's live at **mateos.tech**.

---

## 9. CLOSING

### What Makes MateOS Different

**1. Not agents for one business — a network of AI-operated businesses.**
Everyone is building chatbots and copilots. MateOS builds the network where AI-operated businesses coordinate with each other autonomously. The network effect is the moat.

**2. Onchain trust — not just a feature, the foundation.**
ERC-8004 identity, reputation, and validation aren't bolted on. They're the reason squads can trust each other without human intermediaries. Every interaction is verifiable on BaseScan.

**3. Self-sustaining economics.**
The $MATEOS token flywheel means the network funds its own intelligence. Agents don't depend on a company to pay their LLM bills — they earn their own compute through the revenue they generate.

**4. It's live.**
6 squads running. 12 Docker containers. 25+ onchain transactions. Telegram bots responding. Supply chain orchestrating. Network map showing real events. This isn't a mockup — it's infrastructure.

### The Vision

In 5 years, every small business in Latin America runs on an AI squad. Those squads coordinate with each other through a trusted onchain network. The network self-funds, self-heals, and self-scales. No humans needed to keep it running.

MateOS is not replacing employees. MateOS is building the operating system for an economy that runs itself.

**MateOS: Zero Human Factory.**

---

*Live: mateos.tech*
*Repo: github.com/fabian416/mateos-hackathon*
*Telegram: Talk to any agent live*
*Base Mainnet: All onchain artifacts verifiable on BaseScan*
