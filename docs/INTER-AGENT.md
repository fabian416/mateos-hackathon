# Inter-Agent Communication System

## 1. Overview

The MateOS squad is a group of five specialized AI agents, each running as an independent
container with its own OpenClaw gateway. Without inter-agent communication, every agent
operates in isolation -- a sales agent cannot hand off a qualified lead to an admin agent
for onboarding, and a support agent cannot escalate a technical issue to a diagnostics
specialist.

The inter-agent communication system solves this by providing:

- **Task delegation** -- any agent can send a task to any other agent.
- **Service discovery** -- agents can query which other agents exist and what they can do.
- **Broadcast** -- one agent can fan out a message to all others (or a filtered subset).
- **Task tracking** -- a shared log of all delegated tasks with status updates.

The system is built on a lightweight HTTP router (no LLM, zero inference cost) that
sits between agents and relays messages through each agent's OpenClaw gateway API.

---

## 2. Architecture

```
                          +--------------------+
                          |   Agent Router     |
                          |   (FastAPI)        |
                          |   port 8080        |
                          +---------+----------+
                                    |
              SQUAD_AUTH_TOKEN on every request
                                    |
         +----------+----------+----+----+----------+----------+
         |          |          |         |          |          |
    +----+----+ +---+-----+ +-+-------+ +---+----+ +----+----+
    |Baqueano | |Tropero  | |Domador  | |Rastr.  | |Relator  |
    |Soporte  | |Ventas   | |Admin    | |Tech L1 | |Content  |
    |Cliente  | |Leads    | |Datos    | |Soporte | |Mktg     |
    |:18789   | |:18789   | |:18789   | |:18789  | |:18795   |
    +---------+ +---------+ +---------+ +--------+ +---------+
```

Each agent runs its own OpenClaw gateway on its designated port. The Agent Router
communicates with agents by posting messages to the gateway's `POST /api/call/chat.send`
endpoint. Agents communicate with the router via the `delegate.py` CLI script, which
makes HTTP calls to the router's REST API.

All containers share a Docker network. Agents address each other by Docker hostname
(e.g., `tropero-mateos`, `domador-mateos`). The router runs at `http://agent-router:8080`.

---

## 3. Agent Router

The Agent Router is a FastAPI service defined in `agents/router/main.py`. It performs
pure HTTP routing with no LLM calls -- its operational cost is zero beyond compute.

### Endpoints

#### GET /health

No authentication required. Returns router status.

**Response:**

```json
{
  "status": "ok",
  "agents": 5,
  "tasks_logged": 42
}
```

If `SQUAD_AUTH_TOKEN` is not set, returns `"status": "unhealthy"`.

---

#### GET /agents

Requires authentication. Returns all registered agents with their roles and capabilities.

**Response:**

```json
{
  "tropero": {
    "host": "tropero-mateos",
    "port": 18789,
    "role": "Ventas y Leads",
    "capabilities": ["sales", "leads", "pipeline", "follow_up", "meetings"],
    "description": "Contacta leads en <5 min, follow-up a 48h, pipeline en Google Sheets"
  },
  "domador": {
    "host": "domador-mateos",
    "port": 18789,
    "role": "Admin y Datos",
    "capabilities": ["sheets", "calendar", "tasks", "reports", "data_entry", "scheduling"],
    "description": "Google Sheets/Calendar, reportes diarios, seguimiento de deadlines"
  }
}
```

Note: the `token` field, if present in the registry, is never exposed through this
endpoint.

---

#### POST /route

Requires authentication. Sends a message from one agent to another.

**Request:**

```json
{
  "sender": "baqueano",
  "target": "tropero",
  "message": "Lead calificado por WhatsApp: Juan Perez, interesado en plan premium",
  "task_id": "lead-001",
  "priority": "urgent",
  "context": {
    "nombre": "Juan Perez",
    "tel": "+5491155551234",
    "interes": "plan premium"
  }
}
```

