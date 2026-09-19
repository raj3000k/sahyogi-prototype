# Sahyogi prototype

Sahyogi is a hackathon prototype for preserving employee context, guiding absence handovers, and safely combining cross-functional expertise.

## Run Step 1

Frontend:

```bash
npm install
npm run dev
```

Backend (optional in this first UI-focused step):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open `http://localhost:3000`. The home prompt, continuity review, team profiles, and collective merge are interactive seeded-demo states. The FastAPI service currently exposes a health check and a deliberately simple `/ask` contract, ready to replace with LangGraph orchestration.

## Planned architecture

- Next.js: presentation layer and authenticated workspace.
- FastAPI + LangGraph: permission-aware agent orchestration.
- Supabase/PostgreSQL: people, source metadata, approvals and handover state.
- Cognee: indexed employee context and retrieval graph.
- Sarvam AI: generation and multilingual voice/text moments.
- n8n + Google Workspace/MCP: source ingestion and action tools.
