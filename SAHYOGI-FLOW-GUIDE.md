# Sahyogi flow guide

Open `Sahyogi-architecture-flow.excalidraw` in Excalidraw, then zoom out to see both sections.

## What works in the current demo

1. A team lead enters through the Next.js frontend.
2. On the home page they ask their personal Sahyogi a question. The answer is currently a safe seeded-demo response.
3. The Sahyogis page shows named employee counterparts and their context readiness.
4. The Continuity page turns Meera's absence into a reviewable handover; a human confirms the outstanding decision.
5. The Collective page combines Product, Engineering and Risk viewpoints into one launch recommendation.

The core user promise is simple: **capture context, preserve it through absence, then use it safely across teams.**

## AI model choice

Use **Sarvam-105B** (`sarvam-105b`) as the main production model for the hackathon: it suits the reasoning and agentic workflows behind handovers and cross-functional synthesis. Use **Sarvam-105B Conversations** only when you add a fast voice/chat experience. Keep the first demo text-first; Sarvam's Saaras v3 (speech-to-text) and Bulbul v3 (text-to-speech) can be added later for multilingual voice capture and voice replies.

## How a production request should work

1. An employee connects approved Google Workspace sources. n8n detects changes, cleans the source data and records an audit event.
2. Supabase stores users, teams, permissions, source metadata, handover tasks and approvals. Cognee indexes only permitted content into linked, retrievable context.
3. A user asks a question. The FastAPI endpoint verifies identity and role before LangGraph retrieves only documents allowed for that user.
4. LangGraph chooses the workflow: answer a question, create a handover draft, prepare a meeting brief, or combine several Sahyogis.
5. Sarvam AI generates a concise response using retrieved context. The UI displays the answer alongside source links, confidence/freshness and the option to correct it.
6. Any action that changes external data—sending a reminder, creating a task, sharing a brief—must wait for explicit human approval. MCP/function tools perform the action only after approval and write an audit log.

## How multiple Sahyogis merge

1. The user selects a goal and the participating Sahyogis.
2. Each Sahyogi retrieves context using its owner/team permission boundary; raw private context is not pooled indiscriminately.
3. A LangGraph coordinator asks each one for a short evidence-backed perspective.
4. The coordinator resolves conflicts, surfaces assumptions and returns a synthesis with named source contributors.
5. The user reviews it and approves any external action.

## Safe modifications to make first

- Replace the seeded objects in `app/page.tsx` with a small `data/demo-context.json` file.
- Connect the home prompt to `POST /ask`; keep a frontend fallback response for the pitch.
- Add a `sources` list to every answer so judges can see why the system answered.
- Add a “Capture context” form: project, decision, owner, next step and sensitivity.
- Add one live n8n workflow that ingests a sample Google Doc into Supabase; this is more convincing than integrating every source.

## Recommended feature additions

- **Knowledge risk radar:** detects a project with one knowledgeable owner, stale documentation or upcoming leave.
- **Voice-to-context:** a short Hindi/English voice note becomes an approved decision card via Sarvam.
- **Onboarding mode:** lets a new employee ask the departed employee’s Sahyogi what to do in their first week.
- **Decision timeline:** shows what changed, who approved it and the source behind it.
- **Freshness and confidence:** shows when a response was last grounded in a real source and asks the user to verify weak answers.

## Keep the hackathon scope tight

For the final demo, integrate just one real source, show one real ingestion, run one absence handover, then run one cross-functional merge. A traceable narrow workflow will be much more credible than many shallow integrations.
