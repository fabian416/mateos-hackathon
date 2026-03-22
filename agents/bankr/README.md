# Bankr Integration Guide for MateOS

## Overview

Bankr provides the LLM Gateway that powers all MateOS agent inference. Trading fees from the $MATEOS token auto-fund LLM credits, creating a self-sustaining loop.

---

## Step 1: Install Bankr CLI

```bash
npm i -g @bankr/cli
```

## Step 2: Login

```bash
bankr login
```

This opens a browser for wallet authentication. Bankr provisions EVM wallets (Base, Ethereum, Polygon, Unichain) and a Solana wallet automatically.

Verify with:

```bash
bankr whoami
```

## Step 3: Create LLM API Key

Option A -- CLI:

```bash
bankr config set llmKey
```

Option B -- Web dashboard:

1. Go to https://bankr.bot/api
2. Generate a new API key
3. Save it as `BANKR_LLM_KEY`

## Step 4: Launch $MATEOS Token

Requires ETH on Base for gas.

```bash
bankr launch --name "MateOS" --symbol MATEOS -y
```

This deploys an ERC-20 on Base Mainnet via Clanker with automatic liquidity pool creation. ~40% of trading fees go to the creator.

Record the token address and save it as `MATEOS_TOKEN_ADDRESS`.

## Step 5: Configure Auto Top-Up

1. Go to https://bankr.bot/llm
2. View usage breakdown by model
3. Enable auto top-up
4. Set funding source to $MATEOS token fee revenue

Accepted payment methods: USDC, ETH, BNKR, or other ERC-20s on Base.

---

## Environment Variables

Add these to your server environment (see `agents/server/.env.example`):

```bash
# Bankr LLM Gateway
BANKR_LLM_KEY=bk_your_llm_key_here
BANKR_API_KEY=bk_your_api_key_here

# Token (after launch)
MATEOS_TOKEN_ADDRESS=0x_token_address_after_launch
```

The `BANKR_LLM_KEY` is referenced in all `openclaw.json.template` files via `${BANKR_LLM_KEY}`.

---

## Verifying the Integration

1. Run the test script:

```bash
./agents/bankr/test-llm.sh
```

2. Check the Bankr LLM dashboard at https://bankr.bot/llm for usage stats.

3. In OpenClaw logs, confirm agents are routing requests through `llm.bankr.bot`.

---

## How the Self-Funding Loop Works

1. $MATEOS token trades on Base
2. Each swap generates trading fees (~40% to creator)
3. Fees accumulate in your Bankr wallet
4. Auto top-up converts fee revenue into LLM inference credits
5. OpenClaw agents consume credits via `llm.bankr.bot`
6. Agents serve customers, generating more demand for $MATEOS

---

## Available Models via Bankr Gateway

- Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 3 Flash
- Claude Haiku 4.5, Claude Sonnet 4.6
- OpenRouter models

## Key URLs

| Resource | URL |
|----------|-----|
| Bankr Dashboard | https://bankr.bot |
| Bankr LLM Management | https://bankr.bot/llm |
| Bankr API Keys | https://bankr.bot/api |
| Bankr Docs | https://docs.bankr.bot |
| OpenClaw Guide | https://docs.bankr.bot/llm-gateway/openclaw/ |
