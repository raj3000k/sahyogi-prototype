# Sahyogi — Living Project Context

> **Purpose:** This is the handoff and continuity document for Sahyogi. Give this file to Cursor, Claude, another coding agent, or a new contributor before asking them to work on the project. Update it whenever a meaningful product, design, architecture, or implementation decision changes.

**Last updated:** 2026-09-19  
**Project stage:** Polished hackathon frontend; backend is intentionally a thin FastAPI starter.  
**Primary goal:** Demonstrate that an AI counterpart can preserve employee knowledge, continue work safely during absence, and collaborate across functions without crossing permission boundaries.

---

## 1. Product in one minute

Sahyogi is an **AI workforce and knowledge-continuity platform** for Paytm-like teams.

Each employee or functional role has a persistent **Sahyogi**: an AI counterpart with approved work context, defined responsibilities, live workplace connections, scoped permissions, task history, and an audit trail.

The main narrative for judges/users is:

1. **Capture context** from approved workplace sources.
2. **Keep work moving** while an employee is unavailable or leaves.
3. **Coordinate specialised AI agents** for cross-functional work.
4. **Require human approval** for sensitive, uncertain, or irreversible actions.

The UI currently focuses on a highly presentable demo. Do not over-engineer the first backend; build one reliable, traceable end-to-end workflow first.

---

## 2. Current stack

| Layer | Current choice | Status |
| --- | --- | --- |
| Frontend | Next.js 15, React 19, TypeScript | Implemented |
| Interaction/motion | Framer Motion | Implemented |
| Backend | FastAPI + Pydantic | Starter endpoints implemented |
| Knowledge graph/retrieval | Cognee | Planned |
| Agent orchestration | LangGraph | Planned |
| Primary reasoning model | Sarvam-105B | Planned integration |
| Voice later | Sarvam Saaras v3 STT + Bulbul v3 TTS | Planned |
| Auth/database/audit | Supabase/PostgreSQL | Planned |
| Source automation | n8n | Planned |
| External action tools | MCP/function calling | Planned |
| Frontend deployment | Vercel | Planned |
| Backend deployment | Render/Railway/Fly.io or AWS free tier where suitable | Planned |

### Model-routing decision

- **Start with `sarvam-105b` only.** It is the primary model for reliable agentic reasoning, handover generation and cross-functional synthesis.
- Add a cheaper/smaller route later only after the core workflow works. Use it for classification, extraction, language detection, simple summaries, and draft triage.
- Use the stronger model for sensitive reasoning, complicated knowledge synthesis, tool selection, and executive-facing output.
- Never let model routing bypass retrieval, RBAC, tool-policy checks, or human approval.

---

## 3. Repository map

```text
app/
  layout.tsx                 Next.js root metadata/layout
  page.tsx                   Entire current interactive frontend prototype
  globals.css                All styling, responsive rules, motion styling
backend/
  main.py                    FastAPI starter: GET /health and POST /ask
  requirements.txt           Python dependencies
PROJECT_CONTEXT.md           This living handoff document
README.md                    Basic run commands and original architecture note
Sahyogi-architecture-flow.excalidraw
                             Editable architecture and flow diagram
SAHYOGI-FLOW-GUIDE.md        Detailed explanatory flow guide
package.json                 Frontend dependencies and commands
```

### Important source files

- `app/page.tsx` holds all seeded demo data, UI state, routes, agent editing, Sales-AI prototype flows, and Support-AI prototype flows. It is intentionally a single file for hackathon speed.
- `app/globals.css` is similarly consolidated. Do not split it until the demo workflow is stable.
- `backend/main.py` is not connected to the UI yet. It exists only to establish the intended FastAPI service boundary.

---

## 4. How to run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Backend, once needed:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Validation used so far:

```bash
npx tsc --noEmit
```

The project previously encountered a local Next native-SWC trace-generation issue during `next build`; TypeScript validation passes. Treat that as an environment/dependency-install issue unless reproduced in a clean environment.