| Field      | Type   | Required | Default    | Description                                   |
|------------|--------|----------|------------|-----------------------------------------------|
| `sender`   | string | yes      | --         | Name of the sending agent                     |
| `target`   | string | yes      | --         | Name of the target agent                      |
| `message`  | string | yes      | --         | Task description / message body               |
| `task_id`  | string | no       | auto-gen   | Custom ID; auto-generated as `task-<hex8>` if empty |
| `priority` | string | no       | `"normal"` | `"normal"` or `"urgent"`                      |
| `context`  | object | no       | `{}`       | Arbitrary JSON context (lead info, etc.)      |

**Response (200):**

```json
{
  "task_id": "lead-001",
  "status": "delivered",
  "target": "tropero"
}
```

**Error responses:**

- `400` -- self-delegation (sender == target)
- `404` -- target agent not found in registry
- `422` -- missing required fields
- `502` -- target agent unreachable, timed out, or returned an error

---

#### POST /broadcast

Requires authentication. Sends a message to all agents (or those matching a capability
filter). The sender is automatically excluded from the recipient list.

**Request:**

```json
{
  "sender": "domador",
  "message": "Reporte semanal disponible en la planilla",
  "capability": "sales",
  "task_id": "weekly-report-03",
  "priority": "normal"
}
```

| Field        | Type   | Required | Default    | Description                                       |
|--------------|--------|----------|------------|---------------------------------------------------|
| `sender`     | string | yes      | --         | Name of the sending agent                         |
| `message`    | string | yes      | --         | Message body                                      |
| `capability` | string | no       | `""`       | Filter recipients by capability (empty = all)     |
| `task_id`    | string | no       | auto-gen   | Parent task ID; sub-tasks are `{task_id}-{agent}` |
| `priority`   | string | no       | `"normal"` | `"normal"` or `"urgent"`                          |

**Response (200):**

```json
{
  "task_id": "weekly-report-03",
  "targets": 1,
  "results": [
    {
      "task_id": "weekly-report-03-tropero",
      "status": "delivered",
      "target": "tropero"
    }
  ]
}
```

Broadcast uses `asyncio.gather` for concurrent fan-out. Partial failures are reported
per-target without aborting the entire broadcast.

---

#### GET /tasks

Requires authentication. Queries the in-memory task log.

**Query parameters:**

| Parameter | Type   | Default | Description                       |
|-----------|--------|---------|-----------------------------------|
| `sender`  | string | `""`    | Filter by sender agent name       |
| `target`  | string | `""`    | Filter by target agent name       |
| `status`  | string | `""`    | Filter by status                  |
| `limit`   | int    | `50`    | Max results (1-500)               |

**Response (200):**

```json
[
  {
    "task_id": "task-a1b2c3d4",
    "sender": "baqueano",
    "target": "tropero",
    "message": "Lead calificado por WhatsApp...",
    "priority": "urgent",
    "status": "delivered",
    "result": null,
    "created_at": "2026-03-18T14:30:00+00:00",
    "delivered_at": "2026-03-18T14:30:01+00:00",
    "error": null
  }
]
```

Returns the last `limit` entries after filtering. The task log is an in-memory deque
with a maximum of 500 entries. When full, the oldest entries are evicted automatically.

---

#### POST /tasks/{task_id}/update

Requires authentication. Allows an agent to report the result of a delegated task.

**Request:**

```json
{
  "status": "completed",
  "result": "Reunion agendada para manana 10am con Juan Perez"
}
```

At least one of `status` or `result` must be non-empty. The `result` field is truncated
to 2000 characters. If duplicate `task_id` entries exist, the most recent one is updated
(the log is iterated in reverse).

**Response (200):**

```json
{
  "task_id": "task-a1b2c3d4",
  "status": "completed"
}
```

**Error responses:**

- `404` -- task ID not found in the log
- `422` -- both `status` and `result` are empty

---

### Authentication

