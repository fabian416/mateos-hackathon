# MateOS Agent Types

MateOS deploys specialized AI agents for Argentine SMBs. Each agent type fills a specific operational role, runs in its own Docker container, and connects to clients through WhatsApp, email, and Telegram. Operators supervise and approve all outgoing messages via Telegram.

This document covers the 7 agent types available on the platform.

---

## Summary Table

| Agent | Role | Replaces | Default Channels | Key Capabilities |
|-------|------|----------|-------------------|------------------|
| El Baqueano | Customer Support | Support rep / help desk | Telegram, WhatsApp | Inquiry handling, SLA tracking, template responses, escalation |
| El Tropero | Sales / Leads | SDR / sales assistant | Telegram, WhatsApp, Google Sheets, Google Calendar | Lead follow-up, pipeline management, meeting scheduling |
| El Domador | Admin / Data | Administrative assistant | Telegram, Google Sheets, Google Calendar, Email | Data entry, reports, deadline tracking, invoice processing |
| El Rastreador | Technical Support L1 | L1 tech support agent | Telegram, WhatsApp, Email | Diagnostics, step-by-step guides, known issues, L2/L3 escalation |
| El Relator | Content / Marketing | Content writer / community manager | Telegram, Twitter, Google Sheets | Articles, social media posts, newsletters, editorial calendar |
| Mateo (El CEO) | Strategy / Twitter | Brand manager / social media lead | Telegram, Twitter | Tweet generation, content strategy, content calendar |
| El Paisano | Custom / Blank Template | Any role | Telegram (others optional) | Fully customizable -- channels, tools, and rules defined per client |

---

## El Baqueano -- Customer Support

**Deployment name:** `mateos-baqueano`

**Role:** Front-line customer support agent. Handles client inquiries across WhatsApp and email, diagnoses problems before responding, follows approved response templates, and escalates when it cannot resolve.

**Replaces:** Human support rep or help desk operator.

**Ideal for:** Businesses that receive frequent customer questions by WhatsApp or email and need fast, consistent responses around the clock.

### Channels

| Channel | Purpose | SLA |
|---------|---------|-----|
| WhatsApp | Primary support channel | < 15 min first response |
| Email | Secondary support channel | < 4 hours first response |
| Telegram | Operator communication and approvals | -- |

### Capabilities

- Responds to customer inquiries 24/7 on WhatsApp and email
- Diagnoses problems before proposing a solution
- Uses pre-approved response templates from SOUL.md
- Escalates to the human operator when it cannot resolve
- Tracks SLA compliance per channel
- Drafts responses for operator approval before sending

### Key Features

- **SLA tracking:** Enforces response time targets per channel (15 min WhatsApp, 4 hours email, 30 min critical).
- **Template-based responses:** All replies follow tested templates stored in SOUL.md. The agent identifies which template applies before drafting.
- **Escalation:** When the agent cannot resolve an issue, it escalates to the operator via Telegram with full context.
- **Trust levels:** Starts at Level 1 (Draft and Approve). All responses require operator approval. Can be promoted to Level 2 (auto-responds to simple queries) or Level 3 (full operational autonomy, only escalates complex issues).

### Deploy

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-baqueano --channels telegram,whatsapp,email
```

---

## El Tropero -- Sales / Leads

**Deployment name:** `mateos-tropero`

**Role:** Sales and lead management agent. Contacts new leads within 5 minutes, maintains follow-up cadence, schedules meetings, and tracks the entire pipeline in Google Sheets.

**Replaces:** SDR (Sales Development Representative) or sales assistant.

**Ideal for:** Businesses that generate inbound leads and need fast first contact, consistent follow-up, and pipeline visibility without hiring a dedicated sales person.

### Channels

| Channel | Purpose | SLA |
|---------|---------|-----|
| WhatsApp | Primary sales channel | < 5 min (new lead), < 30 min (follow-up) |
| Email | Secondary channel | < 4 hours |
| Google Sheets | Lead pipeline tracking | Updated on every interaction |
| Google Calendar | Sales meetings | Schedule within 72h of first contact |
| Telegram | Operator communication and approvals | -- |

### Capabilities

- Contacts new leads in under 5 minutes
- Follows up every 48 hours so no lead goes cold
- Schedules meetings with hot prospects
- Logs every interaction in Google Sheets (pipeline)
- Manages the sales meeting calendar
- Operates 24/7

### Pipeline Stages

```
nuevo -> contactado -> reunion_agendada -> propuesta_enviada -> negociando -> cerrado_ganado / cerrado_perdido
```

### Key Features

- **Google Sheets CRM:** The pipeline lives in a Google Spreadsheet. Each lead moves through defined stages with timestamps and notes.
- **Follow-up cadence:** Automated follow-up at 48-hour intervals. Proposals sent within 24 hours of a meeting.
- **Meeting scheduling:** Integrates with Google Calendar to book sales calls.
- **Trust levels:** Starts at Level 2 (drafts and tracks in Sheets, operator approves all outbound). Level 3 auto-sends simple follow-ups. Level 4 is full autonomy except for pricing and deal closures.

### Deploy

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-tropero --channels telegram,whatsapp,google-sheets,google-calendar
```