---

## 5. Current product UI

### Main navigation

- **Home:** personal Sahyogi prompt, knowledge-continuity callout, operating metrics.
- **Sahyogis:** the main functional-team drill-down.
- **ROI dashboard:** static demo metrics for autonomous tasks, hours saved and escalations.

### Sahyogis drill-down

Browser history is supported with query-string routes. The browser back/forward buttons and breadcrumbs work for:

```text
All verticals → functional vertical → agentic team → individual agent hierarchy
```

Functional verticals currently seeded:

1. Sales & Business Development / `Sales-AI`
2. Customer Service / `Support-AI`
3. Finance & Accounting / `Finance-AI`
4. Merchant & Business Operations / `Ops-AI`
5. Human Resources & Administration / `HR-AI`

### Agent cards

Each agent currently presents:

- Cartoon SVG vector face, generated from editable skin/hair/shirt colour fields
- Agent name, role, stable-looking ID and reporting line
- Live/working status with green dot and pixel-style animated `•••` loader
- Active task and ETA
- Connections, e.g. Salesforce, Slack, Gmail, Google Calendar, Zendesk, HRIS, internal operations tools
- Today’s schedule
- Role-based access boundary
- Review score/rating

### Working frontend-only controls

At an agent-team page:

- **Add agent** opens a modal and adds an agent locally.
- **View profile** opens an editable modal.
- **Remove** asks for confirmation and removes the agent locally.
- Editable fields include: name, role, ID for new agents, status, role-based access, skills, approved context, current task, ETA, platform connections and daily schedule.

These changes are **local React state only** and reset on browser refresh. That is expected until Supabase is connected.

---

## 6. Current Sales-AI prototype

Navigate to:

```text
Sahyogis → Sales & Business Development
```

The **Agentic Teams** section intentionally appears before the command-centre features. This was a specific UI request: users should see the responsible agent teams before the tools they run.

Sales team examples:

- POS Growth
- Enterprise Partnerships
- QR Merchant Acquisition

Sales-AI command-centre workflows currently rendered as seeded, clickable demo states:

1. **Lead Scout**
   - Finds public/approved prospect signals.
   - Shows a review queue with merchant, signal, product fit and status.
   - Must not create CRM records without a human review.

2. **Lead Qualifier**
   - Suggests qualification questions.
   - Flags inconsistent identity details, incomplete documentation and settlement-information changes for human review.

3. **Growth Finder**
   - Identifies cross-sell opportunities for existing merchants using approved merchant/product data.
   - Example product fits include QR, POS, Soundbox, Payment Links and Payment Gateway.

4. **Pitch Copilot**
   - Produces a merchant-specific meeting brief, opening, evidence and recommended next action.
   - Must not invent pricing, discounts, commitments or eligibility.

5. **Territory Planner**
   - Planned: prioritise visits based on potential, locality/proximity, relationship status and follow-up urgency.

6. **Meeting Intelligence**
   - Planned: create agenda/prep, capture minutes, draft CRM updates, and ask for approval before writing externally.

Additional high-value Sales-AI features to consider after the first workflow:

- Next-best-action and best-contact-time recommendations
- Consent-aware outreach sequence drafts
- Deal-risk warnings: stalled stage, no decision-maker, missing paperwork, competitor signal
- Field-sales visit briefing and post-visit summary
- Merchant activation/onboarding checklist
- Churn/low-usage early-warning for existing merchants
- Sales-manager coaching based on approved call notes and outcomes

---

## 7. Current Support-AI prototype

Navigate to:

```text
Sahyogis → Customer Service
```

Support-AI command-centre workflows:

1. **Omnichannel Triage**
   - Demonstrates email, social DMs, chat and call-note intake.
   - Classifies intent, urgency, sentiment and customer tier.
   - Routes to a queue/specialist or safe auto-resolution.