All endpoints except `/health` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <SQUAD_AUTH_TOKEN>
```

The token is compared against the `SQUAD_AUTH_TOKEN` environment variable. If the env
var is not set, the router starts in an unhealthy state and rejects all authenticated
requests.

---

### Task Log

The task log is an in-memory `collections.deque` with `maxlen=500`. It is not persisted
to disk. When the router restarts, all task history is lost. This is by design -- the
log is intended for operational visibility, not audit. Each task entry stores:

- `task_id`, `sender`, `target`, `message` (truncated to 500 chars), `priority`
- `status` (sent, delivered, error, unreachable, timeout, or custom via update)
- `result` (set via `/tasks/{id}/update`, truncated to 2000 chars)
- `created_at`, `delivered_at`, `updated_at`, `error`

---

### Registry

The registry is loaded at startup from two sources (merged in order):

1. **File** -- `AGENT_REGISTRY_FILE` env var (default: `/app/registry.json`)
2. **Environment variable** -- `AGENT_REGISTRY` (JSON string)

The env var entries override file entries with the same name. See Section 6 for the
registry schema.

---

## 4. delegate.py CLI

`delegate.py` is a standalone Python script (no external dependencies beyond stdlib)
that lives at `~/delegate.py` inside each agent container. It communicates with the
Agent Router over HTTP using `urllib`.

### Environment Variables

| Variable           | Required | Default                    | Description                     |
|--------------------|----------|----------------------------|---------------------------------|
| `SQUAD_AUTH_TOKEN`  | yes      | --                         | Shared squad authentication token |
| `AGENT_NAME`       | yes      | `"unknown"`                | This agent's name (used as sender) |
| `ROUTER_URL`       | no       | `http://agent-router:8080` | URL of the Agent Router         |

If `SQUAD_AUTH_TOKEN` is not set, `delegate.py` prints an error and exits with code 1
immediately.

### Subcommands

#### route -- Delegate a task to a specific agent

```bash
python3 ~/delegate.py route <target> "<message>" [options]
```

Options:
- `--task-id <id>` -- Custom task ID (auto-generated if omitted)
- `--priority <normal|urgent>` -- Task priority (default: normal)
- `--context '<json>'` -- Additional context as a JSON string

Examples:

```bash
# Basic delegation
python3 ~/delegate.py route tropero "Lead nuevo: Juan Perez, interesado en plan premium"

# With context
python3 ~/delegate.py route tropero "Contactar lead nuevo" \
  --context '{"nombre":"Juan Perez","tel":"+5491155551234","interes":"plan premium"}'

# Urgent priority
python3 ~/delegate.py route rastreador "Cliente no puede loguearse, error 403" --priority urgent

# Custom task ID
python3 ~/delegate.py route domador "Agendar onboarding" --task-id "lead-123-onboarding"
```

#### broadcast -- Send a message to all agents (or filtered by capability)

```bash
python3 ~/delegate.py broadcast "<message>" [options]
```

Options:
- `--capability <cap>` -- Only send to agents with this capability
- `--task-id <id>` -- Custom parent task ID
- `--priority <normal|urgent>` -- Task priority

Examples:

```bash
# Broadcast to everyone
python3 ~/delegate.py broadcast "Sistema actualizado, revisar pipelines"

# Only agents with sales capability
python3 ~/delegate.py broadcast "Nuevo pricing disponible" --capability sales
```

#### agents -- List available agents

```bash
python3 ~/delegate.py agents
```

Output:

```
  tropero         -- Ventas y Leads                  [sales, leads, pipeline, follow_up, meetings]
  domador         -- Admin y Datos                   [sheets, calendar, tasks, reports, data_entry, scheduling]
  rastreador      -- Soporte Tecnico L1              [tech_support, diagnostics, troubleshooting, known_issues, escalation]
  relator         -- Contenido y Marketing           [content, articles, social_media, newsletter, editorial, copywriting]
  baqueano        -- Soporte al Cliente              [customer_support, email, whatsapp, client_communication]
```

#### tasks -- View task history

```bash
python3 ~/delegate.py tasks [options]
```

Options:
- `--sender <name>` -- Filter by sender
- `--target <name>` -- Filter by target
- `--status <status>` -- Filter by status
- `--limit <n>` -- Max results (default: 20)

Examples:

