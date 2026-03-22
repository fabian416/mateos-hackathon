# x402 Payment Integration — MateOS

## What is x402?

x402 is an open protocol by Coinbase that brings native payments to HTTP. It uses the `402 Payment Required` status code (defined in HTTP/1.1 but never standardized until now) to let servers charge per-request in USDC on Base.

The flow:
1. Client sends a request
2. Server responds with `402 Payment Required` + payment instructions
3. Client creates a USDC payment authorization (EIP-3009, gasless)
4. Client retries with the payment proof in the `X-PAYMENT` header
5. Server verifies via the Coinbase facilitator and returns the response
6. USDC settles on Base Mainnet

No subscriptions. No API keys. No credit cards. Just USDC per request.

## How MateOS Uses x402

MateOS exposes its AI agent network as a paid HTTP API. Any external AI agent (or human) with USDC on Base can:

1. **Discover** MateOS services via [Bazaar](https://x402.org/bazaar)
2. **Pay** $0.01 USDC per request
3. **Get** agent task execution (supply chain analysis, scheduling, content generation)

This creates an **agent-to-agent economy**: MateOS agents serve other agents for USDC, which funds the LLM inference that powers them (via Bankr Gateway).

## Endpoint

```
POST /api/agent-task
```

### Request Body

```json
{
  "task": "answer_whatsapp | schedule_delivery | analyze_supply | general",
  "agentId": "mateo-ceo | el-baqueano | el-domador | ...",
  "message": "Mesa para 4 personas, jueves 8:30 PM"
}
```

### Successful Response (200)

```json
{
  "result": "Confirmed reservation for 4 guests at Buenos Table...",
  "agentId": "mateo-ceo",
  "task": "answer_whatsapp",
  "completedAt": "2026-03-21T18:30:00.000Z",
  "payment": {
    "amount": "0.01",
    "currency": "USDC",
    "network": "eip155:8453",
    "txHash": "0x..."
  }
}
```

### Payment Required Response (402)

When no `X-PAYMENT` header is provided:

```json
{
  "error": "Payment Required",
  "status": 402,
  "x402Version": 1,
  "paymentRequirements": {
    "scheme": "exact",
    "network": "eip155:8453",
    "price": "0.01",
    "currency": "USDC",
    "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "payTo": "0x17Fa2eF50Cc53A96C08610f345fAd0F2c4Ecc149",
    "facilitatorUrl": "https://x402.org/facilitator",
    "description": "MateOS AI Agent Task Execution..."
  }
}
```

## Making a Paid Request

### With curl (shows 402 response)

```bash
# Step 1: See payment requirements
curl -s -X POST http://localhost:3000/api/agent-task \
  -H "Content-Type: application/json" \
  -d '{"task": "answer_whatsapp", "message": "Mesa para 4?"}' | jq .

# Step 2: With payment proof (production — use @x402/fetch client)
curl -s -X POST http://localhost:3000/api/agent-task \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <payment-proof-from-x402-client>" \
  -d '{"task": "answer_whatsapp", "message": "Mesa para 4?"}' | jq .
```

### With @x402/fetch (automatic payment)

```typescript
import { x402Fetch } from "@x402/fetch";

const response = await x402Fetch("https://mateos.example.com/api/agent-task", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    task: "analyze_supply",
    agentId: "mateo-ceo",
    message: "Analyze wine delivery efficiency this week",
  }),
  x402: {
    privateKey: process.env.WALLET_PRIVATE_KEY, // Base wallet with USDC
  },
});

const result = await response.json();
console.log(result);
```

## Agent-to-Agent Economy

The x402 protocol enables a new paradigm: **agents paying agents**.

```
External Agent (has USDC on Base)
  │
  ├─ Discovers MateOS via Bazaar
  ├─ Sends POST /api/agent-task
  ├─ Receives 402 + payment instructions
  ├─ Creates USDC authorization (EIP-3009)
  ├─ Retries with X-PAYMENT header
  └─ Gets agent task result
        │
        └─ MateOS receives $0.01 USDC
             │
             ├─ Funds LLM inference (via Bankr Gateway)
             ├─ Agents process more tasks
             └─ Self-sustaining loop
```

## Bazaar Discovery

MateOS is registered on [Bazaar](https://x402.org/bazaar), the x402 service directory. Other agents can search for MateOS:

```bash
curl https://x402.org/bazaar/search?q=mateos
```

Bazaar listing includes:
- Endpoint URL
- Price per request
- Input/output schema
- Service description
- Network (Base Mainnet)

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `X402_RECEIVE_ADDRESS` | Wallet address for USDC payments | SelfValidation contract address |
| `X402_VERIFY_PAYMENTS` | Enable production payment verification | `false` (demo mode) |
| `OPENCLAW_GATEWAY_URL` | OpenClaw gateway for real agent execution | `http://localhost:3100` |
| `GATEWAY_AUTH_TOKEN` | Auth token for OpenClaw gateway | — |

## Architecture

```
Client (agent or human)
  │
  POST /api/agent-task
  │
  ├─ No X-PAYMENT header? → 402 + payment instructions
  │
  └─ X-PAYMENT header present?
       │
       ├─ Verify via facilitator (production)
       │   or accept (demo mode)
       │
       └─ Execute task
            ├─ OpenClaw Gateway (if available)
            └─ Mock responses (hackathon fallback)
```
