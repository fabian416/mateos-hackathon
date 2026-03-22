# MateOS — Hackathon Implementation Plan

> Generated 2026-03-21 | Synthesis Hackathon — March 21-22

---

## Part 1: Summary of Lucho's Work

### What's Done (Complete)

| File | What It Does | Hackathon Track | Status |
|------|-------------|-----------------|--------|
| `src/lib/erc8004.ts` | Reads on-chain reputation from ERC-8004 Reputation Registry on Base Mainnet. Fetches FeedbackGiven events for squad agent ID 35270 (OpsChad). Falls back to hardcoded data on error. | **ERC-8004 Track** | COMPLETE |
| `src/components/dashboard/AgentNetworkVisual.tsx` | Animated SVG network of 7 agents with light pulses, cascade events, shockwaves, orbit particles. Now fetches live ERC-8004 reputation and displays it in agent detail cards with "ERC-8004 verified" badge and score. | **ERC-8004 + OpenServ** | COMPLETE |
| `src/app/dashboard/page.tsx` | Dashboard page with squad context (owner vs viewer), privacy model (blurred revenue for non-owners), navigation to /network, stats bar including "LLM Requests via Bankr Gateway" label. | **OpenServ + ERC-8004** | COMPLETE |
| `src/app/network/page.tsx` | New page that renders ArgentinaNetwork component. Minimal wrapper with TopNav and 200vh container. | **ERC-8004 + OpenServ** | COMPLETE |
| `src/components/network/ArgentinaNetwork.tsx` | Full Argentina SVG map with 6 squad nodes positioned by real lat/lon. Live inter-squad supply chain activity (wine route, food route). Clickable nodes navigate to squad dashboard. Task log at bottom. | **ERC-8004 + OpenServ** | COMPLETE |
| `src/app/explore/page.tsx` | Grid view of all 6 squads with stats (revenue, tasks, uptime). Deploy CTA. Global stats bar. | **OpenServ** | COMPLETE |
| `agents/erc-8004/contracts/SelfValidation.sol` | Solidity contract for onchain audit trail. Agents submit tasks, validators score 0-100, 24h validation deadline, 48h dispute window, self-validation prevention. Deployed at `0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149` on Base Mainnet. | **ERC-8004 + Protocol Labs Autonomy** | COMPLETE (deployed) |
| `agents/erc-8004/ipfs-cids.json` | Registry of all 7 agent IPFS CIDs, 6 squad agent IDs, contract addresses. Real on-chain data. | **ERC-8004** | COMPLETE |
| `agents/erc-8004/give-feedback.sh` | Bash script using Foundry `cast` to submit reputation feedback to ERC-8004 Reputation Registry on Base Mainnet. | **ERC-8004** | COMPLETE |
| `docs/CONVERSATION-LOG.md` | Full 12-hour collaboration log documenting decisions, pivots, and outcomes. | **Submission narrative** | COMPLETE |
| `package.json` | Added `viem` (^2.47.6) for on-chain reads. All other deps already present. | N/A | COMPLETE |

### On-Chain Artifacts (All Live on Base Mainnet)

| Artifact | Address / ID | Verified |
|----------|-------------|----------|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | Yes |
| ERC-8004 Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | Yes |
| SelfValidation Contract | `0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149` | Yes |
| Squad NFTs Registered | 6 squads + 7 internal agents | Yes |
| Cross-squad Feedbacks | 15+ reputation feedbacks | Yes |
| Self-validation Cycles | 3 complete (submit + verify) | Yes |

### What's NOT Done Yet

| Gap | Required For | Priority |
|-----|-------------|----------|
| Bankr LLM Gateway integration | Bankr Track ($7,590) | HIGH |
| $MATEOS token launch on Base | Bankr Track ($7,590) | HIGH |
| Self-funding loop (token fees -> inference credits) | Bankr Track ($7,590) | HIGH |
| x402 payment middleware on HTTP endpoint | Base Track ($5,000) | HIGH |
| Bazaar registration for discovery | Base Track ($5,000) | HIGH |
| Real USDC payment transaction | Base Track ($5,000) | HIGH |
| OpenClaw config pointing to Bankr LLM Gateway | Bankr Track | HIGH |

---