```bash
# All recent tasks
python3 ~/delegate.py tasks

# Tasks sent by tropero
python3 ~/delegate.py tasks --sender tropero

# Delivered tasks targeting domador
python3 ~/delegate.py tasks --target domador --status delivered

# Last 5 tasks
python3 ~/delegate.py tasks --limit 5
```

#### update -- Report the result of a delegated task

```bash
python3 ~/delegate.py update <task_id> [options]
```

Options:
- `--status <status>` -- New status (e.g., `completed`, `failed`, `in_progress`)
- `--result <text>` -- Result summary

At least one of `--status` or `--result` is required.

Examples:

```bash
# Mark task as completed with result
python3 ~/delegate.py update task-a1b2c3d4 \
  --status completed \
  --result "Reunion agendada para manana 10am"

# Report failure
python3 ~/delegate.py update task-a1b2c3d4 \
  --status failed \
  --result "Cliente no responde al telefono, intentar manana"
```

### Error Handling

- **HTTP errors** -- Prints `Error HTTP <code>: <body>` to stderr and exits with code 1.
- **Connection errors** -- Prints `Error de conexion al router (<url>): <reason>` and exits with code 1.
- **Invalid JSON in --context** -- Prints error and exits with code 1.
- **Missing SQUAD_AUTH_TOKEN** -- Prints error and exits with code 1 before making any request.
- **Request timeout** -- 45 seconds (hardcoded in urllib).

---

## 5. Message Protocol

### [INTER-AGENT] Header Format

When the router delivers a message to an agent, it wraps it in a structured text format:

```
[INTER-AGENT]
from: baqueano
task_id: task-a1b2c3d4
priority: urgent
---
Lead calificado por WhatsApp: Juan Perez, interesado en plan premium
```

If the sender included a `context` object, it is appended as a `[CONTEXT]` block:

```
[INTER-AGENT]
from: baqueano
task_id: task-a1b2c3d4
priority: urgent
---
Lead calificado por WhatsApp: Juan Perez, interesado en plan premium

[CONTEXT]
{
  "nombre": "Juan Perez",
  "tel": "+5491155551234",
  "interes": "plan premium"
}
```

### How Receiving Agents Process Messages

When an agent receives a message starting with `[INTER-AGENT]`, it must:

1. Parse the header to extract `from`, `task_id`, and `priority`.
2. Execute the task according to its own SOUL.md and TOOLS.md rules.
3. Report the result using `delegate.py update <task_id> --status completed --result "..."`.
4. If it cannot resolve the task, delegate to another agent or escalate to the operator.

### Delivery Mechanism

Messages are delivered via each agent's OpenClaw gateway at:

```
POST http://<host>:<port>/api/call/chat.send
```

With the body:

```json
{
  "sessionKey": "agent:main:main",
  "message": "[INTER-AGENT]\nfrom: baqueano\ntask_id: task-a1b2c3d4\npriority: urgent\n---\nLead calificado...",
  "idempotencyKey": "ia-task-a1b2c3d4"
}
```

The `idempotencyKey` prevents duplicate delivery if the router retries.

### Task Lifecycle

```
  sender calls           router delivers          target completes
  delegate.py route      to gateway API           delegate.py update
       |                      |                         |
       v                      v                         v
    [sent] ---- HTTP 200 --> [delivered] --- work ---> [completed]
       |                      |                         |
       +--- HTTP error -----> [error]                   +---> [failed]
       +--- no connection --> [unreachable]
       +--- 30s exceeded ---> [timeout]
```

- **sent** -- Router accepted the request, about to deliver.
- **delivered** -- Gateway responded with HTTP 200.
- **error** -- Gateway responded with a non-200 status code, or an unexpected exception occurred.
- **unreachable** -- TCP connection to the agent failed.
- **timeout** -- Gateway did not respond within 30 seconds.
- **completed / failed / custom** -- Set by the receiving agent via `/tasks/{id}/update`.

---

## 6. Agent Registry

### registry.json Schema

The registry is a JSON object where each key is an agent name and the value describes
how to reach it.