2. **Multilingual Resolver**
   - Intended for English, Hinglish and Indian-language support.
   - Uses approved policy/knowledge retrieval before responding.
   - Asks a clarifying question or escalates when the answer is not grounded.

3. **Smart Routing and Handoff**
   - Generates a concise handoff: merchant, issue, sentiment, checks performed and recommended next owner.
   - Human escalation when resolution fails, risk is detected, or a customer requests a person.

4. **Resolution Guardrails**
   - Product targets shown in the UI:
     - 60%+ eligible tickets auto-resolved
     - under 3 seconds target first response/interaction latency
     - zero unsupported policy, price or discount claims
     - 100% of handoffs carry a concise context summary

Additional Support-AI features to consider:

- Duplicate-issue detection and incident clustering
- Customer-impact/outage broadcast workflow with approval
- Automatic follow-up after resolution to confirm closure
- Quality-assurance sampling and coaching for human agents
- Fraud/account-security routing rules with no AI-led irreversible action
- SLA breach prediction and proactive callback queue
- Knowledge-base gap detection from unresolved conversations

---

## 8. Non-negotiable safety and product rules

1. **Permission boundary first:** retrieve only sources a requesting user and a selected Sahyogi may access.
2. **KYA (Know Your Agent):** every agent must have an immutable identity, owner/team, role, allowed tools, permission scope, lifecycle status and audit trail.
3. **No silent external write:** messages, CRM updates, task creation, refunds, settlement changes or account changes need a defined policy and, initially, human approval.
4. **Grounded answers:** policy, price, discounts, refund rules, eligibility and compliance answers must be retrieved from an approved and fresh source. If unavailable, the agent must say so and escalate.
5. **Confidence escalation:** low confidence, sensitive domain, fraud signal, PII, money movement, legal/compliance, or irreversible action must escalate.
6. **Audit every decision:** record what was asked, sources used, model/tool decision, action proposed, approval result, action result and feedback.
7. **Do not scrape private data:** lead research must use legal public sources, data supplied by the business, or an approved provider/API, with rate limits and consent/privacy review.
8. **Human override:** a manager must be able to pause/disable an agent or revoke a connection immediately.

---

## 9. Backend architecture to build

```text
Next.js UI
  ↓ authenticated request
FastAPI API
  ├─ Supabase auth/JWT verification + RBAC / KYA policy gate
  ├─ LangGraph workflow router
  │   ├─ retrieval from Cognee + allowed source metadata
  │   ├─ Sarvam model call
  │   ├─ confidence / policy / action gate
  │   └─ MCP or function tool proposal/execution
  ├─ Supabase/PostgreSQL transactional data + audit records
  └─ n8n webhooks / scheduled ingestion workflows
       └─ Google Workspace, CRM, Slack, Gmail, Calendar, etc.
```

### Keep responsibilities separate

| Component | Responsibility |
| --- | --- |
| Next.js | User interface, streamed results, approvals, live status display |
| FastAPI | API boundary, auth verification, policy decisions, orchestration entrypoint |
| Supabase | Identity, relational data, permissions, approvals, task state, audit logs |
| Cognee | Ingested knowledge graph/retrieval graph; do not use as the permission system |
| LangGraph | Explicit multi-step workflow/state management |
| Sarvam | Language understanding/generation/voice, not database policy enforcement |
| n8n | Scheduled/event-based ingestion and external-system automation |
| MCP/functions | Narrow tools with typed inputs, policy checks and audited results |

---

## 10. Recommended database model

Use Supabase/PostgreSQL migrations. Do not put all context into a single JSON blob.

### Core identity and organisation

```text
organizations(id, name)
users(id, organization_id, email, display_name, role, status)
teams(id, organization_id, name, functional_vertical)
team_members(user_id, team_id, team_role)
agents(id, organization_id, team_id, owner_user_id, name, role, status, model_route)
agent_skills(id, agent_id, skill_name, proficiency, approved)
agent_connections(id, agent_id, provider, scope, status, last_sync_at)
agent_permission_policies(id, agent_id, resource, action, conditions_json, enabled)
```