## Part 2: Bankr Track — Step-by-Step ($7,590)

### Goal
Demonstrate the self-funding loop: $MATEOS token launches on Base via Bankr -> trading fees fund LLM inference credits via Bankr Gateway -> OpenClaw agents use those credits to operate -> agents generate revenue -> loop continues.

### Step 1: Install Bankr CLI & Create Account

**Who:** Fabian (manual)
**Time:** 10 minutes

```bash
# Install Bankr CLI globally
npm i -g @bankr/cli

# Login — opens browser for wallet auth
bankr login

# Verify connection
bankr whoami
```

**What happens:**
- Bankr provisions EVM wallets (Base, Ethereum, Polygon, Unichain) + Solana wallet automatically
- No manual wallet setup needed
- Your API key is tied to the wallet you sign in with

**URL:** https://bankr.bot — sign in with wallet

### Step 2: Generate LLM Gateway API Key

**Who:** Fabian (manual)
**Time:** 5 minutes

```bash
# Option A: Via CLI
bankr config set llmKey

# Option B: Via web dashboard
# Go to https://bankr.bot/llm -> generate API key
# Go to https://bankr.bot/api -> view/manage keys
```

Save the key as `BANKR_LLM_KEY` — you'll need it for OpenClaw config.

### Step 3: Launch $MATEOS Token on Base

**Who:** Fabian (manual, needs wallet with ETH for gas)
**Time:** 15 minutes

```bash
# Launch the token via Bankr CLI
# Bankr uses Clanker under the hood for fair launches on Base
bankr launch --name "MateOS" --symbol MATEOS -y
```

**What this does:**
- Deploys an ERC-20 token on Base Mainnet via Clanker
- Creates a liquidity pool automatically
- Sets up fee routing: ~40% of trading fees go to creator (you)
- Since Bankr launched its own Token Launcher (Feb 2026), deployers earn ~14% more per swap vs old Clanker routing

**Record the token address** — you'll need it for the fee -> credits loop.

### Step 4: Configure OpenClaw to Use Bankr LLM Gateway

**Who:** Can be automated
**Time:** 15 minutes

**Option A: Automatic setup**
```bash
bankr llm setup openclaw --install
```

**Option B: Manual edit** — modify `agents/_base/config/openclaw.json.template`

Add a `providers` section to the OpenClaw config. The current config at `agents/_base/config/openclaw.json.template` does NOT have an explicit LLM provider configured (models reference `google/` and `anthropic/` directly). You need to add:

```json
{
  "providers": {
    "bankr": {
      "baseUrl": "https://llm.bankr.bot",
      "apiKey": "${BANKR_LLM_KEY}",
      "apiType": "openai-completions"
    }
  }
}
```

Then update the model references to route through Bankr:
- Current: `"model": "google/gemini-2.5-flash"` (direct API)
- New: Route through `https://llm.bankr.bot` which proxies to Vertex AI (Gemini), Vertex AI (Claude), OpenRouter

**Environment variable to add on server:**
```bash
BANKR_LLM_KEY=your_key_here
```

**Models available via Bankr Gateway:**
- Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 3 Flash
- Claude Haiku 4.5, Claude Sonnet 4.6
- OpenRouter models

### Step 5: Configure Auto Top-Up from Token Fees

**Who:** Fabian (manual)
**Time:** 10 minutes

```bash
# Via Bankr dashboard at https://bankr.bot/llm:
# 1. View usage breakdown by model
# 2. Enable auto top-up
# 3. Set funding source to $MATEOS token fee revenue
```

**How the loop works:**
1. $MATEOS token trades on Base
2. Each swap generates trading fees (~40% to creator via Clanker/Bankr launcher)
3. Fees accumulate in your Bankr wallet
4. Auto top-up converts fee revenue into LLM inference credits
5. OpenClaw agents consume credits via `llm.bankr.bot`
6. Agents serve customers, generating more demand for $MATEOS

**Accepted payment methods for credits:** USDC, ETH, BNKR, or other ERC-20s on Base.

### Step 6: Record the Loop Working (Demo)

**What to capture for submission:**