```json
{
  "<agent-name>": {
    "host": "<docker-hostname>",
    "port": <gateway-port>,
    "role": "<human-readable role>",
    "description": "<what the agent does>",
    "capabilities": ["<cap1>", "<cap2>", "..."],
    "token": "<optional: per-agent gateway token>"
  }
}
```

| Field          | Type     | Required | Description                                        |
|----------------|----------|----------|----------------------------------------------------|
| `host`         | string   | yes      | Docker hostname or IP address                      |
| `port`         | integer  | yes      | OpenClaw gateway port                              |
| `role`         | string   | no       | Human-readable role label                          |
| `description`  | string   | no       | What the agent does                                |
| `capabilities` | string[] | no       | List of capability tags for broadcast filtering    |
| `token`        | string   | no       | Per-agent gateway token (falls back to SQUAD_AUTH_TOKEN) |

### Current Registry

| Agent       | Host              | Port  | Role                   | Capabilities                                                         |
|-------------|-------------------|-------|------------------------|----------------------------------------------------------------------|
| tropero     | tropero-mateos    | 18789 | Ventas y Leads         | sales, leads, pipeline, follow_up, meetings                          |
| domador     | domador-mateos    | 18789 | Admin y Datos          | sheets, calendar, tasks, reports, data_entry, scheduling             |
| rastreador  | rastreador-mateos | 18789 | Soporte Tecnico L1     | tech_support, diagnostics, troubleshooting, known_issues, escalation |
| relator     | relator-mateos    | 18795 | Contenido y Marketing  | content, articles, social_media, newsletter, editorial, copywriting  |
| baqueano    | baqueano-mateos   | 18789 | Soporte al Cliente     | customer_support, email, whatsapp, client_communication              |

### Adding a New Agent

1. Add the entry to `agents/router/registry.json`.
2. Rebuild and redeploy the router image, or set the `AGENT_REGISTRY` env var with the new entry to merge at runtime.
3. The new agent's container must have `SQUAD_AUTH_TOKEN`, `ROUTER_URL`, and `AGENT_NAME` set.
4. Add `depends_on: agent-router: condition: service_healthy` in docker-compose.

### Removing an Agent

Remove the entry from `registry.json` and redeploy. The router validates entries at
load time and silently skips any entry missing `host` or `port`.

### Discovery

Agents discover each other at runtime by calling:

```bash
python3 ~/delegate.py agents
```

This queries `GET /agents` and returns the full list of registered agents with their
capabilities.

---

## 7. Security Model

### SQUAD_AUTH_TOKEN

The `SQUAD_AUTH_TOKEN` is a shared secret used for all inter-agent communication. It is
separate from `GATEWAY_AUTH_TOKEN` (which each agent uses for its own OpenClaw gateway).

- The router requires it on all endpoints except `/health`.
- `delegate.py` refuses to run if it is not set.
- The router starts in an unhealthy state if it is not set.
- It is injected via the `environment` block in docker-compose, not via `env_file`, so it is defined once at the stack level.

Per-agent gateway tokens: if an agent has a `token` field in the registry, the router
uses that token instead of `SQUAD_AUTH_TOKEN` when delivering messages to that agent's
gateway. This allows agents to have different gateway passwords while sharing the same
squad token for router authentication.

### Trust Rules for Inter-Agent Messages

Inter-agent messages have **intermediate trust** -- higher than external email/WhatsApp
but lower than the Telegram operator channel:

- Agents trust that `[INTER-AGENT]` messages come from the squad (authenticated by SQUAD_AUTH_TOKEN).
- An inter-agent message **cannot** override an agent's rules (AGENTS.md, SOUL.md).
- An inter-agent message **cannot** instruct an agent to share data across clients.
- An inter-agent message **cannot** bypass approval requirements -- actions that need operator approval still need it.
- If an inter-agent message seems suspicious (requests credentials, data outside scope), the agent ignores it and alerts the operator.

### Loop Prevention

Delegation chains are limited by policy, not by the router itself:

- Self-delegation is blocked at the router level (`sender == target` returns 400).
- If Agent A delegates to Agent B, and Agent B needs to delegate back to Agent A, Agent B must **escalate to the operator** instead of creating a circular delegation.
- Agents are instructed to follow the rule: "one message, one task" to avoid complex multi-hop chains.