### Knowledge and continuity

```text
knowledge_sources(id, organization_id, provider, external_id, title, uri, owner_user_id,
                  sensitivity, permission_scope, freshness_at, checksum)
knowledge_ingestion_runs(id, source_id, status, started_at, completed_at, error)
handover_briefs(id, agent_id, status, absence_start, absence_end, brief_json, reviewed_by)
handover_items(id, handover_brief_id, category, owner, decision_needed, status)
```

### Tasks, approvals and audit

```text
agent_tasks(id, agent_id, requester_id, type, status, input_json, output_json,
            confidence, due_at, started_at, completed_at)
agent_task_steps(id, task_id, step_type, status, source_refs_json, tool_name,
                 model_name, latency_ms, input_json, output_json)
approval_requests(id, task_id, action_type, risk_level, payload_json, status,
                  requested_at, decided_by, decided_at)
audit_events(id, organization_id, actor_type, actor_id, event_type, entity_type,
             entity_id, reason, metadata_json, created_at)
feedback(id, task_id, user_id, score, correction, created_at)
```

### Sales-specific first tables

```text
sales_leads(id, organization_id, source, business_name, contact_data_json,
            qualification_status, human_review_status, assigned_agent_id)
merchant_product_signals(id, merchant_id, current_products_json,
                         suggested_product, rationale, status)
sales_meeting_briefs(id, lead_id, agent_id, content_json, approved_by)
```

### Support-specific first tables

```text
support_conversations(id, channel, external_thread_id, merchant_id, status,
                      intent, sentiment, urgency, customer_tier, assigned_agent_id)
support_handoffs(id, conversation_id, from_agent_id, to_agent_or_user_id,
                 summary, reason, status)
support_policy_sources(id, category, source_id, effective_from, effective_to)
```

Enable Row Level Security (RLS) for every organisation-scoped table. Start with simple explicit policies based on organisation membership and assigned-team access.

---

## 11. Backend implementation plan — easy, small steps

### Step 1 — Make the frontend talk to FastAPI

Goal: prove the real UI → API path without AI, database or external tools.

1. Add `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` to `.env.local`.
2. Add CORS to FastAPI for local Next.js origin.
3. Replace the seeded home prompt response with `POST /ask`.
4. Return a structured response from FastAPI:

```json
{
  "answer": "...",
  "sources": [{"title": "Demo merchant onboarding brief", "uri": "..."}],
  "confidence": 0.92,
  "requiresApproval": false
}
```

5. Add visible loading, error and source states in the frontend.

**Definition of done:** entering a prompt shows a real FastAPI response and graceful error fallback.

### Step 2 — Create Supabase and store agents

Goal: remove local-only agent data.

1. Create a Supabase project.
2. Add only `organizations`, `users`, `teams`, `agents`, `agent_skills`, and `agent_connections` first.
3. Seed the existing Paytm Innovation Lab demo organisation, five verticals, current teams and agent profiles.
4. Use Supabase Auth for the demo user.
5. Replace frontend local add/edit/remove state with authenticated FastAPI CRUD endpoints.
6. Add audit records for every agent change.

**Definition of done:** agents remain after refresh and agent CRUD is organisation-scoped.

### Step 3 — Build one grounded knowledge workflow

Goal: prove “context continuity,” not generic chat.

1. Create 3–5 curated markdown/Google Doc demo sources for one team (start with Sales POS Growth).
2. Store source metadata and permissions in Supabase.
3. Ingest source content through Cognee.
4. Build `POST /agents/{agent_id}/ask`:
   - verify requester and agent permissions
   - retrieve allowed context
   - call Sarvam-105B
   - return answer + source references + confidence
