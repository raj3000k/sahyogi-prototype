from __future__ import annotations

import hmac
import re
from datetime import datetime, timezone
from typing import Any, Optional, Union

import httpx
from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import create_client, Client


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_environment: str = "development"
    n8n_webhook_secret: str = ""
    cognee_base_url: str = ""
    cognee_api_key: str = ""
    cognee_timeout_seconds: float = 60.0

    supabase_url: str = ""
    supabase_service_role_key: str = ""


settings = Settings()
app = FastAPI(title="Sahyogi API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4_000)
    sahyogi_id: str = "raj"
    dataset: Optional[str] = None


class KnowledgeIngestionRequest(BaseModel):
    organization_id: str = Field(min_length=1, max_length=120)
    agent_id: str = Field(min_length=1, max_length=120)
    source_provider: str = Field(min_length=1, max_length=80)
    source_external_id: str = Field(min_length=1, max_length=300)
    title: str = Field(min_length=1, max_length=500)
    content: str = Field(min_length=1, max_length=200_000)
    source_url: Optional[str] = Field(default=None, max_length=2_000)
    sensitivity: str = "internal"
    updated_at: Optional[datetime] = None


class KnowledgeSearchRequest(BaseModel):
    organization_id: str
    agent_id: str
    query: str = Field(min_length=1, max_length=4_000)
    search_type: str = "CHUNKS"


def dataset_name(organization_id: str, agent_id: str) -> str:
    """Creates a stable, non-user-controlled Cognee dataset identifier."""
    safe = re.compile(r"[^a-zA-Z0-9_-]")
    return f"org_{safe.sub('_', organization_id)}__agent_{safe.sub('_', agent_id)}"


def verify_n8n_secret(provided_secret: Optional[str]) -> None:
    if not settings.n8n_webhook_secret:
        if settings.app_environment != "development":
            raise HTTPException(status_code=500, detail="N8N_WEBHOOK_SECRET is required outside development")
        return
    if not provided_secret or not hmac.compare_digest(provided_secret, settings.n8n_webhook_secret):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid n8n webhook secret")


class CogneeClient:
    def __init__(self) -> None:
        self.base_url = settings.cognee_base_url.rstrip("/")

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if settings.cognee_api_key:
            headers["X-Api-Key"] = settings.cognee_api_key
        return headers

    def _configured(self) -> None:
        if not self.base_url:
            raise HTTPException(status_code=503, detail="Cognee is not configured. Set COGNEE_BASE_URL.")

    async def ingest(self, document: KnowledgeIngestionRequest) -> dict[str, Any]:
        self._configured()
        dataset = dataset_name(document.organization_id, document.agent_id)
        enriched_text = "\n".join(
            [
                f"Title: {document.title}",
                f"Provider: {document.source_provider}",
                f"External ID: {document.source_external_id}",
                f"Sensitivity: {document.sensitivity}",
                f"Source URL: {document.source_url or 'not supplied'}",
                "--- Content ---",
                document.content,
            ]
        )
        async with httpx.AsyncClient(timeout=settings.cognee_timeout_seconds) as client:
            headers = {}
            if settings.cognee_api_key:
                headers["X-Api-Key"] = settings.cognee_api_key
            add_response = await client.post(
                f"{self.base_url}/api/v1/add",
                headers=headers,
                data={"datasetName": dataset},
                files={"data": ("document.txt", enriched_text.encode('utf-8'), "text/plain")},
            )
            add_response.raise_for_status()
            cognify_response = await client.post(
                f"{self.base_url}/api/v1/cognify",
                headers=self._headers(),
                json={"datasets": [dataset]},
            )
            cognify_response.raise_for_status()
        return {"dataset": dataset, "add": add_response.json(), "cognify": cognify_response.json()}

    async def search(self, request: KnowledgeSearchRequest) -> dict[str, Any]:
        self._configured()
        dataset = dataset_name(request.organization_id, request.agent_id)
        async with httpx.AsyncClient(timeout=settings.cognee_timeout_seconds) as client:
            response = await client.post(
                f"{self.base_url}/api/v1/search",
                headers=self._headers(),
                json={"query": request.query, "search_type": request.search_type, "datasets": [dataset]},
            )
            response.raise_for_status()
        return {"dataset": dataset, "results": response.json()}


cognee = CogneeClient()

# Supabase Client Initialization
def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Supabase is not configured.")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

@app.get("/health")
def health() -> dict[str, Union[str, bool]]:
    return {
        "status": "ok",
        "service": "sahyogi-api",
        "cognee_configured": bool(settings.cognee_base_url),
    }


@app.post("/ask")
async def ask_sahyogi(request: AskRequest) -> dict[str, Any]:
    """Temporary query endpoint. LangGraph and Sarvam are added after retrieval is proven."""
    if not settings.cognee_base_url:
        return {
            "answer": f"Sahyogi received: {request.question}",
            "sources": ["demo-context/merchant-onboarding.md"],
            "confidence": 0.0,
            "mode": "demo",
        }
    result = await cognee.search(
        KnowledgeSearchRequest(organization_id="paytm-innovation-lab", agent_id=request.sahyogi_id, query=request.question)
    )
    return {"answer": "Retrieved context is ready for the reasoning layer.", "sources": result, "confidence": None, "mode": "retrieval"}


@app.post("/webhooks/n8n/knowledge-ingested", status_code=status.HTTP_202_ACCEPTED)
async def ingest_from_n8n(
    document: KnowledgeIngestionRequest,
    x_sahyogi_webhook_secret: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    """Receives normalised text only; n8n owns provider OAuth and source fetching."""
    verify_n8n_secret(x_sahyogi_webhook_secret)
    try:
        result = await cognee.ingest(document)
    except httpx.HTTPError as error:
        error_msg = repr(error)
        if isinstance(error, httpx.HTTPStatusError):
            error_msg = f"{error.response.status_code} - {error.response.text}"
        raise HTTPException(status_code=502, detail=f"Cognee ingestion failed: {error_msg}") from error
    return {
        "status": "accepted",
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "dataset": result["dataset"],
    }


@app.post("/knowledge/search")
async def search_knowledge(request: KnowledgeSearchRequest) -> dict[str, Any]:
    """Internal endpoint; add Supabase JWT/RBAC checks before exposing it to the UI."""
    try:
        return await cognee.search(request)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Cognee search failed: {error}") from error

# --- Agent Management Endpoints ---

class AgentCreateRequest(BaseModel):
    name: str
    title: str
    role: str
    team_id: str
    organization_id: str = "00000000-0000-0000-0000-000000000001"
    status: str = "Offline"
    avatar_skin: Optional[str] = None
    avatar_hair: Optional[str] = None
    avatar_shirt: Optional[str] = None
    role_based_access: Optional[str] = None
    shared_memory_agent_ids: Optional[list[str]] = []

class AgentUpdateRequest(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    avatar_skin: Optional[str] = None
    avatar_hair: Optional[str] = None
    avatar_shirt: Optional[str] = None
    role_based_access: Optional[str] = None
    shared_memory_agent_ids: Optional[list[str]] = None

@app.get("/api/organizations")
def get_organizations() -> dict[str, Any]:
    supabase = get_supabase()
    result = supabase.table("organizations").select("*").execute()
    return {"organizations": result.data}

@app.get("/api/teams")
def get_teams() -> dict[str, Any]:
    supabase = get_supabase()
    result = supabase.table("teams").select("*, agents(*)").execute()
    return {"teams": result.data}

@app.get("/api/agents")
def get_agents() -> dict[str, Any]:
    supabase = get_supabase()
    result = supabase.table("agents").select("*, agent_shared_memory!agent_shared_memory_source_agent_id_fkey(target_agent_id)").execute()
    return {"agents": result.data}

@app.post("/api/agents")
def create_agent(agent: AgentCreateRequest) -> dict[str, Any]:
    supabase = get_supabase()
    payload = agent.model_dump()
    shared_ids = payload.pop("shared_memory_agent_ids", [])
    result = supabase.table("agents").insert(payload).execute()
    
    if result.data and shared_ids:
        new_agent_id = result.data[0]["id"]
        shared_payload = [{"source_agent_id": new_agent_id, "target_agent_id": target_id} for target_id in shared_ids]
        supabase.table("agent_shared_memory").insert(shared_payload).execute()
        
    return {"status": "success", "agent": result.data[0] if result.data else None}

@app.patch("/api/agents/{agent_id}")
def update_agent(agent_id: str, agent: AgentUpdateRequest) -> dict[str, Any]:
    supabase = get_supabase()
    payload = agent.model_dump(exclude_unset=True)
    shared_ids = payload.pop("shared_memory_agent_ids", None)
    
    if payload:
        result = supabase.table("agents").update(payload).eq("id", agent_id).execute()
        agent_data = result.data[0] if result.data else None
    else:
        # If only shared_ids were provided, fetch the agent to return it
        res = supabase.table("agents").select("*").eq("id", agent_id).execute()
        agent_data = res.data[0] if res.data else None
        
    if shared_ids is not None:
        supabase.table("agent_shared_memory").delete().eq("source_agent_id", agent_id).execute()
        if shared_ids:
            shared_payload = [{"source_agent_id": agent_id, "target_agent_id": target_id} for target_id in shared_ids]
            supabase.table("agent_shared_memory").insert(shared_payload).execute()

    return {"status": "success", "agent": agent_data}

@app.delete("/api/agents/{agent_id}")
def delete_agent(agent_id: str) -> dict[str, Any]:
    supabase = get_supabase()
    supabase.table("agents").delete().eq("id", agent_id).execute()
    return {"status": "success"}