1. **Token live on Base** — screenshot of $MATEOS on basescan.org or dexscreener
2. **Bankr LLM dashboard** — screenshot showing usage by model, credits consumed
3. **OpenClaw logs** — terminal output showing agents making inference requests to `llm.bankr.bot`
4. **Fee revenue** — Bankr dashboard showing token fee income
5. **Auto top-up** — evidence that fees funded new credits
6. **Full loop recording** — 30-60 second screen recording showing:
   - User interacts with agent (Telegram)
   - Agent processes via Bankr Gateway (show logs)
   - Token trading generates fees
   - Fees auto-top-up credits

---

## Part 3: Base Track — Step-by-Step ($5,000)

### Goal
Expose a MateOS service as a paid HTTP endpoint using x402 payment protocol, register it in Bazaar for discovery, and complete one real USDC payment on Base mainnet.

### Step 1: Choose the Service Endpoint

**What to expose:** MateOS agent-as-a-service — an HTTP endpoint where another AI agent (or human) can pay USDC to get MateOS to perform a task (e.g., supply chain analysis, scheduling, content generation).

**Recommended endpoint:**
```
POST /api/x402/agent-task
```
- Accepts: `{ "task": "string", "agentId": "string" }`
- Returns: `{ "result": "string", "agentId": "string", "completedAt": "ISO8601" }`
- Price: $0.01 USDC per request (or $0.001 for micro-pricing)

### Step 2: Install x402 Dependencies

**Who:** Can be automated
**Time:** 5 minutes

```bash
cd /Users/fabiandiaz/mateos

# Core x402 packages
npm install @x402/core @x402/evm @x402/express @x402/extensions

# Or if using Next.js API routes:
npm install @x402/core @x402/evm x402-next @x402/extensions
```

### Step 3: Create x402 Payment Middleware (Express)

**Who:** Can be automated
**Time:** 30 minutes

Create a new file (e.g., `src/app/api/x402/route.ts` for Next.js, or a standalone Express server):

**Option A: Standalone Express server** (recommended for hackathon — simpler)

```typescript
// agents/x402-server/index.ts
import express from "express";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension,
} from "@x402/extensions/bazaar";

const app = express();
app.use(express.json());

// Setup x402 facilitator (Coinbase-hosted, fee-free on Base)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});
const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);
server.registerExtension(bazaarResourceServerExtension);

// Your Base wallet address to receive USDC payments
const RECEIVE_ADDRESS = "0xYOUR_WALLET_ADDRESS";

// x402 payment middleware — protects routes with USDC payments
app.use(
  paymentMiddleware(server, {
    "POST /agent-task": {
      accepts: {
        scheme: "exact",
        price: "$0.01",
        network: "eip155:8453", // Base Mainnet
        payTo: RECEIVE_ADDRESS,
      },
      extensions: {
        ...declareDiscoveryExtension({
          discoverable: true,
          description: "MateOS AI Agent Task Execution — supply chain coordination, scheduling, content generation",
          input: {
            type: "object",
            properties: {
              task: { type: "string", description: "Task description" },
              agentId: { type: "string", description: "Target agent ID" },
            },
          },
          output: {
            type: "object",
            properties: {
              result: { type: "string" },
              agentId: { type: "string" },
              completedAt: { type: "string" },
            },
          },
        }),
      },
    },
  })
);

// The actual service endpoint
app.post("/agent-task", async (req, res) => {
  const { task, agentId } = req.body;

  // Call OpenClaw agent via gateway
  // The gateway is at http://localhost:${GATEWAY_PORT}
  const result = await fetch(`http://localhost:3100/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GATEWAY_AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      model: agentId || "mateo-ceo",
      messages: [{ role: "user", content: task }],
    }),
  });

  const data = await result.json();
  res.json({
    result: data.choices?.[0]?.message?.content || "Task completed",
    agentId: agentId || "mateo-ceo",
    completedAt: new Date().toISOString(),
  });
});

app.listen(3402, () => console.log("x402 MateOS service running on :3402"));
```

**Option B: Next.js API Route** (if you prefer keeping it in the frontend)

```typescript
// src/app/api/x402/agent-task/route.ts
import { withPayment } from "x402-next";

async function handler(req: Request) {
  const { task, agentId } = await req.json();
  // ... call OpenClaw gateway
  return Response.json({ result: "...", agentId, completedAt: new Date().toISOString() });
}

