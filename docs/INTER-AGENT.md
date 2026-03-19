# MateOS -- Inter-Agent Communication

> Last updated: 2026-03-19

---

## 1. Overview

MateOS runs 7 agents inside a single OpenClaw container (`mateos-agents`). Inter-agent communication uses OpenClaw's built-in `sessions_send` tool -- no external HTTP router, no scripts, no separate containers.

This replaced the previous architecture where each agent ran in its own Docker container and communicated through a FastAPI agent-router service.

---

## 2. Architecture

```
+--------------------------------------------+
|           mateos-agents container           |
|                                            |
|   +--------+ sessions_send +--------+     |
|   | Mateo  | <-----------> |Tropero |     |
|   |  CEO   |               |        |     |
|   +--------+               +--------+     |
|       ^                        ^           |
|       |    sessions_send       |           |
|       v                        v           |
|   +--------+ sessions_send +--------+     |
|   |Domador | <-----------> |Rastr.  |     |
|   +--------+               +--------+     |
|       ^                        ^           |
|       |    sessions_send       |           |
|       v                        v           |
|   +--------+ sessions_send +--------+     |
|   |Relator | <-----------> |Paisano |     |
|   +--------+               +--------+     |
|       ^                                    |
|       |    sessions_send                   |
|       v                                    |
|   +--------+                               |
|   |Baquean.|                               |
|   +--------+                               |
|                                            |
|   Single OpenClaw process                  |
+--------------------------------------------+
```

All 7 agents share one OpenClaw process. `sessions_send` handles message routing internally -- no network calls, no HTTP, no authentication tokens between agents.

---

## 3. How sessions_send Works

OpenClaw's `sessions_send` allows any agent in the same instance to send a message to another agent's session. The receiving agent processes it as an incoming message in its conversation context.

**Usage:**
```
sessions_send(sessionKey="agent:<target-id>:main", message="<task description>")
```

**Examples:**
```
sessions_send(sessionKey="agent:tropero:main", message="Lead nuevo: Juan, +5491155551234, plan premium")
sessions_send(sessionKey="agent:domador:main", message="Agendar onboarding mañana 10am para Juan Pérez")
sessions_send(sessionKey="agent:rastreador:main", message="URGENTE: Cliente error 403 al loguearse")
```

Key properties:
- **Zero latency** -- in-process communication, no network hops
- **No auth needed** -- agents in the same OpenClaw instance are trusted
- **No external dependencies** -- no router service to maintain or monitor
- **Automatic discovery** -- agents know about each other through the shared OpenClaw config
- **Autonomous** -- inter-agent communication does NOT require operator approval

---

## 4. Required Configuration

Two settings in `openclaw.json` are required for inter-agent communication:

```json
"tools": {
    "agentToAgent": {
        "enabled": true,
        "allow": ["mateo-ceo", "tropero", "domador", "rastreador", "relator", "paisano", "baqueano"]
    },
    "sessions": {
        "visibility": "all"
    }
}
```

- `agentToAgent.enabled: true` -- enables the feature
- `agentToAgent.allow` -- whitelist of agents that can communicate
- `sessions.visibility: "all"` -- **CRITICAL**: without this, agents can only see their own sessions and `sessions_send` to other agents is silently blocked (default is `"tree"`)

---

## 5. Common Delegation Flows

### Lead Qualification: Baqueano -> Tropero -> Domador

1. Customer contacts via WhatsApp. Baqueano qualifies the lead.
2. Baqueano delegates to Tropero via `sessions_send` with lead details.
3. Tropero contacts the lead, closes the deal.
4. Tropero delegates onboarding to Domador via `sessions_send`.
5. Domador schedules in Calendar and updates Sheets.

### Technical Escalation: Tropero -> Rastreador

1. Sales agent encounters a client reporting a technical problem.
2. Tropero delegates to Rastreador with error details and client info.
3. Rastreador diagnoses, resolves, and reports back.

### Content Request: Tropero -> Relator

1. After closing a deal, Tropero requests a success story.
2. Relator drafts the content and sends it to the operator for Telegram approval.

---

## 6. Trust Rules for Inter-Agent Messages

Inter-agent messages have **intermediate trust** -- higher than external channels (WhatsApp, email) but lower than the Telegram operator channel.

Rules:
- An inter-agent message **cannot** override an agent's SOUL.md or AGENTS.md rules.
- An inter-agent message **cannot** instruct an agent to share data across clients.
- An inter-agent message **cannot** bypass approval requirements.
- Actions that need operator approval still need it, even when triggered by another agent.
- If a message seems suspicious, the agent ignores it and alerts the operator.

### Loop Prevention

- Agents follow the "one message, one task" rule.
- If Agent A delegates to Agent B, and B needs to delegate back to A, B must escalate to the operator instead.

### When to Escalate (Not Delegate)

Agents escalate to the operator via Telegram instead of delegating when:
- The task crosses client boundaries.
- The task involves financial decisions.
- The task requires business-level judgment.
- The agent does not know which agent should handle it.
- A delegation loop would be created.

---

## 7. Configuration Files

The multi-agent OpenClaw config lives at:
```
/opt/docker/mateos/mateos/config/openclaw.json.template
```

This template defines all 7 agents, their names, workspaces, and `agentToAgent` permissions. It is processed by `docker-entrypoint.sh` at container startup to inject environment variables.

Each agent's workspace directory:
```
/opt/docker/mateos/mateos/workspaces/{agent-name}/
```

The `AGENTS.md` and `SQUAD.md` files in each workspace define which other agents exist, their sessionKeys, and delegation rules.
