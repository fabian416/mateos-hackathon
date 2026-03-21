# MateOS Build Story

> OpenServ Track: Best Build Story ($500 bonus)

## The Problem We Felt Firsthand

In Argentina, a small business owner wears every hat. The baker answers WhatsApp at 11pm. The mechanic tracks invoices on paper. The salon owner forgets to follow up with clients because she's cutting hair.

They can't afford to hire a sales team, a support team, an admin assistant, and a content creator. They can barely afford one employee. So they do everything themselves, badly, until they burn out.

We knew this because we've seen it. Every PyME (small business) in Argentina runs on WhatsApp, duct tape, and the owner's willpower.

## The Idea

What if instead of hiring one person who does everything poorly, a small business could deploy a squad of AI agents — each specialized, each available 24/7, each costing less than a single part-time hire?

Not a chatbot. Not an assistant. A **workforce**.

- **El Baqueano** answers customer support on WhatsApp and email
- **El Tropero** tracks leads and follows up until they close
- **El Domador** manages calendars, spreadsheets, and invoices
- **El Rastreador** handles technical support tickets
- **El Relator** writes content and newsletters
- **El CEO** manages the brand's public voice
- **El Paisano** is a custom agent for whatever the business needs

Seven agents. One squad. $280/month. Available 24/7.

## What We Actually Built

MateOS runs on OpenClaw — all 7 agents in a single Docker container, communicating via `sessions_send` with zero latency. No external router needed. No HTTP overhead. Just agents talking to agents.

Each agent has:
- A **personality** defined in SOUL.md (Argentine Spanish, voseo, direct, no-bullshit)
- **Rules** in AGENTS.md (what they can and can't do autonomously)
- A **trust ladder** (4 levels: read-only → draft+approve → act within bounds → full autonomy)
- **Memory** that persists and decays naturally (hot/warm/cold/archive)
- **Identity** on Base via ERC-8004 (verifiable onchain reputation)

The frontend shows it all in real-time: a network visualization of agents communicating, an activity feed of inter-agent delegations, and a map of Argentina showing squads operating businesses across the country.

## The Hard Parts

**Making agents actually useful, not just impressive.** It's easy to build a demo where agents send messages to each other. It's hard to build a system where a bakery in Córdoba actually trusts an AI to talk to its customers. The trust ladder — draft first, human approves, earn autonomy over time — was the key insight from Felix Craft's "How to Hire an AI" playbook.

**Cost control.** Seven agents running 24/7 can burn through API credits fast. We stratified: Haiku for heartbeats ($0.02/day), Sonnet for content ($0.01/msg), Opus for strategy (rare). The channel-checker runs on pure Python — zero LLM cost. Total: ~$2-6/day per squad.

**The self-funding loop.** The $MATEOS token on Base generates swap fees. Those fees flow to the Bankr LLM Gateway, which pays for the agents' inference. The agents work → generate revenue → pay for their own thinking → keep working. No human funding the compute.

## The Network Effect

One squad is a product. Many squads are a **network**.

When a restaurant in Buenos Aires needs flour, its agent talks to a distributor's agent in Rosario. When a salon books a client through a digital agency, the agents coordinate the scheduling. Every interaction builds onchain reputation via ERC-8004 — verifiable, permanent, trustworthy.

The map of Argentina in the Explore page isn't a visualization. It's the thesis: **a country where small businesses operate through AI agents that know each other, trust each other, and trade with each other.**

## What We'd Build Next

- **LenClaw Vaults**: DeFi credit scoring powered by agent reputation data
- **Agent marketplace**: Third-party developers build specialized agents for the MateOS network
- **Cross-border expansion**: Uruguay, Chile, Colombia — same model, same network
- **Trust level 3+ at scale**: Agents that truly operate without any human in the loop

## The Team

Two builders. 48 hours. One vision: the first self-sustaining network of AI-operated businesses.

---

*Built with OpenClaw, deployed on Base, identity on ERC-8004, self-funded via Bankr.*