---

## El Domador -- Admin / Data

**Deployment name:** `mateos-domador`

**Role:** Administrative assistant agent. Manages data in Google Sheets, generates daily summaries and weekly reports, monitors deadlines, processes invoices received by email, and alerts on overdue tasks.

**Replaces:** Administrative assistant or data entry clerk.

**Ideal for:** Businesses that need to keep spreadsheets, calendars, and records up to date without dedicating a person full-time to admin work.

### Tools

| Tool | Purpose | Permission |
|------|---------|------------|
| Google Sheets | Task management, billing, contacts | Autonomous read/write |
| Google Calendar | Deadlines, events, reminders | Autonomous read, write with approval |
| Email (himalaya) | Invoice and document processing | Autonomous read, send with approval |
| Telegram | Operator communication | Autonomous |

### Capabilities

- Loads and updates data in Google Sheets (tasks, billing, contacts)
- Generates daily summaries and weekly reports
- Monitors deadlines and sends escalating reminders
- Processes invoices and documents received by email
- Queries Google Calendar for events and due dates
- Alerts on overdue tasks and data inconsistencies

### Report Cadence

| Report | Frequency | Time (ART) | Detail |
|--------|-----------|------------|--------|
| Daily summary | Every day | 09:00 | Completed tasks, pending items, alerts |
| Weekly report | Monday | 09:00 | Metrics, critical pending items, calendar |
| Alerts | Real-time | -- | Overdue tasks, deadlines < 48h away |

### Reminder Cadence

| Time Before Deadline | Type |
|----------------------|------|
| 48 hours | Reminder |
| 24 hours | Urgent reminder |
| Day of deadline | Final alert |
| 1 day overdue | Overdue alert |
| 3 days overdue | Escalation to operator |

### Key Features

- **Scheduled reports:** Automatic daily and weekly summaries sent to the operator via Telegram.
- **Deadline tracking:** Escalating reminders from 48 hours before a deadline through to operator escalation at 3 days overdue.
- **Trust levels:** Starts at Level 2 (reads/writes data and generates reports autonomously, escalates outbound sends and calendar changes). Level 3 is full autonomy except for deletions and financial commitments.

### Deploy

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-domador --channels telegram,google-sheets,google-calendar,email
```

---

## El Rastreador -- Technical Support L1

**Deployment name:** `mateos-rastreador`

**Role:** Level 1 technical support agent. Diagnoses technical problems reported by customers, provides step-by-step resolution guides, applies known solutions, and escalates to L2 (specialized technician) or L3 (development team) when it cannot resolve.

**Replaces:** L1 tech support agent or help desk technician.

**Ideal for:** Businesses with a technical product or service that receive recurring support tickets requiring diagnosis and troubleshooting before escalation.

### Core Principle

> Diagnosis BEFORE solution. First understand what is happening, then fix it.

### Channels

| Channel | Purpose | SLA |
|---------|---------|-----|
| WhatsApp | Primary support channel | < 15 min first response |
| Email | Secondary channel | < 4 hours first response |
| Telegram | Operator communication and approvals | -- |

### Escalation Matrix

| Level | Who Resolves | Max Time |
|-------|-------------|----------|
| L1 -- El Rastreador | Agent | < 15 min |
| L2 -- Technician | Specialized technician | < 2 hours |
| L3 -- Development | Development team | < 4 hours |
| Crisis | Operator + management | Immediate |

### Capabilities

- Diagnoses technical problems from customer reports via WhatsApp and email
- Gathers information before proposing solutions (never assumes)
- Applies known solutions with step-by-step guides
- Escalates to L2 or L3 with all collected diagnostic information
- Drafts all responses for operator approval
- Operates 24/7

### Key Features

- **Diagnostic-first approach:** The agent always collects information and identifies the problem before suggesting a fix.
- **Known issues database:** Maintains a list of known problems with tested solutions (configured via `{{CLIENT_KNOWN_ISSUES}}` placeholder).
- **Structured escalation:** Escalates to L2 or L3 with full diagnostic context so the next tier does not need to re-diagnose.
- **Trust levels:** Starts at Level 2 (diagnoses, classifies, and drafts -- operator approves sends and escalations). Level 3 is full autonomy except for complex issues.

### Difference from El Baqueano

El Baqueano handles **general** customer support (inquiries, information, complaints). El Rastreador handles **technical** L1 support: diagnosing problems, following decision trees, applying known solutions, and escalating with full diagnostic data.

### Deploy

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-rastreador --channels telegram,whatsapp,email
```