5. Show source chips in the UI.

**Definition of done:** the agent answers a team-specific question with visible source references and refuses unavailable/private knowledge.

### Step 4 — Implement Sales Lead Scout as the first tool workflow

Goal: one credible agentic task, from user intent to reviewed output.

1. Use a curated CSV or approved lead-provider/demo data source first; do not begin with uncontrolled web scraping.
2. Define a lead-review schema: merchant, source/signal, proposed fit, qualification status, confidence, owner, notes.
3. Add a LangGraph workflow:
   - load approved prospect data
   - deduplicate and validate required fields
   - score potential fit
   - produce a **review queue**, never CRM write directly
4. Add a manager approval button.
5. Only after approval, use a narrowly scoped Salesforce/CRM tool to create/update a lead.
6. Write an audit event for the recommendation, review and CRM result.

**Definition of done:** “Run Lead Scout” produces a reviewable table; an approved item creates a CRM record and leaves an audit trail.

### Step 5 — Add approval and confidence policy

Goal: make the demo safe and explainable.

1. Define risk classes: informational, draft, external write, financial/security-sensitive.
2. Add an approval record and approval UI.
3. Route uncertain retrieval, sensitive source, external action, low confidence, fraud cues and payment/account changes to approval.
4. Make the UI explain: proposed action, reason, sources, confidence and the expected external effect.

**Definition of done:** no external tool call runs silently.

### Step 6 — Build Support Triage second

Goal: demonstrate a second vertical using the same platform primitives.

1. Ingest a small, de-identified support dataset and approved policy documents.
2. Classify intent, sentiment, urgency and language.
3. Retrieve matching policy and previous solved patterns.
4. Auto-resolve only explicitly safe intents (for example, status information or policy-grounded FAQs).
5. Generate a handoff summary for everything else.
6. Measure first-response latency, resolution path and escalation rate.

**Definition of done:** one simulated omnichannel ticket is classified, answered from policy or handed off with a useful summary.

### Step 7 — Add n8n connections and scheduled work

Goal: make agents look operationally alive.

1. Add one n8n workflow that polls or receives a webhook from a demo Google Drive/Sheet source.
2. On a change, create a `knowledge_ingestion_run` and update Cognee.
3. Add one scheduled workflow, such as a morning Sales pipeline risk brief.
4. Display a real task status, connection status and last-sync time in the agent card.

**Definition of done:** one source change flows into agent knowledge and one scheduled task appears in the UI.

### Step 8 — Add multi-agent collaboration last

Goal: a compelling final demo, built on secure primitives.

1. A user selects a goal and participating agents.
2. Each agent retrieves only permitted context.
3. LangGraph gathers independent perspectives.
4. A coordinator generates a synthesis, disagreements and sources.
5. Any shared external action still requires approval.

**Definition of done:** Sales + Ops + Finance agents prepare a traceable merchant launch/recovery recommendation.

---

## 12. Suggested FastAPI route contract

Start small. Avoid exposing raw database or model operations directly to the frontend.

```text
GET    /health
POST   /ask

GET    /agents
POST   /agents
GET    /agents/{agent_id}
PATCH  /agents/{agent_id}
DELETE /agents/{agent_id}

GET    /agents/{agent_id}/status
GET    /agents/{agent_id}/schedule
POST   /agents/{agent_id}/ask

POST   /sales/lead-scout/runs
GET    /sales/lead-scout/runs/{run_id}
POST   /sales/leads/{lead_id}/approve

POST   /support/conversations/triage
POST   /support/conversations/{conversation_id}/handoff

GET    /approvals
POST   /approvals/{approval_id}/decision
GET    /audit-events
```

Use Pydantic request/response models for all of these. Return typed status values, source references, confidence, required approvals and user-safe error messages.

---

## 13. Environment variables (do not commit secrets)

Create `.env.example` with placeholders only:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SARVAM_API_KEY=

