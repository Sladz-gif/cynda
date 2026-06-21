
# Deploying the Automation Service

The React app stays on Vercel exactly as it is today. This service is
a **separate, small, always-on Python process**  Vercel's serverless
model can't host it because the scheduler (APScheduler) needs a
persistent process to keep its in-memory clock ticking between runs.

## Recommended host: Railway (simplest) or Render/Fly (also fine)

Any of the three work near-identically for this use case. Railway has
the lowest setup friction for a single FastAPI service with a
background scheduler, so it's the default recommendation  but nothing
in the code is Railway-specific.

### Railway steps
1. `railway init` from `/automation-service`
2. Add a `Procfile` (included) so Railway knows the start command
3. Set all variables from `.env.example` in Railway's dashboard → Variables
4. Deploy. Railway gives you a `https://*.up.railway.app` URL.
5. Use that URL as the webhook target in Supabase (see
   `docs/supabase_webhooks_setup.md`) and as `NEXT_PUBLIC_AUTOMATION_API_URL`
   (or equivalent) in your Vercel React app's env vars.

### Render / Fly.io
Same idea: point them at `automation-service/`, start command
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`, set the same env
vars. Fly needs a `fly.toml` (not included  ask if you want one
generated; Railway/Render need no extra config file beyond the
Procfile already here).

## Connecting the two halves

```
┌─────────────────┐         ┌──────────────────────┐
│   React (Vercel)│ ──────▶ │  Supabase (Postgres,  │
│                 │  reads  │  Auth)  unchanged    │
└─────────────────┘  /writes └──────────────────────┘
        │                              │ Database
        │ calls for                    │ Webhooks
        │ automation-                  ▼
        │ specific UI         ┌──────────────────────┐
        └────────────────────▶│ Automation Service    │
                             │ (Railway/Render/Fly)  │
                             │ - webhook receiver    │
                             │ - poller (APScheduler)│
                             │ - scheduler (cron)    │
                             │ - LLM calls           │
                             └──────────────────────┘
```

- The React app keeps using the Supabase client directly for all
  normal CRUD (deals, invoices, tasks, etc.)  nothing changes there.
- The React app calls the automation service **only** for
  automation-specific UI: the Automations settings panel, the
  activity/audit feed, "Run now" buttons, and approve/reject on
  LLM-drafted content.
- Supabase calls the automation service via Database Webhooks when
  rows change that an EVENT automation cares about.

## Environment variables to set on the host
See `.env.example` in this folder. The two most important to get right:
- `SUPABASE_SERVICE_ROLE_KEY`  never expose this to the browser/Vercel;
  it only lives on this backend host.
- `SUPABASE_WEBHOOK_SECRET`  must match exactly what you put in the
  Supabase Webhook's custom header config.

## Local development
```bash
cd automation-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
uvicorn app.main:app --reload --port 8000
```
Then hit `http://localhost:8000/docs` for the interactive OpenAPI UI 
useful for manually testing `/automations/{key}/run` against your real
Supabase data before wiring up the frontend.