---

## El Relator -- Content / Marketing

**Deployment name:** `mateos-relator`

**Role:** Content and communications agent. Generates articles, social media posts, newsletters, documentation, and case studies. Manages an editorial calendar and tracks content production.

**Replaces:** Content writer, community manager, or marketing assistant.

**Ideal for:** Businesses that need consistent content output across blog, social media, and email but do not have a dedicated content team.

### Channels

| Channel | Purpose |
|---------|---------|
| Telegram | Operator communication, content approval (required) |
| Twitter | Direct post publication (optional) |
| Email | Newsletter distribution (optional) |
| Google Sheets | Editorial calendar and content tracking (optional) |
| Google Calendar | Publication scheduling (optional) |

### Capabilities

- Writes blog posts, articles, and case studies
- Creates social media posts (Twitter, LinkedIn-style copy)
- Drafts newsletters for email distribution
- Produces internal documentation
- Manages an editorial calendar in Google Sheets
- Schedules content publication via Google Calendar

### Content Types

- Blog posts and articles
- Social media posts
- Newsletters
- Documentation
- Case studies

### Key Features

- **Editorial calendar:** Tracks content topics, deadlines, and publication status in a Google Spreadsheet.
- **Approval workflow:** All content requires operator approval via Telegram before publication.
- **Multi-format output:** Can produce long-form (articles), short-form (tweets, posts), and structured content (newsletters, docs).
- **Trust level:** Starts at Level 2 (Draft and Approve). All content needs approval before it goes live.

### Deploy

```bash
cd agents/_base
./deploy.sh --client-name mi-empresa --agent-type el-relator --channels telegram
```

---

## Mateo (El CEO) -- Strategy / Twitter

**Deployment name:** `mateos-ceo`

**Role:** CEO agent and public face of the brand. Generates and publishes content on Twitter/X, presents the agent lineup, educates about applied AI, and represents the brand with authority and approachability.

**Replaces:** Brand manager, social media lead, or founder doing their own Twitter.

**Ideal for:** The MateOS brand itself (or any business that wants an AI-driven Twitter presence with a consistent voice and content calendar).

### Channels

| Channel | Purpose |
|---------|---------|
| Twitter/X | Content publication |
| Telegram | Operator communication and approvals |

### Capabilities

- Generates tweets and threads for Twitter/X
- Presents each of the 6 agent types with concrete use cases
- Educates about AI applied to Argentine businesses
- Represents the brand with authority and approachability
- Responds to public interactions (with approval)

### Content Calendar

| Day | Content Type |
|-----|-------------|
| Monday | Use case / problem the platform solves |
| Wednesday | Educational content about AI |
| Friday | Presentation of an agent type |

### Scheduling

The agent operates in proactive mode with 6 daily time slots (ART): 09:00, 11:00, 13:00, 16:00, 19:00, 21:00. It generates up to 6 tweet suggestions per day, rotating through content types: use case, educational, agent presentation, opinion, and data point. Unapproved suggestions are auto-discarded when the next slot arrives.

### Twitter API (Free Tier)

- 1,500 tweets/month (sufficient for 3-5 per week)
- Write-only (cannot read timeline or search)
- Mention monitoring must be done manually

### Key Features

- **Standalone scheduler:** Proactively generates content at scheduled time slots without operator prompting.
- **Content rotation:** Cycles through different content types to maintain variety.
- **Trust level:** Starts at Level 1 (Draft and Approve). Every tweet requires explicit operator approval before publication.

### Workflow

```
1. Time slot arrives (or operator requests content)
2. Mateo drafts a tweet or thread
3. Presents it via Telegram for approval
4. Operator: approve / modify / discard
5. If approved -> Mateo publishes via Twitter API
```

### Deploy

```bash
cd agents/_base
./deploy.sh --client-name mateos --agent-type el-ceo --channels telegram
```