COGNEE_...=

SALESFORCE_...=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
N8N_WEBHOOK_URL=
```

Never expose the Sarvam key, service-role key, OAuth client secret or CRM secret to Next.js browser code. Keep them in FastAPI/server-side environment variables.

---

## 14. Design language and UX rules

- Feel: calm, premium, lightly playful operational workspace.
- Palette: soft off-white, charcoal sidebar, pale sage surfaces, muted violet/orange/mint/blue/rose team accents.
- Typography: Manrope + Playfair Display + DM Mono in the app; Virgil/sketch-like typography in the Excalidraw board.
- Agent avatars: custom SVG vector faces, not raster images. Keep them editable/customisable.
- Live agents: green live dot and a small pixel-style `•••` animation—not a circular spinner.
- Motion: use Framer Motion sparingly for cards/panels entering view. Respect `prefers-reduced-motion` when the app becomes production-ready.
- Put **Agentic Teams above Command Centre workflows** on every vertical.
- Show reasons, sources, status, ETA and human approval state instead of generic “AI magic.”

---

## 15. Demo script

1. Start on Home: “Sahyogi retains the working context, not just chat history.”
2. Go to Sahyogis: show five functional verticals.
3. Open Sales: show Agentic Teams first, then open POS Growth.
4. Show Tara working on live follow-ups, her tools, ETA, schedule, access and manager.
5. Go back to Sales and run Lead Scout. Show a reviewable lead table, not an automatic CRM write.
6. Open Growth Finder or Pitch Copilot to show merchant-aware selling.
7. Go to Support: triage an omnichannel issue, show multilingual policy-grounded response and human handoff summary.
8. Close with Continuity/Collective concept: knowledge survives absence and agents cooperate under permissions.

---

## 16. What not to do next

- Do not connect every external source at once.
- Do not claim autonomous refunds, settlement changes, policy decisions or fraud decisions.
- Do not introduce a vector database without source metadata and permission filtering.
- Do not let the LLM directly call broad CRM/email APIs.
- Do not replace working demo flows with an empty “chatbot.”
- Do not build a complicated microservice architecture for the hackathon.

---

## 17. Change-log protocol for future agents

When making meaningful changes:

1. Implement and validate the change.
2. Update the relevant section in this file.
3. Add a dated bullet below with: change, files touched, test/verification and any open decision.
4. Do not rewrite past decisions without noting why they changed.

### Changelog

- **2026-09-19 — Step 1 completed (Next.js to FastAPI).** Connected the frontend Home/Sales prompt to call FastAPI's `/ask` endpoint. Added CORS to the backend and `.env.local` configuration. UI now displays retrieved context with sources, confidence, and handles errors gracefully. Files: `backend/main.py`, `.env.local`, `app/page.tsx`.
- **2026-09-19 — n8n/Cognee backend seam added.** FastAPI now has protected n8n ingestion and Cognee search endpoints, configuration template and a manual n8n ingestion workflow. Files: `backend/main.py`, `backend/.env.example`, `backend/requirements.txt`, `n8n/`.
- **2026-09-19 — Frontend prototype expanded.** Added team drill-down, browser-history routing, custom SVG agents, live work status, schedules, editable local agent profiles, Sales-AI workflow demos, Support-AI workflow demos, Framer Motion entry effects and the pixel-style live loader. Primary files: `app/page.tsx`, `app/globals.css`, `package.json`.
- **2026-09-19 — Backend plan established.** Chosen build order: API connection → Supabase persistence → one grounded Sales workflow → approval policy → Support triage → n8n ingestion → multi-agent synthesis.

---

## 18. Immediate next task

Implement **Step 2: Create Supabase and store agents**. Remove local-only agent data. Create a Supabase project, add initial tables (`organizations`, `users`, `teams`, `agents`, etc.), and replace frontend local add/edit/remove state with authenticated FastAPI CRUD endpoints.