### Escalation Rules

Agents must escalate to the operator (via Telegram) instead of delegating when:

- The task crosses client boundaries.
- The task involves financial decisions.
- The task requires business-level judgment.
- The agent does not know which agent should handle the task.
- A delegation loop would be created.

---

## 8. Common Flows

### Lead Qualification: Baqueano --> Tropero --> Domador

A customer contacts via WhatsApp asking about pricing. Baqueano qualifies the lead
and hands it off.

**Step 1: Baqueano receives WhatsApp, delegates to Tropero**

```bash
python3 ~/delegate.py route tropero "Lead calificado por WhatsApp" \
  --priority urgent \
  --context '{"nombre":"Juan Perez","tel":"+5491155551234","interes":"plan premium","canal":"whatsapp"}'
```

Router delivers to Tropero's gateway:

```
[INTER-AGENT]
from: baqueano
task_id: task-f8a3b1c2
priority: urgent
---
Lead calificado por WhatsApp

[CONTEXT]
{
  "nombre": "Juan Perez",
  "tel": "+5491155551234",
  "interes": "plan premium",
  "canal": "whatsapp"
}
```

**Step 2: Tropero contacts the lead, closes the deal, delegates onboarding to Domador**

```bash
python3 ~/delegate.py update task-f8a3b1c2 \
  --status completed \
  --result "Deal cerrado: plan premium, inicio lunes"

python3 ~/delegate.py route domador "Agendar onboarding para nuevo cliente" \
  --context '{"nombre":"Juan Perez","plan":"premium","inicio":"lunes 10am"}'
```

**Step 3: Domador schedules in Calendar and updates the Sheet**

```bash
python3 ~/delegate.py update task-c4d5e6f7 \
  --status completed \
  --result "Onboarding agendado lunes 10am, planilla actualizada"
```

### Technical Issue: Tropero --> Rastreador

A sales agent encounters a client reporting a technical problem during a call.

```bash
python3 ~/delegate.py route rastreador "Cliente no puede loguearse, error 403" \
  --priority urgent \
  --context '{"cliente":"Acme Corp","email":"admin@acme.com","error":"HTTP 403 en /dashboard"}'
```

Rastreador diagnoses the issue and reports back:

```bash
python3 ~/delegate.py update task-a1b2c3d4 \
  --status completed \
  --result "Resuelto: token expirado, se regenero. Cliente puede acceder."
```

### Content Request: Tropero --> Relator

After closing a notable deal, the sales agent requests a success story.

```bash
python3 ~/delegate.py route relator "Crear caso de exito del cliente Acme Corp" \
  --context '{"cliente":"Acme Corp","plan":"enterprise","resultado":"reduccion 40% en tiempo de soporte"}'
```

Relator drafts the content and sends it to the operator for approval via Telegram,
then reports:

```bash
python3 ~/delegate.py update task-e5f6a7b8 \
  --status completed \
  --result "Draft de caso de exito enviado al operador para aprobacion"
```

---

## 9. Testing

### Test Suite

The router has a comprehensive test suite in `agents/router/test_main.py`. It covers:

- Health endpoint (no auth required)
- Authentication (valid, invalid, missing tokens)
- Agent discovery (`/agents`)
- Routing (`/route`) -- success, unknown target, self-delegation, unreachable, timeout, HTTP 500
- Broadcasting (`/broadcast`) -- fan-out, capability filtering, partial failure, sender exclusion
- Task log (`/tasks`) -- listing, filtering by sender/target/status, limit validation
- Task updates (`/tasks/{id}/update`) -- status, result, truncation, duplicate IDs
- Task log rotation (deque eviction at 500 entries)
- Concurrent task creation (20 parallel requests)
- Registry loading (file, env var, merge, invalid JSON)
- Edge cases (missing host/port, special characters, path traversal, large context, unicode)

### Running Tests

```bash
cd agents/router
SQUAD_AUTH_TOKEN=test-token pytest test_main.py -v
```