After deploying, add the Twitter API credentials to the `.env` file:

```
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
```

---

## El Paisano -- Custom / Blank Template

**Deployment name:** varies per client

**Role:** Fully customizable agent template. No predefined role -- you define what it does, how it talks, and what tools it uses.

**Replaces:** Whatever role the client needs automated.

**Ideal for:** Businesses whose needs do not map cleanly to one of the 6 predefined agent types, or who want to build something entirely new.

### Examples of Custom Agents

- Appointment scheduling agent
- Collections / accounts receivable agent
- WhatsApp sales agent
- Order tracking agent
- Survey and feedback agent
- Any other operational role

### Available Channels

| Channel | Purpose | Notes |
|---------|---------|-------|
| Telegram | Operator communication | Always active, required |
| WhatsApp | Client-facing interactions | Real-time via OpenClaw |
| Email | Client-facing interactions | Via himalaya, polled every 60s |
| Google Sheets | Data and records | Read/write via API |
| Google Calendar | Appointments and events | Availability management |
| Twitter/X | Content and engagement | Publication and monitoring |

### How to Customize

**Step 1 -- Deploy the template**

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-paisano --channels telegram
```

This creates a copy of the blank template in `deployments/mi-cliente/` with all files ready to complete.

**Step 2 -- Complete the workspace files**

| File | What to Define |
|------|---------------|
| `IDENTITY.md` | Agent name, role, scope, AI model, channels |
| `SOUL.md` | Personality, response templates, escalation rules, SLAs |
| `AGENTS.md` | Custom rules, autonomy table (what it can do alone, what needs approval, what is blocked) |
| `TOOLS.md` | Active integrations, client context, knowledge base |
| `HEARTBEAT.md` | Periodic tasks and schedules (if applicable) |

**Step 3 -- Define the rules**

- **Autonomy table** (AGENTS.md): Which actions the agent can perform autonomously, which need approval, and which are blocked.
- **Templates** (SOUL.md): Pre-written responses for the most common scenarios.
- **Escalation** (SOUL.md): When and to whom the agent escalates.
- **SLAs** (SOUL.md): Response time targets per channel.

**Step 4 -- Activate channels**

Edit `config/channels.json` and enable only the channels the agent needs.

**Step 5 -- Deploy**

```bash
cd agents/_base
./deploy.sh --client-name mi-cliente --agent-type el-paisano --channels telegram,whatsapp
```

### Trust Levels

Starts at Level 2 (Draft and Approve). Adjustable in AGENTS.md.

| Level | What the Agent Can Do |
|-------|----------------------|
| 1 | Drafts everything, operator approves all |
| 2 | Autonomous on simple tasks, approval for the rest |
| 3 | Full operational autonomy, only escalates complex issues |

---

## Choosing the Right Agent

### Decision Matrix

| Your Need | Best Agent | Why |
|-----------|-----------|-----|
| Answer customer questions on WhatsApp/email | El Baqueano | Purpose-built for customer support with SLA tracking and template responses |
| Contact and follow up with sales leads | El Tropero | Pipeline management, automated follow-up cadence, Google Sheets CRM |
| Keep spreadsheets, calendars, and records updated | El Domador | Automated data entry, deadline tracking, daily/weekly reports |
| Diagnose and resolve technical issues | El Rastreador | Diagnostic-first approach, known issues database, structured L2/L3 escalation |
| Produce blog posts, social media content, newsletters | El Relator | Multi-format content generation, editorial calendar, approval workflow |
| Maintain a Twitter/X presence for the brand | El CEO (Mateo) | Proactive tweet generation, content calendar, scheduled publishing |
| Something else entirely | El Paisano | Blank template -- define the role, tools, and rules from scratch |

### When to Combine Agents (Squads)

A single business often needs more than one agent. Common combinations:

| Squad | Agents | Covers |
|-------|--------|--------|
| Customer-facing | Baqueano + Rastreador | General support + technical support |
| Sales machine | Tropero + Relator | Lead pipeline + content for inbound |
| Full operations | Baqueano + Tropero + Domador | Support + sales + admin |
| Complete | All 6 standard agents | End-to-end business automation |

### Shared Infrastructure

All agents share the same base infrastructure:

- **Framework:** OpenClaw (open-source, multi-channel)
- **Runtime:** Individual Docker containers per agent
- **AI Model:** Claude (Anthropic) as the core engine
- **Supervision:** All outgoing messages require operator approval via Telegram
- **Isolation:** Each client deployment is fully isolated -- no data shared between businesses
