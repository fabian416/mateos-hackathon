# MateOS -- Agent Types

> Last updated: 2026-03-18

MateOS deploys 7 specialized AI agents. All run inside a single OpenClaw container (`mateos-agents`) and communicate via `agentToAgent`. Each agent has its own Telegram bot and workspace.

---

## Summary Table

| Agent | Telegram Bot | Role | Key Channels |
|-------|-------------|------|--------------|
| Mateo CEO | @mateo_ceo_bot | Twitter content, strategy | Telegram, Twitter |
| El Tropero | @mateos_tropero_bot | Sales, leads, pipeline | Telegram, WhatsApp, Google Sheets, Calendar |
| El Domador | @mateos_domador_bot | Admin, data, reports | Telegram, Google Sheets, Calendar, Email |
| El Rastreador | @mateos_rastreador_bot | Tech support L1, triage | Telegram, WhatsApp, Email |
| El Relator | @mateos_relator_bot | Content, blog, newsletters | Telegram, Twitter, Google Sheets |
| El Paisano | @mateos_paisano_bot | Custom agent | Telegram (others optional) |
| El Baqueano | @mateos_baqueano_bot | Customer support | Telegram, WhatsApp (when enabled) |

---

## Mateo CEO -- Strategy / Twitter

**Role:** CEO agent and public face of the brand. Generates and publishes tweets, presents the agent lineup, educates about applied AI.

**Tweet Scheduler:** Runs as a background process (`tweet-scheduler.py`) inside the unified container. 6 daily time slots (ART): 09:00, 11:00, 13:00, 16:00, 19:00, 21:00. Generates with Gemini (Grok fallback). Unapproved suggestions auto-discard at the next slot.

**Content Calendar:**

| Day | Content Type |
|-----|-------------|
| Monday | Use case / problem the platform solves |
| Wednesday | Educational content about AI |
| Friday | Presentation of an agent type |

**Trust Level:** Starts at Level 2. Every tweet requires operator approval.

---

## El Tropero -- Sales / Leads

**Role:** Contacts new leads within 5 minutes, maintains follow-up cadence, schedules meetings, tracks the pipeline in Google Sheets.

**Pipeline Stages:**
```
nuevo -> contactado -> reunion_agendada -> propuesta_enviada -> negociando -> cerrado_ganado / cerrado_perdido
```

**Key Features:**
- Google Sheets CRM with timestamps and notes per lead
- 48-hour automated follow-up cadence
- Google Calendar integration for sales calls
- < 5 min first contact SLA for new leads

**Trust Level:** Starts at Level 2. Drafts and tracks in Sheets; operator approves all outbound.

---

## El Domador -- Admin / Data

**Role:** Manages data in Google Sheets, generates daily summaries and weekly reports, monitors deadlines, processes invoices by email.

**Report Cadence:**

| Report | Frequency | Time (ART) |
|--------|-----------|------------|
| Daily summary | Every day | 09:00 |
| Weekly report | Monday | 09:00 |
| Alerts | Real-time | Overdue tasks, deadlines < 48h |

**Reminder Escalation:** 48h reminder -> 24h urgent -> day-of final -> 1 day overdue alert -> 3 days overdue escalation.

**Trust Level:** Starts at Level 2. Reads/writes data autonomously; escalates outbound sends and calendar changes.

---

## El Rastreador -- Tech Support L1

**Role:** Diagnoses technical problems, provides step-by-step guides, applies known solutions, escalates to L2/L3.

**Core Principle:** Diagnosis BEFORE solution. Collect information first, fix second.

**Escalation Matrix:**

| Level | Who | Max Time |
|-------|-----|----------|
| L1 (Rastreador) | Agent | < 15 min |
| L2 (Technician) | Human specialist | < 2 hours |
| L3 (Development) | Dev team | < 4 hours |
| Crisis | Operator + management | Immediate |

**Difference from Baqueano:** Baqueano handles general support (inquiries, complaints). Rastreador handles technical L1 (diagnostics, decision trees, known issues).

**Trust Level:** Starts at Level 2. Diagnoses and drafts; operator approves sends and escalations.

---

## El Relator -- Content / Marketing

**Role:** Generates articles, social media posts, newsletters, documentation, and case studies. Manages an editorial calendar.

**Content Types:** Blog posts, social media posts, newsletters, documentation, case studies.

**Key Features:**
- Editorial calendar in Google Sheets
- Multi-format output (long-form, short-form, structured)
- All content requires operator approval before publication

**Trust Level:** Starts at Level 2. All content needs approval.

---

## El Paisano -- Custom Agent

**Role:** Fully customizable blank template. No predefined role -- channels, tools, and rules defined per client.

**Examples:** Appointment scheduling, collections, order tracking, survey/feedback, or any operational role.

**Customization:** Edit workspace files (IDENTITY.md, SOUL.md, AGENTS.md, TOOLS.md, HEARTBEAT.md) to define the agent's behavior, then configure channels as needed.

**Trust Level:** Starts at Level 2. Adjustable in AGENTS.md.

---

## El Baqueano -- Customer Support

**Role:** Front-line customer support. Handles inquiries across WhatsApp (when enabled) and email, follows approved response templates, escalates when it cannot resolve.

**SLAs:**

| Channel | Target |
|---------|--------|
| WhatsApp | < 15 min first response |
| Email | < 4 hours first response |
| Critical | < 30 min |

**Key Features:**
- Template-based responses from SOUL.md
- SLA tracking per channel
- Escalation to operator with full context

**Trust Level:** Starts at Level 2. All responses require operator approval.

---

## Choosing the Right Agent

| Need | Agent | Why |
|------|-------|-----|
| Answer customer questions | El Baqueano | SLA tracking, template responses |
| Contact and follow up leads | El Tropero | Pipeline, follow-up cadence, Sheets CRM |
| Keep records and calendars updated | El Domador | Data entry, deadline tracking, reports |
| Diagnose technical issues | El Rastreador | Diagnostic-first, structured escalation |
| Produce content | El Relator | Multi-format, editorial calendar |
| Twitter/X presence | Mateo CEO | Proactive scheduling, content calendar |
| Something else | El Paisano | Blank template, fully customizable |

### Common Squads

| Squad | Agents | Covers |
|-------|--------|--------|
| Customer-facing | Baqueano + Rastreador | General + technical support |
| Sales machine | Tropero + Relator | Pipeline + inbound content |
| Full operations | Baqueano + Tropero + Domador | Support + sales + admin |
| Complete | All 7 agents | End-to-end business automation |