export const POST = withPayment(handler, {
  price: "$0.01",
  network: "eip155:8453",
  payTo: "0xYOUR_WALLET_ADDRESS",
});
```

### Step 4: Environment Variables

**Who:** Fabian (manual)
**Time:** 5 minutes

```bash
# Required for Coinbase Facilitator (verify + settle)
CDP_API_KEY_ID=your_cdp_key_id
CDP_API_KEY_SECRET=your_cdp_key_secret

# Get these from: https://portal.cdp.coinbase.com/
# The facilitator is fee-free for USDC settlement on Base mainnet
```

### Step 5: Register in Bazaar (Automatic)

**Who:** Automatic (no manual registration needed)
**Time:** 0 minutes (happens on first payment)

The Bazaar works differently from what you might expect:
- There is **no separate registration step**
- When you set `discoverable: true` in the x402 middleware config (Step 3), your service metadata is declared
- The CDP facilitator catalogs your service **the first time it processes a payment** (verify + settle) for that endpoint
- After the first payment, your endpoint appears in Bazaar searches at `https://x402.org/bazaar`

**Supported networks:** Base Mainnet (eip155:8453) and Base Sepolia (eip155:84532)

### Step 6: Execute One Real USDC Payment on Base Mainnet

**Who:** Fabian (manual)
**Time:** 15 minutes

**Prerequisites:**
- A wallet with USDC on Base Mainnet (even $0.10 is enough)
- The x402 server running and publicly accessible

**Client code to make the payment:**

```typescript
// test-payment.ts
import { x402Fetch } from "@x402/fetch";

const response = await x402Fetch("https://your-domain.com/agent-task", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    task: "Analyze supply chain efficiency for Buenos Table this week",
    agentId: "mateo-ceo",
  }),
  // x402 automatically handles the 402 -> pay -> retry flow
  x402: {
    privateKey: process.env.WALLET_PRIVATE_KEY, // Base wallet with USDC
  },
});

const result = await response.json();
console.log("Paid response:", result);
```

**What happens under the hood:**
1. Client sends POST request
2. Server responds with HTTP 402 (Payment Required)
3. x402 client creates USDC transfer authorization (EIP-3009, no on-chain approval needed)
4. Client retries with payment proof in headers
5. Facilitator verifies and settles the USDC payment
6. Server returns the actual response
7. Bazaar catalogs the endpoint (first time only)

**Alternative: curl with manual payment**
```bash
# First request gets 402 with payment instructions
curl -X POST https://your-domain.com/agent-task \
  -H "Content-Type: application/json" \
  -d '{"task":"test","agentId":"mateo-ceo"}'
# Returns 402 with X-Payment header containing payment details
```

### Step 7: Verify Bazaar Listing

After the first real payment:
```bash
# Check your service appears in Bazaar
curl https://x402.org/bazaar/search?q=mateos
```

---

## Part 4: Task Dependencies

```
BANKR TRACK:
  [1] Install CLI & Login ──────────────────┐
  [2] Generate LLM API Key ─────────────────┤
  [3] Launch $MATEOS Token ─────────────────┤── All independent, do in parallel
  [4] Configure OpenClaw ← needs [2]        │
  [5] Auto Top-Up ← needs [3] + [2]        │
  [6] Record Demo ← needs [4] + [5]        ▼

BASE TRACK:
  [1] Choose Endpoint ──────────────────────┐
  [2] Install x402 deps ───────────────────┤── Do first
  [3] Build x402 Server ← needs [1] + [2] │
  [4] Get CDP API Keys (Fabian, manual)    │
  [5] Deploy Server ← needs [3] + [4]     │
  [6] Real USDC Payment ← needs [5]       ▼
  [7] Verify Bazaar ← needs [6]

CROSS-TRACK:
  Bankr [4] (OpenClaw config) is independent of Base track
  Base [3] (x402 server) can call OpenClaw gateway, which benefits from Bankr LLM Gateway
  Do Bankr first → then Base benefits from working LLM gateway
```

---

## Part 5: Time Estimates

