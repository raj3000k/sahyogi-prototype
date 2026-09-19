# Sahyogi n8n workflows

## First workflow: source change to agent memory

1. Start FastAPI on port 8000 and Cognee on a different port or use Cognee Cloud.
2. Copy `backend/.env.example` to `backend/.env`, set `N8N_WEBHOOK_SECRET`, `COGNEE_BASE_URL` and, for Cognee Cloud, `COGNEE_API_KEY`.
3. Import `sahyogi-manual-ingestion.json` into n8n.
4. In **Send normalised source to Sahyogi**, set the HTTP URL:
   - n8n running directly on the same machine: `http://localhost:8000/webhooks/n8n/knowledge-ingested`
   - n8n running in Docker on macOS/Windows: `http://host.docker.internal:8000/webhooks/n8n/knowledge-ingested`
   - production: your HTTPS FastAPI URL.
5. Replace the sample header value with the same secret in `backend/.env`.
6. Execute the workflow manually. FastAPI should respond `202` with a Cognee dataset name.

## Upgrade it to Google Drive

1. Add a **Google Drive Trigger** or **Google Drive** node after the trigger.
2. Use an OAuth credential created in n8n's Credentials screen; never paste Google credentials into workflow JSON.
3. Limit the folder to one approved Sales/POS-Growth demo folder.
4. Download the file content, extract/normalise text, then use a **Set** or **Code** node to produce this exact JSON shape:

```json
{
  "organization_id": "paytm-innovation-lab",
  "agent_id": "SL-MGR-014",
  "source_provider": "google_drive",
  "source_external_id": "provider-file-id",
  "title": "source title",
  "content": "normalised plain text only",
  "source_url": "optional source link",
  "sensitivity": "internal"
}
```

5. Add an **IF** node before the FastAPI request that rejects empty content and content outside an approved folder/source.
6. In production, use an n8n credential for the header secret rather than the literal demo value in this starter workflow.

Do not let n8n call Cognee directly. The FastAPI policy boundary must receive, validate, audit and scope every source first.