The test file sets `AGENT_REGISTRY_FILE=/dev/null` to prevent loading the real registry,
and injects sample agents via fixtures.

### Manual Testing with curl

Start the router locally:

```bash
cd agents/router
SQUAD_AUTH_TOKEN=my-secret python main.py
```

Health check (no auth):

```bash
curl http://localhost:8080/health
```

List agents:

```bash
curl -H "Authorization: Bearer my-secret" http://localhost:8080/agents
```

Route a message:

```bash
curl -X POST http://localhost:8080/route \
  -H "Authorization: Bearer my-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "domador",
    "target": "tropero",
    "message": "Test delegation",
    "priority": "normal"
  }'
```

Query task log:

```bash
curl -H "Authorization: Bearer my-secret" \
  "http://localhost:8080/tasks?sender=domador&limit=10"
```

Update a task:

```bash
curl -X POST http://localhost:8080/tasks/task-abc123/update \
  -H "Authorization: Bearer my-secret" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "result": "Done"}'
```

---

## 10. Configuration

### Docker Compose Setup

The production stack is defined in `agents/deployments/docker-compose.prod.yml`.

**Router service:**

```yaml
agent-router:
  image: ghcr.io/fabian416/gaucho-agents/agent-router:latest
  container_name: agent-router
  restart: unless-stopped
  environment:
    - SQUAD_AUTH_TOKEN=${SQUAD_AUTH_TOKEN}
    - ROUTER_PORT=8080
  healthcheck:
    test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 5s
```

**Agent service (example -- Tropero):**

```yaml
tropero-mateos:
  <<: *agent-base
  image: ghcr.io/fabian416/gaucho-agents/el-tropero:latest
  container_name: tropero-mateos
  hostname: tropero-mateos
  env_file: ./mateos-tropero/.env
  environment:
    - SQUAD_AUTH_TOKEN=${SQUAD_AUTH_TOKEN}
    - ROUTER_URL=http://agent-router:8080
    - AGENT_NAME=tropero
  depends_on:
    agent-router:
      condition: service_healthy
```

### Key Configuration Points

**depends_on with service_healthy** -- Every agent depends on the router being healthy
before starting. This ensures the router is ready to accept delegation requests when
agents boot.

**hostname** -- Each agent sets a Docker hostname matching the `host` field in
`registry.json` (e.g., `hostname: tropero-mateos` matches `"host": "tropero-mateos"`).
This is how the router resolves agent addresses on the Docker network.

**Gateway bind address** -- Agent gateways must bind to `0.0.0.0` (not `127.0.0.1`)
so the router can reach them from another container on the same Docker network.

**Environment variables per agent:**

| Variable           | Source                    | Description                                       |
|--------------------|---------------------------|---------------------------------------------------|
| `SQUAD_AUTH_TOKEN`  | Stack-level `.env`        | Shared secret for router auth                     |
| `ROUTER_URL`       | Hardcoded in compose      | Always `http://agent-router:8080`                 |
| `AGENT_NAME`       | Hardcoded in compose      | Must match the key in `registry.json`             |
| `GATEWAY_AUTH_TOKEN`| Agent-specific `.env`    | Per-agent gateway password (separate from squad token) |

**Port configuration:**

| Component     | Port  | Notes                                          |
|---------------|-------|-------------------------------------------------|
| Agent Router  | 8080  | Internal only, not exposed to host              |
| Most agents   | 18789 | OpenClaw gateway default port                   |
| Relator       | 18795 | Custom port (configured differently)            |

No ports are published to the host for inter-agent traffic. All communication happens
over the Docker bridge network.

### Router Dockerfile

The router image is minimal: Python 3.12 slim with FastAPI, httpx, and uvicorn. It runs
as a non-root user (`appuser`) and copies `main.py` and `registry.json` into `/app`.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN adduser --disabled-password --no-create-home appuser
COPY main.py .
COPY registry.json .
USER appuser
EXPOSE 8080
CMD ["python", "main.py"]
```

Dependencies: `fastapi==0.115.12`, `httpx==0.28.1`, `uvicorn==0.34.2`.