| Task | Time | Who |
|------|------|-----|
| **BANKR TRACK** | | |
| Install Bankr CLI + Login | 10 min | Fabian |
| Generate LLM Gateway Key | 5 min | Fabian |
| Launch $MATEOS Token | 15 min | Fabian |
| Configure OpenClaw for Bankr | 15 min | Automated (edit config) |
| Test agents via Bankr Gateway | 10 min | Fabian |
| Configure Auto Top-Up | 10 min | Fabian |
| Record Demo | 15 min | Fabian |
| **Bankr subtotal** | **~80 min** | |
| | | |
| **BASE TRACK** | | |
| Install x402 packages | 5 min | Automated |
| Create x402 server code | 30 min | Automated |
| Get CDP API Keys | 10 min | Fabian |
| Deploy x402 server | 15 min | Fabian |
| Execute real USDC payment | 15 min | Fabian |
| Verify Bazaar listing | 5 min | Fabian |
| **Base subtotal** | **~80 min** | |
| | | |
| **TOTAL** | **~2.5-3 hours** | |

---

## Part 6: Manual vs Automated

### Fabian Must Do Manually

1. **Create Bankr account** — `bankr login` (wallet signature required)
2. **Fund wallet with ETH** — need gas for $MATEOS token launch on Base
3. **Fund wallet with USDC** — need at least $0.10 USDC on Base for x402 test payment
4. **Get CDP API keys** — sign up at https://portal.cdp.coinbase.com/ and generate API Key ID + Secret
5. **Launch $MATEOS token** — `bankr launch --name "MateOS" --symbol MATEOS -y`
6. **Configure auto top-up** — via Bankr dashboard at https://bankr.bot/llm
7. **Record demo video** — screen capture of the full loop working
8. **Deploy x402 server** — needs to be publicly accessible (can use existing EC2)

### Can Be Automated (by Claude/agent)

1. Edit `openclaw.json.template` to add Bankr provider config
2. Create x402 server code (Express or Next.js API route)
3. Install npm dependencies (`@x402/*`, `@bankr/cli`)
4. Update `compose.yml` or deployment config for x402 server
5. Create test payment script
6. Update environment variables in deployment

---

## Quick Reference: Key URLs

| Resource | URL |
|----------|-----|
| Bankr Dashboard | https://bankr.bot |
| Bankr LLM Management | https://bankr.bot/llm |
| Bankr API Keys | https://bankr.bot/api |
| Bankr Docs | https://docs.bankr.bot |
| Bankr OpenClaw Guide | https://docs.bankr.bot/llm-gateway/openclaw/ |
| Bankr CLI Install | `npm i -g @bankr/cli` |
| x402 GitHub | https://github.com/coinbase/x402 |
| x402 Docs (Coinbase) | https://docs.cdp.coinbase.com/x402/welcome |
| x402 Seller Quickstart | https://docs.cdp.coinbase.com/x402/quickstart-for-sellers |
| x402 Bazaar Docs | https://docs.cdp.coinbase.com/x402/bazaar |
| CDP Portal (API Keys) | https://portal.cdp.coinbase.com/ |
| x402 npm (Express) | https://www.npmjs.com/package/x402-express or @x402/express |
| x402 npm (Next.js) | https://www.npmjs.com/package/x402-next |
| Synthesis Hackathon | https://synthesis.md |
| BaseScan | https://basescan.org |
| 8004Scan | https://8004scan.io |

---

## Summary: The Unified Story

**What we're presenting:**

MateOS is a self-sustaining network of AI-operated businesses. Each business is a "squad" of 7 AI agents running on OpenClaw. Squads verify each other via ERC-8004 (identity + reputation) on Base Mainnet. A custom SelfValidation contract provides an immutable audit trail for agent work quality.

**Bankr completes the economic loop:** The $MATEOS token funds the LLM inference that powers the agents. Trading fees auto-refill credits. The system pays for itself.

**x402 completes the service loop:** Any external AI agent can discover MateOS via Bazaar, pay USDC per request, and get agent services. MateOS becomes a paid API in the agentic economy.

**Together:** MateOS agents have identity (ERC-8004), reputation (on-chain feedback), accountability (SelfValidation), self-funding (Bankr + $MATEOS), and are commercially accessible (x402 + Bazaar). A fully autonomous, self-sustaining AI business network.
