# Cynda Automation Engine  Full Build Spec for Trae

## What you are building

You are building the **Python automation backend** for an existing SaaS
product called **Cynda**. Cynda's motto is *"with Cynda, every day is a
holiday"* and its core promise is *increasing productivity by 100%* by
automating tedious tasks, analytics, and reports across CRM, Finance,
Projects, and HR.

**The existing app already works and must not be touched or broken:**
- A React frontend, deployed on Vercel.
- A Supabase project (Postgres database, Auth, and some existing Edge
  Functions) that already has working tables for things like deals,
  invoices, staff, and tasks.

**What's missing, and what you're adding:** a standalone Python
backend service  the "automation engine"  that:
1. Listens for specific database changes (via Supabase Database
   Webhooks) and reacts to them instantly (e.g. a deal closes → suggest
   a project).
2. Polls for conditions that don't have a natural trigger moment (e.g.
   "this deal has been quiet for 7 days").
3. Runs on a schedule (e.g. "every Monday at 8am, summarize the week
   for leadership").
4. Calls an LLM (Claude, via Anthropic's API, swappable to other
   providers) to draft human-quality text  follow-up emails, payment
   reminders, project kickoff summaries, leadership briefings.
5. Exposes a small REST API that the existing React app calls to show
   automation status, run history, and to let users manually trigger or
   approve/reject AI-drafted content.

This new service is **completely separate from the Vercel deployment**.
It must run as its own always-on process (Railway, Render, Fly.io, or
similar  NOT Vercel serverless functions, which cannot host a
persistent background scheduler). It connects to the **same** Supabase
Postgres database as the existing app, using a service-role key.

---

## Build order  follow these phases in sequence

Do not skip ahead. Each phase should be working and verifiable before
moving to the next.

### Phase 1  Project scaffold
Create the exact directory structure shown in "Full File Tree" below,
under a new top-level folder `automation-service/` (sibling to wherever
the existing React app's repo root is  do not nest this inside the
React app's `src/`).

### Phase 2  Core contracts (no business logic yet)
Implement, in this order, using the exact code given in "Complete File
Contents" below:
1. `app/automations/base.py`  the `BaseAutomation` abstract class every
   automation will implement, plus `AutomationContext`, `AutomationResult`,
   `TriggerType`, `Department`.
2. `app/automations/registry.py`  the `@register_automation` decorator
   and lookup functions.
3. `app/automations/engine.py`  `run_automation()`, the single
   chokepoint that calls `should_trigger()` → `run()` and logs the
   result.
4. `app/core/supabase_client.py`  service-role Supabase client.
5. `app/llm/client.py`  provider-agnostic LLM adapter (Claude default).

After this phase, the project should import without errors even though
no automations exist yet.

### Phase 3  Implement the six automations
Create each file exactly as given, one per department subfolder:
- `app/automations/crm/stale_deal_followup.py`
- `app/automations/finance/budget_threshold_alert.py`
- `app/automations/finance/overdue_invoice_reminder.py`
- `app/automations/projects/won_deal_kickoff.py`
- `app/automations/hr/new_hire_checklist.py`
- `app/automations/cross/weekly_briefing.py`

Then create `app/automations/loader.py`, which imports all six so their
`@register_automation` decorators run.

**Verify this phase** by writing a throwaway script that calls
`load_all()` then `all_automations()` and prints the count  it must
print exactly 6, with the trigger types: 3 `poll`, 2 `event`, 1
`schedule`.

### Phase 4  Execution infrastructure
1. `app/core/poller.py`  runs every `POLL`-type automation on its
   configured interval, fanned out across all orgs.
2. `app/core/scheduler.py`  runs every `SCHEDULE`-type automation on
   its cron expression, fanned out across all orgs.
3. `app/core/auth.py`  verifies the Supabase JWT sent by the React
   frontend and resolves it to an `org_id`.

   **Important  this file needs a real schema decision from the
   person you're building for before you finalize it.** The function
   `_resolve_org_id()` currently assumes a `staff` table with columns
   `auth_user_id` and `org_id`. Before treating this file as final,
   confirm the actual column/table names in the existing Supabase
   schema and adjust the query to match. Do not guess silently  ask
   or flag it clearly in a code comment if you cannot verify it.

### Phase 5  API routes
1. `app/routes/webhooks.py`  receives Supabase Database Webhook POSTs,
   verifies a shared secret, finds matching `EVENT` automations via the
   registry, and runs them.
2. `app/routes/automations.py`  the management API: list automations,
   list run history, manually trigger, approve/reject AI-drafted
   content.

### Phase 6  Entrypoint
`app/main.py`  wires everything together: loads automations on
startup, starts the APScheduler instance with poll + cron jobs
registered, mounts the webhook and automations routers, adds a
`/health` endpoint.

**Verify this phase** by running:
```bash
uvicorn app.main:app --reload --port 8000
```
then hitting `GET http://localhost:8000/health` (expect
`{"status": "ok"}`) and `GET http://localhost:8000/docs` (expect the
interactive OpenAPI UI listing all routes).

### Phase 7  Database migration
Run the SQL in `supabase/migrations/0001_automation_tables.sql` against
the existing Supabase project. This creates new tables
(`automation_runs`, `deal_drafts`, `invoice_drafts`,
`project_suggestions`, `briefings`, `notifications`), adds a few new
columns to existing tables (`deals`, `invoices`, `staff`), and sets up
Row Level Security policies so end users can read their own org's data
through the normal Supabase client.

**Before running this migration**, check that the existing `deals`,
`invoices`, `staff`, `organizations`, and `tasks` tables actually exist
with those exact names and a `uuid` primary key + `org_id` foreign key
convention. If the real schema differs, adjust the migration's foreign
key types and column references accordingly  do not run it blind
against production.

`supabase/migrations/0002_optional_pg_net_trigger.sql` is a reference
alternative (raw SQL trigger instead of the Dashboard Webhooks UI) 
not required, only use it if asked.

### Phase 8  Wire up Supabase Database Webhooks
Follow `docs/supabase_webhooks_setup.md` exactly: two webhooks need to
be created in the Supabase Dashboard (Database → Webhooks), one on
`deals` UPDATE, one on `staff` INSERT, both pointing at the deployed
service's `/webhooks/supabase` endpoint with a shared secret header.

This step requires the service to be deployed first (see Phase 9) since
it needs a live HTTPS URL.

### Phase 9  Deploy
Follow `docs/deployment.md`. Recommended host: Railway (simplest setup
for a single FastAPI service with a background scheduler). Render or
Fly.io work equally well. Set all environment variables from
`.env.example` on the host. Do not deploy this to Vercel.

### Phase 10  Frontend integration
Copy `frontend-integration/automationApi.ts` into the existing React
app (suggested location: `src/lib/automationApi.ts`). It reuses the
app's existing Supabase Auth session  no new login flow needed. Wire
it into:
- An "Automations" settings panel that calls `listAutomations()` and
  shows each automation's name, department, trigger type, and an
  LLM-powered badge, with a manual "Run now" button calling
  `triggerAutomation(key)`.
- An activity/audit feed calling `listAutomationRuns()`.
- Review cards for AI-drafted content (`deal_drafts`, `invoice_drafts`,
  `project_suggestions`) with Approve/Reject buttons calling
  `approveDraft()` / `rejectDraft()`.

Set `VITE_AUTOMATION_API_URL` (or the equivalent for whatever bundler
the existing app uses  adjust the env var read in `automationApi.ts`
if it's not Vite) in the Vercel project's environment variables,
pointing at the deployed automation service's URL.

---

## Non-negotiable design constraints

These are deliberate decisions already made. Do not "improve" them
without flagging the change first:

1. **AI-drafted content is never auto-sent.** Follow-up emails, payment
   reminders, and project kickoff suggestions are written to a
   `pending_review` status in their respective `*_drafts` /
   `*_suggestions` table. A human must approve before anything goes
   out. This is intentional risk management, not a missing feature 
   do not wire these directly to an email-send function without
   explicit instruction to do so.

2. **The LLM provider is swappable, not hardcoded.** Automations call
   `ctx.llm.complete(system=..., prompt=...)` against the
   `LLMClient` interface in `app/llm/client.py`. They never import
   `anthropic` or `openai` directly. Default provider is Claude
   (`claude-sonnet-4-6`), controlled by the `LLM_PROVIDER` env var.

3. **Every automation implements one contract.** `should_trigger()`
   (cheap, no side effects) then `run()` (does the work). The engine,
   poller, scheduler, and API routes never contain automation-specific
   logic  they only know how to call this contract. When adding a 7th
   automation later, only two things change: a new file in the
   relevant department folder, and one new import line in
   `app/automations/loader.py`. Nothing else.

4. **Service-role key discipline.** `app/core/supabase_client.py` uses
   the Supabase service-role key, which bypasses Row Level Security
   entirely. This key must never be sent to the browser or committed to
   git  it only lives in the automation service's host environment.
   Because there's no RLS safety net at this layer, every database
   query in every automation MUST explicitly filter by `org_id`. Treat
   a missing `org_id` filter as a bug, not a style preference.

5. **One audit trail.** Every automation run  triggered or skipped,
   successful or failed  funnels through `run_automation()` in
   `engine.py`, which writes to the `automation_runs` table. Don't
   bypass this by calling automation `run()` methods directly from
   routes or jobs.

---

## Tech stack to use exactly as specified

- **Python 3.11+**
- **FastAPI** for the HTTP API
- **APScheduler** (`AsyncIOScheduler`) for polling and cron  not Celery,
  not a separate task queue. This is a deliberate simplicity choice for
  a service of this size; revisit only if scale demands it later.
- **supabase-py** (`supabase` package) as the Postgres client  talk to
  the database through Supabase's client, not a raw `psycopg2`/SQLAlchemy
  connection, to stay consistent with how the rest of the app already
  accesses data.
- **anthropic** Python SDK as the default LLM provider, **openai** SDK
  as the swappable alternative.
- **PyJWT** for verifying Supabase Auth tokens.
- Exact pinned versions are listed in `requirements.txt` below  use
  those versions unless there's a specific compatibility reason not to.

---

## What "done" looks like

- `uvicorn app.main:app` boots with zero errors and exactly 6
  automations registered (verifiable via `GET /automations`).
- `POST /webhooks/supabase` with a simulated `deals` UPDATE payload
  (stage changed to `closed_won`) creates a row in `project_suggestions`
  and a row in `automation_runs`.
- The poller and scheduler jobs are visible in logs on startup with the
  correct intervals: stale_deal_followup hourly, budget_threshold_alert
  every 30 min, overdue_invoice_reminder every 6 hours,
  weekly_monday_briefing cron `0 8 * * 1`.
- The React app, once `automationApi.ts` is wired in, can list
  automations, show run history, manually trigger one, and
  approve/reject a drafted item  all without touching any existing
  Supabase-direct CRUD code already in the app.

---

## Full File Tree

```
cynda/
  README.md
  automation-service/.env.example
  automation-service/Procfile
  automation-service/app/__init__.py
  automation-service/app/automations/__init__.py
  automation-service/app/automations/base.py
  automation-service/app/automations/crm/__init__.py
  automation-service/app/automations/crm/stale_deal_followup.py
  automation-service/app/automations/cross/__init__.py
  automation-service/app/automations/cross/weekly_briefing.py
  automation-service/app/automations/engine.py
  automation-service/app/automations/finance/__init__.py
  automation-service/app/automations/finance/budget_threshold_alert.py
  automation-service/app/automations/finance/overdue_invoice_reminder.py
  automation-service/app/automations/hr/__init__.py
  automation-service/app/automations/hr/new_hire_checklist.py
  automation-service/app/automations/loader.py
  automation-service/app/automations/projects/__init__.py
  automation-service/app/automations/projects/won_deal_kickoff.py
  automation-service/app/automations/registry.py
  automation-service/app/core/__init__.py
  automation-service/app/core/auth.py
  automation-service/app/core/poller.py
  automation-service/app/core/scheduler.py
  automation-service/app/core/supabase_client.py
  automation-service/app/llm/__init__.py
  automation-service/app/llm/client.py
  automation-service/app/main.py
  automation-service/app/routes/__init__.py
  automation-service/app/routes/automations.py
  automation-service/app/routes/webhooks.py
  automation-service/requirements.txt
  docs/deployment.md
  docs/supabase_webhooks_setup.md
  frontend-integration/automationApi.ts
  supabase/migrations/0001_automation_tables.sql
  supabase/migrations/0002_optional_pg_net_trigger.sql
```

## Complete File Contents

Every file below should be created at the exact relative path shown in its heading, with the exact content given. Empty `__init__.py` files (Python package markers) are listed but have no content to show  create them as empty files.

### `README.md`

````markdown
# Cynda Automation Engine

Python automation backend for the Cynda platform. Your React app on
Vercel and your Supabase project stay exactly as they are  this adds
a small, separately-hosted Python service that powers the LLM-driven
and scheduled/polled automations from your platform spec:

| Automation | Department | Trigger | LLM |
|---|---|---|---|
| Stale deal follow-up | CRM | Poll (hourly) | Yes |
| Budget threshold alert | Finance | Poll (30 min) | No |
| Overdue invoice reminder | Finance | Poll (6 hr) | Yes |
| Won deal → project kickoff | Projects | Event (deal UPDATE) | Yes |
| New hire checklist | HR | Event (staff INSERT) | No |
| Weekly Monday briefing | Cross-department | Schedule (cron) | Yes |

## Why this shape

Three different "wake-up" mechanisms are needed because the automations
genuinely differ:
- **Event**  something changed right now (a deal closed, a hire was added) → Supabase Database Webhook fires instantly.
- **Poll**  a *passive* condition became true with no triggering write (a deal went quiet, an invoice aged past due) → checked on an interval.
- **Schedule**  a calendar moment, regardless of data state (Monday 8am) → cron.

Rather than three different codebases, every automation implements one
`BaseAutomation` contract (`should_trigger()` + `run()`), and the
engine is the only thing that knows how each trigger type calls it.
This is the part worth understanding if you're going to keep building
on this  see `automation-service/app/automations/base.py`.

## Repo layout

```
automation-service/        ← the Python backend (deploy separately, NOT on Vercel)
  app/
    automations/
      base.py              ← the contract every automation implements
      registry.py          ← auto-discovery, no manual master list to maintain
      engine.py            ← runs one automation + logs the result
      loader.py            ← imports every automation file (add new ones here)
      crm/ finance/ projects/ hr/ cross/   ← one file per automation
    core/
      supabase_client.py   ← service-role Supabase client
      auth.py               ← verifies the frontend's Supabase JWT
      poller.py             ← runs POLL automations on intervals
      scheduler.py          ← runs SCHEDULE automations on cron
    llm/
      client.py             ← provider-agnostic LLM adapter (Claude default, swappable)
    routes/
      webhooks.py           ← receives Supabase Database Webhooks
      automations.py        ← API the React app calls (list, run, approve/reject)
    main.py                 ← FastAPI entrypoint, wires it all together

supabase/migrations/        ← SQL for new tables + RLS policies + webhook trigger reference
frontend-integration/       ← drop-in TS client for your existing React app
docs/                       ← setup + deployment instructions
```

## Adding automation #7

This is the part that matters for owning the build long-term:

1. Create `app/automations/<department>/<your_automation>.py`
2. Subclass `BaseAutomation`, set `key`, `name`, `department`,
   `trigger_type` (+ the relevant `listens_to_table` /
   `poll_interval_seconds` / `cron_expression`)
3. Implement `should_trigger()` and `run()`
4. Add one import line to `app/automations/loader.py`
5. If it's an EVENT type, add the corresponding Supabase Database
   Webhook (see `docs/supabase_webhooks_setup.md`)

Nothing else changes  not the engine, not the API routes, not the
poller/scheduler registration. They all read from the registry
automatically.

## Setup order

1. Run `supabase/migrations/0001_automation_tables.sql` against your
   Supabase project (creates the new tables + RLS policies).
2. Deploy `automation-service/` (see `docs/deployment.md`  Railway
   recommended, ~10 min).
3. Configure the two Database Webhooks in Supabase (see
   `docs/supabase_webhooks_setup.md`).
4. Drop `frontend-integration/automationApi.ts` into your React app
   and wire up the Automations settings panel / activity feed.
5. Set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` (or swap to
   `openai`) in the service's env.

## On "every day is a holiday" / the 100% productivity claim

Worth saying directly: the LLM-powered automations *draft*, they don't
auto-send. Follow-ups, reminders, and kickoff suggestions land in a
`pending_review` queue (`deal_drafts`, `invoice_drafts`,
`project_suggestions`) for a human to approve. This is deliberate, not
a limitation to remove later  companies at the scale you mentioned
(Google, Microsoft, etc.) don't let an LLM autonomously email a client
or vendor without a human in the loop, because the cost of one bad
auto-send (wrong tone, wrong number, hallucinated detail) outweighs the
time saved on the ones that were fine. The "100% productivity" gain is
real, but it comes from eliminating the *drafting* and *noticing* work
 a person still clicks approve. If you later want true autopilot for
specific low-risk cases, that's a one-line change (skip the drafts
table, call a send function directly)  but I'd treat that as an
explicit, opt-in setting per automation, not a default.

````

### `automation-service/.env.example`

```bash
# Supabase  service-role key, NEVER the anon key, NEVER committed to git
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Shared secret configured on the Supabase Database Webhook itself,
# sent back as the X-Webhook-Secret header. Generate a long random value.
SUPABASE_WEBHOOK_SECRET=generate-a-long-random-string

# LLM provider  "anthropic" (default) or "openai"
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6

# Only needed if LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1

# Timezone for cron-based automations (weekly briefing, etc.)
SCHEDULER_TIMEZONE=UTC

```

### `automation-service/Procfile`

```text
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT

```

### `automation-service/app/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/base.py`

```python
"""
Base contract for all Cynda automations.

Every automation  CRM, Finance, Projects, HR, or cross-department 
implements this interface. The engine (engine.py) doesn't know or care
what an automation *does*; it only knows how to ask "should you run?"
and tell it "run." That seam is what lets the platform grow from 6
automations to 60 without ever touching orchestration code.

Data access: automations receive a Supabase client already authenticated
with the service-role key (full read/write, bypasses RLS  this service
is trusted backend code, never exposed to the browser).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from supabase import Client


class TriggerType(str, Enum):
    """How an automation gets woken up."""

    EVENT = "event"        # fired by a Supabase Database Webhook (row insert/update)
    POLL = "poll"            # checked on an interval (e.g. every 15 min)
    SCHEDULE = "schedule"    # fired on a cron expression (e.g. weekly Monday 8am)


class Department(str, Enum):
    CRM = "crm"
    FINANCE = "finance"
    PROJECTS = "projects"
    HR = "hr"
    CROSS = "cross_department"


@dataclass
class AutomationContext:
    """
    Everything an automation needs to evaluate and run.

    `payload` holds the webhook row data for EVENT-type automations;
    it's empty for POLL/SCHEDULE, which pull their own data via `db`.
    """

    org_id: str
    db: Client
    payload: dict[str, Any] = field(default_factory=dict)
    llm: Any = None
    now: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class AutomationResult:
    """Standardized output so the engine can log/audit/notify uniformly."""

    automation_key: str
    triggered: bool
    summary: str
    actions_taken: list[str] = field(default_factory=list)
    artifact: Optional[dict[str, Any]] = None  # e.g. drafted email text, suggested name
    error: Optional[str] = None


class BaseAutomation(ABC):
    """
    Subclass this for every new automation.

    Required class attrs:
      key            - unique snake_case id, e.g. "stale_deal_followup"
      name           - human label shown in the UI automations list
      department     - which department tab it lives under
      trigger_type   - EVENT, POLL, or SCHEDULE
      llm_powered    - whether run() calls an LLM (shown as a badge in UI)

    EVENT automations additionally set `listens_to_table` + optionally
    `listens_to_event` ("INSERT"/"UPDATE"/"DELETE").
    POLL automations set `poll_interval_seconds`.
    SCHEDULE automations set `cron_expression`.
    """

    key: str
    name: str
    department: Department
    trigger_type: TriggerType
    llm_powered: bool = False

    listens_to_table: Optional[str] = None
    listens_to_event: Optional[str] = None
    poll_interval_seconds: Optional[int] = None
    cron_expression: Optional[str] = None

    @abstractmethod
    async def should_trigger(self, ctx: AutomationContext) -> bool:
        """Cheap check, no side effects. Decides whether run() is worth calling."""
        raise NotImplementedError

    @abstractmethod
    async def run(self, ctx: AutomationContext) -> AutomationResult:
        """Does the actual work. Only called if should_trigger() returned True."""
        raise NotImplementedError

    def describe(self) -> dict[str, Any]:
        """Metadata surfaced to the frontend's Automations settings panel."""
        return {
            "key": self.key,
            "name": self.name,
            "department": self.department.value,
            "trigger_type": self.trigger_type.value,
            "llm_powered": self.llm_powered,
        }

```

### `automation-service/app/automations/crm/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/crm/stale_deal_followup.py`

```python
"""
Stale deal follow-up (CRM)

Cyndi drafts a follow-up nudge if a deal has had no activity for a set
number of days.

Trigger model: this one is technically a POLL, not a pure EVENT, even
though "no activity for N days" sounds passive. There's no row update
that fires when time silently passes  so we check deals on an interval
rather than waiting for a webhook that will never come for a stalled deal.

Assumes a `deals` table with columns roughly:
  id, org_id, name, stage, contact_name, contact_email,
  last_activity_at, owner_id, stale_threshold_days (org-configurable)
"""

from __future__ import annotations

from datetime import timedelta

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation

DEFAULT_STALE_DAYS = 7


@register_automation
class StaleDealFollowUp(BaseAutomation):
    key = "stale_deal_followup"
    name = "Stale deal follow-up"
    department = Department.CRM
    trigger_type = TriggerType.POLL
    llm_powered = True
    poll_interval_seconds = 60 * 60  # hourly is enough; deals don't go stale by the minute

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Cheap existence check only; the real per-deal filtering happens
        # in run() since "stale" is computed per-row, not globally.
        resp = (
            ctx.db.table("deals")
            .select("id", count="exact")
            .eq("org_id", ctx.org_id)
            .neq("stage", "closed_won")
            .neq("stage", "closed_lost")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        cutoff = (ctx.now - timedelta(days=DEFAULT_STALE_DAYS)).isoformat()

        stale_deals = (
            ctx.db.table("deals")
            .select("id, name, contact_name, contact_email, last_activity_at, owner_id")
            .eq("org_id", ctx.org_id)
            .neq("stage", "closed_won")
            .neq("stage", "closed_lost")
            .lt("last_activity_at", cutoff)
            .is_("follow_up_drafted", "null")  # avoid re-drafting every poll
            .execute()
        )

        if not stale_deals.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No stale deals found this cycle.",
            )

        drafted: list[str] = []
        for deal in stale_deals.data:
            draft = await self._draft_followup(ctx, deal)

            ctx.db.table("deal_drafts").insert(
                {
                    "org_id": ctx.org_id,
                    "deal_id": deal["id"],
                    "kind": "follow_up_email",
                    "draft_text": draft,
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("deals").update({"follow_up_drafted": ctx.now.isoformat()}).eq(
                "id", deal["id"]
            ).execute()

            drafted.append(deal["name"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Drafted {len(drafted)} follow-up nudge(s) for stale deals.",
            actions_taken=[f"Draft created for deal: {name}" for name in drafted],
            artifact={"deal_names": drafted},
        )

    async def _draft_followup(self, ctx: AutomationContext, deal: dict) -> str:
        system = (
            "You are Cyndi, an assistant inside the Cynda CRM. Draft a short, "
            "warm, low-pressure follow-up email nudging a contact whose deal "
            "has gone quiet. No more than 120 words. End with a clear, easy "
            "next step. Do not invent details not given to you."
        )
        prompt = (
            f"Deal: {deal['name']}\n"
            f"Contact: {deal.get('contact_name', 'there')}\n"
            f"Days since last activity: {DEFAULT_STALE_DAYS}+\n\n"
            "Draft the follow-up email."
        )
        response = await ctx.llm.complete(system=system, prompt=prompt, max_tokens=300)
        return response.text

```

### `automation-service/app/automations/cross/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/cross/weekly_briefing.py`

```python
"""
Weekly Monday briefing (Cross-department)

Cyndi summarizes tasks, pipeline, and invoices for leadership every
Monday morning. This is the showcase automation  it's the one that
should make a leadership team feel like the platform thinks ahead of
them, which is exactly the "every day is a holiday" promise: the
human doesn't have to go assemble this themselves.

Trigger: SCHEDULE, cron "0 8 * * 1" (Monday 08:00  runs in the
scheduler's configured timezone; see core/scheduler.py).
"""

from __future__ import annotations

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation


@register_automation
class WeeklyMondayBriefing(BaseAutomation):
    key = "weekly_monday_briefing"
    name = "Weekly Monday briefing"
    department = Department.CROSS
    trigger_type = TriggerType.SCHEDULE
    llm_powered = True
    cron_expression = "0 8 * * 1"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Scheduler only calls run() when the cron fires, so this is
        # effectively always true. Kept as a hook in case you later want
        # to skip orgs with zero activity, paused plans, etc.
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        tasks_due = (
            ctx.db.table("tasks")
            .select("id, title, status, due_date", count="exact")
            .eq("org_id", ctx.org_id)
            .neq("status", "done")
            .execute()
        )
        open_deals = (
            ctx.db.table("deals")
            .select("id, name, stage, value")
            .eq("org_id", ctx.org_id)
            .neq("stage", "closed_won")
            .neq("stage", "closed_lost")
            .execute()
        )
        overdue_invoices = (
            ctx.db.table("invoices")
            .select("id, client_name, amount, currency, due_date")
            .eq("org_id", ctx.org_id)
            .lt("due_date", ctx.now.isoformat())
            .neq("status", "paid")
            .execute()
        )

        briefing_text = await self._compose_briefing(
            ctx,
            tasks_due=tasks_due.data or [],
            open_deals=open_deals.data or [],
            overdue_invoices=overdue_invoices.data or [],
        )

        ctx.db.table("briefings").insert(
            {
                "org_id": ctx.org_id,
                "kind": "weekly_monday",
                "content": briefing_text,
                "week_of": ctx.now.date().isoformat(),
            }
        ).execute()

        leadership = (
            ctx.db.table("staff")
            .select("id")
            .eq("org_id", ctx.org_id)
            .eq("is_leadership", True)
            .execute()
        )
        if leadership.data:
            ctx.db.table("notifications").insert(
                [
                    {
                        "org_id": ctx.org_id,
                        "user_id": person["id"],
                        "kind": f"weekly_briefing:{ctx.now.date().isoformat()}",
                        "title": "Your Monday briefing is ready",
                        "body": briefing_text[:200],
                        "read": False,
                    }
                    for person in leadership.data
                ]
            ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary="Weekly briefing generated and sent to leadership.",
            actions_taken=[f"Notified {len(leadership.data or [])} leadership member(s)"],
            artifact={"briefing": briefing_text},
        )

    async def _compose_briefing(
        self,
        ctx: AutomationContext,
        tasks_due: list[dict],
        open_deals: list[dict],
        overdue_invoices: list[dict],
    ) -> str:
        pipeline_value = sum(d.get("value") or 0 for d in open_deals)
        overdue_total = sum(i.get("amount") or 0 for i in overdue_invoices)

        system = (
            "You are Cyndi, the assistant for the Cynda platform. Write a "
            "concise Monday leadership briefing in plain prose (not bullet "
            "lists unless natural), under 200 words. Cover: open tasks, "
            "sales pipeline, and overdue invoices. Tone: confident, brief, "
            "useful  like a sharp chief of staff, not a chatbot. Use only "
            "the numbers given; do not invent figures."
        )
        prompt = (
            f"Open tasks: {len(tasks_due)}\n"
            f"Open deals: {len(open_deals)}, total pipeline value: {pipeline_value}\n"
            f"Overdue invoices: {len(overdue_invoices)}, total overdue: {overdue_total}\n"
        )
        response = await ctx.llm.complete(system=system, prompt=prompt, max_tokens=400)
        return response.text

```

### `automation-service/app/automations/engine.py`

```python
"""
Engine: executes one automation instance and records what happened.

Every trigger pathway (webhook route, poller, scheduler) funnels through
`run_automation()`. This is the only place that:
  1. Calls should_trigger() then run()
  2. Catches and logs errors so one broken automation can't crash a request
  3. Writes a row to automation_runs for the Activity / Audit UI
  4. Returns a uniform result the caller can act on (e.g. send a notification)

Keeping this single chokepoint is what makes the system observable 
every automation, regardless of department, shows up in one timeline.
"""

from __future__ import annotations

import logging
import time

from supabase import Client

from app.automations.base import AutomationContext, AutomationResult, BaseAutomation

logger = logging.getLogger("cynda.engine")


async def run_automation(
    automation_cls: type[BaseAutomation],
    ctx: AutomationContext,
) -> AutomationResult:
    """
    Instantiate, check should_trigger, run if true, log the outcome.
    Never raises  failures are captured into AutomationResult.error so
    a bad automation degrades gracefully instead of taking the request down.
    """
    automation = automation_cls()
    started = time.monotonic()

    try:
        should_run = await automation.should_trigger(ctx)
    except Exception as exc:  # noqa: BLE001 - intentionally broad, see docstring
        logger.exception("should_trigger failed for %s", automation.key)
        result = AutomationResult(
            automation_key=automation.key,
            triggered=False,
            summary="should_trigger raised an exception",
            error=str(exc),
        )
        _persist_run(ctx.db, ctx.org_id, result, duration_ms=_elapsed(started))
        return result

    if not should_run:
        result = AutomationResult(
            automation_key=automation.key,
            triggered=False,
            summary="Conditions not met; skipped.",
        )
        # Skips are cheap and frequent (esp. for POLL automations)  don't
        # spam the audit table with them, just log at debug level.
        logger.debug("Skipped %s for org %s", automation.key, ctx.org_id)
        return result

    try:
        result = await automation.run(ctx)
    except Exception as exc:  # noqa: BLE001
        logger.exception("run() failed for %s", automation.key)
        result = AutomationResult(
            automation_key=automation.key,
            triggered=True,
            summary="run() raised an exception",
            error=str(exc),
        )

    _persist_run(ctx.db, ctx.org_id, result, duration_ms=_elapsed(started))
    return result


def _elapsed(started: float) -> int:
    return int((time.monotonic() - started) * 1000)


def _persist_run(
    db: Client,
    org_id: str,
    result: AutomationResult,
    duration_ms: int,
) -> None:
    """
    Write to automation_runs so the frontend can render an activity feed
    ("Cyndi drafted 3 follow-ups today") and so failures are debuggable
    without grepping logs.
    """
    try:
        db.table("automation_runs").insert(
            {
                "org_id": org_id,
                "automation_key": result.automation_key,
                "triggered": result.triggered,
                "summary": result.summary,
                "actions_taken": result.actions_taken,
                "artifact": result.artifact,
                "error": result.error,
                "duration_ms": duration_ms,
            }
        ).execute()
    except Exception:  # noqa: BLE001
        # Audit logging must never break the automation itself.
        logger.exception("Failed to persist automation_runs row for %s", result.automation_key)

```

### `automation-service/app/automations/finance/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/finance/budget_threshold_alert.py`

```python
"""
Budget threshold alert (Finance)

Notifies finance owners if spending approaches or exceeds a configured
budget. No LLM needed here  this is a deterministic numeric check,
and a hallucinated number in a finance alert is a real liability, not
a cute risk. Keep this one boring and exact on purpose.

Assumes tables:
  budgets(id, org_id, category, period_start, period_end, limit_amount, currency)
  expenses(id, org_id, category, amount, currency, created_at)
  notifications(id, org_id, user_id, kind, title, body, read)
"""

from __future__ import annotations

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation

WARNING_THRESHOLD_PCT = 80  # notify at 80% of budget
OVER_THRESHOLD_PCT = 100


@register_automation
class BudgetThresholdAlert(BaseAutomation):
    key = "budget_threshold_alert"
    name = "Budget threshold alert"
    department = Department.FINANCE
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 30 * 60  # every 30 min

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        resp = (
            ctx.db.table("budgets")
            .select("id", count="exact")
            .eq("org_id", ctx.org_id)
            .lte("period_start", ctx.now.isoformat())
            .gte("period_end", ctx.now.isoformat())
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        budgets = (
            ctx.db.table("budgets")
            .select("id, category, limit_amount, currency, owner_id")
            .eq("org_id", ctx.org_id)
            .lte("period_start", ctx.now.isoformat())
            .gte("period_end", ctx.now.isoformat())
            .execute()
        )

        alerts_sent: list[str] = []

        for budget in budgets.data or []:
            spend_resp = (
                ctx.db.table("expenses")
                .select("amount")
                .eq("org_id", ctx.org_id)
                .eq("category", budget["category"])
                .execute()
            )
            total_spent = sum(row["amount"] for row in (spend_resp.data or []))
            limit_amount = budget["limit_amount"]
            pct = (total_spent / limit_amount * 100) if limit_amount else 0

            if pct < WARNING_THRESHOLD_PCT:
                continue

            severity = "over_budget" if pct >= OVER_THRESHOLD_PCT else "approaching_budget"
            title = (
                f"{budget['category']} budget exceeded"
                if severity == "over_budget"
                else f"{budget['category']} budget at {pct:.0f}%"
            )
            body = (
                f"Spent {total_spent:.2f} {budget['currency']} of "
                f"{limit_amount:.2f} {budget['currency']} budget "
                f"({pct:.0f}%)."
            )

            # Idempotency: don't re-alert every poll cycle for the same
            # budget/severity pair within the same period.
            existing = (
                ctx.db.table("notifications")
                .select("id")
                .eq("org_id", ctx.org_id)
                .eq("kind", f"budget_alert:{budget['id']}:{severity}")
                .limit(1)
                .execute()
            )
            if existing.data:
                continue

            ctx.db.table("notifications").insert(
                {
                    "org_id": ctx.org_id,
                    "user_id": budget.get("owner_id"),
                    "kind": f"budget_alert:{budget['id']}:{severity}",
                    "title": title,
                    "body": body,
                    "read": False,
                }
            ).execute()
            alerts_sent.append(title)

        if not alerts_sent:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No budgets crossed their alert threshold.",
            )

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {len(alerts_sent)} budget alert(s).",
            actions_taken=alerts_sent,
        )

```

### `automation-service/app/automations/finance/overdue_invoice_reminder.py`

```python
"""
Overdue invoice reminder (Finance)

Drafts a polite payment reminder for clients when an invoice passes its
due date.

Assumes `invoices` table:
  id, org_id, client_name, client_email, amount, currency,
  due_date, status ('draft'|'sent'|'paid'|'overdue'), reminder_drafted_at
"""

from __future__ import annotations

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation


@register_automation
class OverdueInvoiceReminder(BaseAutomation):
    key = "overdue_invoice_reminder"
    name = "Overdue invoice reminder"
    department = Department.FINANCE
    trigger_type = TriggerType.POLL
    llm_powered = True
    poll_interval_seconds = 60 * 60 * 6  # every 6 hours; invoices don't need minute-level checks

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        resp = (
            ctx.db.table("invoices")
            .select("id", count="exact")
            .eq("org_id", ctx.org_id)
            .lt("due_date", ctx.now.isoformat())
            .neq("status", "paid")
            .is_("reminder_drafted_at", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        overdue = (
            ctx.db.table("invoices")
            .select("id, client_name, client_email, amount, currency, due_date")
            .eq("org_id", ctx.org_id)
            .lt("due_date", ctx.now.isoformat())
            .neq("status", "paid")
            .is_("reminder_drafted_at", "null")
            .execute()
        )

        if not overdue.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No newly overdue invoices.",
            )

        drafted: list[str] = []
        for invoice in overdue.data:
            draft = await self._draft_reminder(ctx, invoice)

            ctx.db.table("invoice_drafts").insert(
                {
                    "org_id": ctx.org_id,
                    "invoice_id": invoice["id"],
                    "kind": "payment_reminder",
                    "draft_text": draft,
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("invoices").update(
                {"reminder_drafted_at": ctx.now.isoformat(), "status": "overdue"}
            ).eq("id", invoice["id"]).execute()

            drafted.append(invoice["client_name"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Drafted {len(drafted)} overdue payment reminder(s).",
            actions_taken=[f"Reminder drafted for: {name}" for name in drafted],
            artifact={"client_names": drafted},
        )

    async def _draft_reminder(self, ctx: AutomationContext, invoice: dict) -> str:
        system = (
            "You are Cyndi, an assistant inside the Cynda Finance module. "
            "Draft a polite, professional payment reminder for an overdue "
            "invoice. Firm but courteous, under 100 words. Include the "
            "amount and due date as given. Do not invent late fees or "
            "policies not provided to you."
        )
        prompt = (
            f"Client: {invoice['client_name']}\n"
            f"Amount due: {invoice['amount']} {invoice['currency']}\n"
            f"Original due date: {invoice['due_date']}\n\n"
            "Draft the reminder."
        )
        response = await ctx.llm.complete(system=system, prompt=prompt, max_tokens=250)
        return response.text

```

### `automation-service/app/automations/hr/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/hr/new_hire_checklist.py`

```python
"""
New hire checklist (HR)

Sends onboarding tasks to HR and the hiring manager when a new staff
record is added. No LLM needed  this is a fixed checklist creation,
deterministic by design so onboarding is consistent for every hire.

Trigger: Supabase Database Webhook on INSERT to `staff`.
"""

from __future__ import annotations

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation

DEFAULT_ONBOARDING_TASKS = [
    "Send welcome email and first-day logistics",
    "Set up workstation / equipment request",
    "Create accounts (email, Slack/Chat, core tools)",
    "Schedule 1:1 with hiring manager (week 1)",
    "Assign onboarding buddy",
    "Add to payroll and benefits enrollment",
    "Share employee handbook and policies",
    "Schedule 30-day check-in",
]


@register_automation
class NewHireChecklist(BaseAutomation):
    key = "new_hire_checklist"
    name = "New hire checklist"
    department = Department.HR
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "staff"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        record = ctx.payload.get("record", {})
        return bool(record.get("id"))

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        staff = ctx.payload.get("record", {})
        staff_id = staff.get("id")
        hiring_manager_id = staff.get("hiring_manager_id")

        task_rows = [
            {
                "org_id": ctx.org_id,
                "title": task,
                "related_staff_id": staff_id,
                "assignee_id": hiring_manager_id,
                "category": "onboarding",
                "status": "todo",
            }
            for task in DEFAULT_ONBOARDING_TASKS
        ]
        ctx.db.table("tasks").insert(task_rows).execute()

        ctx.db.table("notifications").insert(
            [
                {
                    "org_id": ctx.org_id,
                    "user_id": hiring_manager_id,
                    "kind": f"new_hire_checklist:{staff_id}",
                    "title": f"Onboarding checklist created for {staff.get('full_name', 'new hire')}",
                    "body": f"{len(DEFAULT_ONBOARDING_TASKS)} onboarding tasks were added to your list.",
                    "read": False,
                }
            ]
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Created {len(DEFAULT_ONBOARDING_TASKS)} onboarding tasks for new hire.",
            actions_taken=[f"Task created: {t}" for t in DEFAULT_ONBOARDING_TASKS],
        )

```

### `automation-service/app/automations/loader.py`

```python
"""
Loader: importing this module has the side effect of populating the
registry, because every automation file's @register_automation
decorator runs on import.

Call load_all() once at app startup (see main.py) before anything
calls registry.all_automations() or registry.automations_for_table().

To add a new automation: write the file, then add one import line here.
Nothing else needs to change.
"""

from __future__ import annotations


def load_all() -> None:
    # CRM
    from app.automations.crm import stale_deal_followup  # noqa: F401

    # Finance
    from app.automations.finance import (  # noqa: F401
        budget_threshold_alert,
        overdue_invoice_reminder,
    )

    # Projects
    from app.automations.projects import won_deal_kickoff  # noqa: F401

    # HR
    from app.automations.hr import new_hire_checklist  # noqa: F401

    # Cross-department
    from app.automations.cross import weekly_briefing  # noqa: F401

```

### `automation-service/app/automations/projects/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/automations/projects/won_deal_kickoff.py`

```python
"""
Won deal -> project kickoff (Projects)

Suggests a project name and kickoff summary when a deal moves to
Closed Won. This is a genuine EVENT automation: it reacts to a specific
UPDATE on the `deals` table (stage changed to 'closed_won'), delivered
via a Supabase Database Webhook -> POST /webhooks/supabase.

See supabase/migrations for the trigger that fires this webhook.
"""

from __future__ import annotations

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation


@register_automation
class WonDealProjectKickoff(BaseAutomation):
    key = "won_deal_project_kickoff"
    name = "Won deal → project kickoff"
    department = Department.PROJECTS
    trigger_type = TriggerType.EVENT
    llm_powered = True
    listens_to_table = "deals"
    listens_to_event = "UPDATE"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        record = ctx.payload.get("record", {})
        old_record = ctx.payload.get("old_record", {})
        # Only fire on the transition INTO closed_won, not every update
        # while a deal is already won (which would re-draft endlessly).
        return (
            record.get("stage") == "closed_won"
            and old_record.get("stage") != "closed_won"
        )

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        deal = ctx.payload.get("record", {})

        suggestion = await self._suggest_kickoff(ctx, deal)

        ctx.db.table("project_suggestions").insert(
            {
                "org_id": ctx.org_id,
                "source_deal_id": deal.get("id"),
                "suggested_name": suggestion["name"],
                "kickoff_summary": suggestion["summary"],
                "status": "pending_review",
            }
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Suggested project kickoff for won deal: {deal.get('name')}",
            actions_taken=[f"Project suggestion created: {suggestion['name']}"],
            artifact=suggestion,
        )

    async def _suggest_kickoff(self, ctx: AutomationContext, deal: dict) -> dict:
        system = (
            "You are Cyndi, an assistant inside the Cynda Projects module. "
            "A CRM deal was just marked Closed Won. Suggest a short, clear "
            "project name (5 words max) and a 2-3 sentence kickoff summary "
            "for the team. Respond ONLY as JSON: "
            '{"name": "...", "summary": "..."}. No markdown, no preamble.'
        )
        prompt = (
            f"Deal name: {deal.get('name')}\n"
            f"Client: {deal.get('contact_name', 'Unknown')}\n"
            f"Value: {deal.get('value', 'N/A')}\n"
        )
        response = await ctx.llm.complete(system=system, prompt=prompt, max_tokens=300)

        import json

        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            # Defensive fallback so a malformed LLM response never breaks
            # the automation chain  degrade to a usable default instead.
            return {
                "name": f"{deal.get('name', 'New Deal')} Kickoff",
                "summary": "Auto-generated suggestion unavailable; please name this project manually.",
            }

```

### `automation-service/app/automations/registry.py`

```python
"""
Registry: the single source of truth for "what automations exist."

New automations register themselves with @register_automation and the
engine, the API, and the frontend's settings list all read from this
one place. You never edit a master list by hand when adding #21.
"""

from __future__ import annotations

from app.automations.base import BaseAutomation, TriggerType

_REGISTRY: dict[str, type[BaseAutomation]] = {}


def register_automation(cls: type[BaseAutomation]) -> type[BaseAutomation]:
    """Class decorator. Put @register_automation above every automation class."""
    if cls.key in _REGISTRY:
        raise ValueError(f"Duplicate automation key: {cls.key!r}")
    _REGISTRY[cls.key] = cls
    return cls


def all_automations() -> list[type[BaseAutomation]]:
    return list(_REGISTRY.values())


def get_automation(key: str) -> type[BaseAutomation]:
    if key not in _REGISTRY:
        raise KeyError(f"No automation registered with key {key!r}")
    return _REGISTRY[key]


def automations_by_trigger(trigger_type: TriggerType) -> list[type[BaseAutomation]]:
    return [cls for cls in _REGISTRY.values() if cls.trigger_type == trigger_type]


def automations_for_table(table_name: str) -> list[type[BaseAutomation]]:
    """Used by the webhook route to find which automations care about a table."""
    return [
        cls
        for cls in _REGISTRY.values()
        if cls.trigger_type == TriggerType.EVENT and cls.listens_to_table == table_name
    ]

```

### `automation-service/app/core/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/core/auth.py`

```python
"""
Verifies the Supabase Auth JWT sent by the React frontend on every
request to this service, and extracts org_id from it.

This assumes your `staff`/`profiles` table (or wherever org membership
lives) is queryable by the Supabase auth user id, OR that org_id is
already embedded as a custom claim on the JWT (set via a Supabase Auth
Hook). Adjust `_resolve_org_id` to match however your existing app
already does this  it almost certainly already has this logic
somewhere in the Supabase-backed frontend.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import jwt
from fastapi import Header, HTTPException

from app.core.supabase_client import get_db

SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]


@dataclass
class AuthedUser:
    user_id: str
    org_id: str
    email: str | None = None


async def require_auth(authorization: str | None = Header(default=None)) -> AuthedUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(401, f"Invalid token: {exc}")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Token missing subject")

    org_id = payload.get("org_id")  # if set via custom claim/Auth Hook
    if not org_id:
        org_id = await _resolve_org_id(user_id)

    if not org_id:
        raise HTTPException(403, "User has no associated organization")

    return AuthedUser(user_id=user_id, org_id=org_id, email=payload.get("email"))


async def _resolve_org_id(user_id: str) -> str | None:
    """
    Fallback lookup if org_id isn't already on the JWT as a custom
    claim. Adjust table/column names to match your existing schema 
    this is the one place that almost certainly needs a one-line edit
    to match what you already built.
    """
    db = get_db()
    resp = (
        db.table("staff")
        .select("org_id")
        .eq("auth_user_id", user_id)
        .limit(1)
        .execute()
    )
    if resp.data:
        return resp.data[0]["org_id"]
    return None

```

### `automation-service/app/core/poller.py`

```python
"""
Poller: runs every POLL-type automation, for every active org, on its
own interval. This is the mechanism behind "stale deal follow-up",
"budget threshold alert", and "overdue invoice reminder"  none of
these have a natural webhook moment, so they're checked periodically
instead.

Implementation note: APScheduler runs one job per (automation, and we
fan out to orgs inside that job) rather than one job per org, because
org count will grow and we don't want N*M scheduler jobs registered.
"""

from __future__ import annotations

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.automations.base import AutomationContext, TriggerType
from app.automations.engine import run_automation
from app.automations.registry import automations_by_trigger
from app.core.supabase_client import get_db
from app.llm.client import get_llm_client

logger = logging.getLogger("cynda.poller")


async def _get_active_org_ids(db) -> list[str]:
    """
    Every poll cycle needs to know which orgs to check. Pulled from an
    `organizations` table; swap the filter if you add a plan/status
    column later (e.g. only poll orgs on active subscriptions).
    """
    resp = db.table("organizations").select("id").execute()
    return [row["id"] for row in (resp.data or [])]


async def _run_poll_automation(automation_cls) -> None:
    db = get_db()
    llm = get_llm_client()
    org_ids = await _get_active_org_ids(db)

    for org_id in org_ids:
        ctx = AutomationContext(org_id=org_id, db=db, llm=llm)
        try:
            await run_automation(automation_cls, ctx)
        except Exception:  # noqa: BLE001
            # One org's failure should never block the rest of the fan-out.
            logger.exception(
                "Poll automation %s failed for org %s", automation_cls.key, org_id
            )


def register_poll_jobs(scheduler: AsyncIOScheduler) -> None:
    poll_automations = automations_by_trigger(TriggerType.POLL)

    for automation_cls in poll_automations:
        if not automation_cls.poll_interval_seconds:
            logger.warning(
                "Automation %s is POLL type but has no poll_interval_seconds set; skipping",
                automation_cls.key,
            )
            continue

        scheduler.add_job(
            _run_poll_automation,
            "interval",
            seconds=automation_cls.poll_interval_seconds,
            args=[automation_cls],
            id=f"poll:{automation_cls.key}",
            replace_existing=True,
            max_instances=1,  # don't let a slow cycle overlap the next one
        )
        logger.info(
            "Registered poll job for %s every %ss",
            automation_cls.key,
            automation_cls.poll_interval_seconds,
        )

```

### `automation-service/app/core/scheduler.py`

```python
"""
Scheduler: runs SCHEDULE-type automations (cron expressions) for every
org, e.g. the weekly Monday briefing.

Separate from poller.py deliberately  polling is "check if condition
X is true periodically" while scheduling is "do this at this exact
calendar moment regardless of state." Conflating them made the early
draft of this engine harder to reason about, so they stay split.
"""

from __future__ import annotations

import logging
import os

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.automations.base import AutomationContext, TriggerType
from app.automations.engine import run_automation
from app.automations.registry import automations_by_trigger
from app.core.poller import _get_active_org_ids
from app.core.supabase_client import get_db
from app.llm.client import get_llm_client

logger = logging.getLogger("cynda.scheduler")

# All cron expressions are interpreted in this timezone. Set to your
# primary customer base's timezone, or make this per-org later if you
# expand globally (Google/Microsoft-scale would eventually want
# per-org timezone-aware briefings).
SCHEDULER_TIMEZONE = os.environ.get("SCHEDULER_TIMEZONE", "UTC")


async def _run_scheduled_automation(automation_cls) -> None:
    db = get_db()
    llm = get_llm_client()
    org_ids = await _get_active_org_ids(db)

    for org_id in org_ids:
        ctx = AutomationContext(org_id=org_id, db=db, llm=llm)
        try:
            await run_automation(automation_cls, ctx)
        except Exception:  # noqa: BLE001
            logger.exception(
                "Scheduled automation %s failed for org %s", automation_cls.key, org_id
            )


def register_scheduled_jobs(scheduler: AsyncIOScheduler) -> None:
    scheduled_automations = automations_by_trigger(TriggerType.SCHEDULE)

    for automation_cls in scheduled_automations:
        if not automation_cls.cron_expression:
            logger.warning(
                "Automation %s is SCHEDULE type but has no cron_expression set; skipping",
                automation_cls.key,
            )
            continue

        scheduler.add_job(
            _run_scheduled_automation,
            CronTrigger.from_crontab(
                automation_cls.cron_expression, timezone=SCHEDULER_TIMEZONE
            ),
            args=[automation_cls],
            id=f"schedule:{automation_cls.key}",
            replace_existing=True,
            max_instances=1,
        )
        logger.info(
            "Registered scheduled job for %s (%s, tz=%s)",
            automation_cls.key,
            automation_cls.cron_expression,
            SCHEDULER_TIMEZONE,
        )

```

### `automation-service/app/core/supabase_client.py`

```python
"""
Supabase client for the automation service.

CRITICAL: this uses the service-role key, which bypasses Row Level
Security entirely. That's intentional and necessary  automations need
to read/write across the whole org (e.g. the weekly briefing touches
CRM, Finance, and Projects tables for every user). But it means:

  1. This key must NEVER be sent to the frontend or committed to git.
  2. Every query MUST explicitly filter by org_id  there's no RLS
     safety net here, the automation code IS the safety net.

Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in this service's env
(not the same as the anon key your React app uses).
"""

from __future__ import annotations

import os

from supabase import Client, create_client

_client_singleton: Client | None = None


def get_db() -> Client:
    global _client_singleton
    if _client_singleton is not None:
        return _client_singleton

    url = os.environ["SUPABASE_URL"]
    service_role_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    _client_singleton = create_client(url, service_role_key)
    return _client_singleton

```

### `automation-service/app/llm/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/llm/client.py`

```python
"""
Provider-agnostic LLM interface.

You said you want to own this and be able to swap providers freely 
so automations never import `anthropic` or `openai` directly. They
call `llm.complete(...)` against this interface, and the actual
provider is chosen once, in get_llm_client(), based on env config.

To add a new provider: implement LLMClient, add one branch in
get_llm_client(). No automation code ever changes.
"""

from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LLMResponse:
    text: str
    model: str
    provider: str


class LLMClient(ABC):
    @abstractmethod
    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        raise NotImplementedError


class AnthropicClient(LLMClient):
    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6"):
        from anthropic import AsyncAnthropic

        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model

    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        resp = await self._client.messages.create(
            model=self._model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in resp.content if block.type == "text")
        return LLMResponse(text=text, model=self._model, provider="anthropic")


class OpenAIClient(LLMClient):
    """Drop-in alternative if you ever want to switch or A/B providers."""

    def __init__(self, api_key: str, model: str = "gpt-4.1"):
        from openai import AsyncOpenAI

        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def complete(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.4,
    ) -> LLMResponse:
        resp = await self._client.chat.completions.create(
            model=self._model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        return LLMResponse(
            text=resp.choices[0].message.content or "",
            model=self._model,
            provider="openai",
        )


_client_singleton: LLMClient | None = None


def get_llm_client() -> LLMClient:
    """
    Reads LLM_PROVIDER env var ("anthropic" | "openai"), defaults to
    anthropic. Cached as a singleton so we don't re-init the SDK client
    on every automation run.
    """
    global _client_singleton
    if _client_singleton is not None:
        return _client_singleton

    provider = os.environ.get("LLM_PROVIDER", "anthropic").lower()

    if provider == "anthropic":
        api_key = os.environ["ANTHROPIC_API_KEY"]
        model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")
        _client_singleton = AnthropicClient(api_key=api_key, model=model)
    elif provider == "openai":
        api_key = os.environ["OPENAI_API_KEY"]
        model = os.environ.get("OPENAI_MODEL", "gpt-4.1")
        _client_singleton = OpenAIClient(api_key=api_key, model=model)
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider!r}")

    return _client_singleton

```

### `automation-service/app/main.py`

```python
"""
Cynda Automation Service  entrypoint.

Responsibilities on startup:
  1. Import every automation module so the registry is populated.
  2. Start the APScheduler instance with poll jobs + cron jobs registered.
  3. Mount the webhook + management API routes.

Run locally with:  uvicorn app.main:app --reload --port 8000
Deploy with:        any host that runs a long-lived process (Railway,
                     Render, Fly.io, a small VM). NOT Vercel  this
                     service needs a persistent process for the
                     in-memory scheduler to keep ticking, which
                     serverless functions can't guarantee.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.automations.loader import load_all
from app.core.poller import register_poll_jobs
from app.core.scheduler import register_scheduled_jobs
from app.routes import automations, webhooks

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cynda.main")

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all()
    logger.info("Automations loaded.")

    register_poll_jobs(scheduler)
    register_scheduled_jobs(scheduler)
    scheduler.start()
    logger.info("Scheduler started.")

    yield

    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped.")


app = FastAPI(title="Cynda Automation Service", lifespan=lifespan)

# Restrict to your actual Vercel domain(s) in production  this is
# permissive for local dev only.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)
app.include_router(automations.router)


@app.get("/health")
async def health():
    return {"status": "ok"}

```

### `automation-service/app/routes/__init__.py`

_Empty file (Python package marker). Create with no content._

### `automation-service/app/routes/automations.py`

```python
"""
Management API consumed by the React frontend:
  - List all automations + metadata (for the settings/automations panel)
  - View recent run history (for the activity feed)
  - Manually trigger an automation on demand (e.g. "Run now" button)
  - Approve/reject LLM-drafted content (follow-ups, reminders, kickoffs)

Auth: this service trusts a Supabase JWT passed from the frontend (the
same one the user already has from Supabase Auth). We verify it and
extract org_id rather than accepting org_id as a client-supplied param
 never trust the browser to tell you which org it belongs to.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.automations.base import AutomationContext
from app.automations.engine import run_automation
from app.automations.registry import all_automations, get_automation
from app.core.auth import AuthedUser, require_auth
from app.core.supabase_client import get_db
from app.llm.client import get_llm_client

router = APIRouter(prefix="/automations", tags=["automations"])


@router.get("")
async def list_automations(user: AuthedUser = Depends(require_auth)):
    return [cls().describe() for cls in all_automations()]


@router.get("/runs")
async def list_runs(
    limit: int = 50,
    automation_key: Optional[str] = None,
    user: AuthedUser = Depends(require_auth),
):
    db = get_db()
    query = (
        db.table("automation_runs")
        .select("*")
        .eq("org_id", user.org_id)
        .order("created_at", desc=True)
        .limit(min(limit, 200))
    )
    if automation_key:
        query = query.eq("automation_key", automation_key)
    resp = query.execute()
    return resp.data


@router.post("/{key}/run")
async def trigger_automation_now(key: str, user: AuthedUser = Depends(require_auth)):
    """
    Manual "Run now"  bypasses should_trigger's normal timing logic? No:
    it still calls should_trigger, because a manual run shouldn't draft
    duplicate follow-ups for deals that aren't actually stale. It just
    skips waiting for the next poll/cron tick.
    """
    try:
        automation_cls = get_automation(key)
    except KeyError:
        raise HTTPException(404, f"Unknown automation: {key}")

    db = get_db()
    llm = get_llm_client()
    ctx = AutomationContext(org_id=user.org_id, db=db, llm=llm)
    result = await run_automation(automation_cls, ctx)

    return {
        "automation_key": result.automation_key,
        "triggered": result.triggered,
        "summary": result.summary,
        "actions_taken": result.actions_taken,
        "artifact": result.artifact,
        "error": result.error,
    }


@router.post("/drafts/{draft_table}/{draft_id}/approve")
async def approve_draft(
    draft_table: str, draft_id: str, user: AuthedUser = Depends(require_auth)
):
    """
    Generic approve endpoint for any *_drafts table (deal_drafts,
    invoice_drafts, project_suggestions). The frontend shows these as
    review cards; this just flips status so a downstream send/apply
    step (email send, project creation) can pick it up.
    """
    _assert_allowed_draft_table(draft_table)
    db = get_db()
    resp = (
        db.table(draft_table)
        .update({"status": "approved"})
        .eq("id", draft_id)
        .eq("org_id", user.org_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(404, "Draft not found")
    return resp.data[0]


@router.post("/drafts/{draft_table}/{draft_id}/reject")
async def reject_draft(
    draft_table: str, draft_id: str, user: AuthedUser = Depends(require_auth)
):
    _assert_allowed_draft_table(draft_table)
    db = get_db()
    resp = (
        db.table(draft_table)
        .update({"status": "rejected"})
        .eq("id", draft_id)
        .eq("org_id", user.org_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(404, "Draft not found")
    return resp.data[0]


_ALLOWED_DRAFT_TABLES = {"deal_drafts", "invoice_drafts", "project_suggestions"}


def _assert_allowed_draft_table(table: str) -> None:
    # Whitelist, not a free-text table name from the URL  prevents
    # this generic endpoint from being pointed at arbitrary tables.
    if table not in _ALLOWED_DRAFT_TABLES:
        raise HTTPException(400, f"Unknown draft table: {table}")

```

### `automation-service/app/routes/webhooks.py`

```python
"""
Receives Supabase Database Webhook POSTs and dispatches to whichever
EVENT automations are listening on that table.

Supabase's Database Webhook payload shape (pg_net / supabase_functions):
{
  "type": "INSERT" | "UPDATE" | "DELETE",
  "table": "deals",
  "schema": "public",
  "record": { ...new row... },
  "old_record": { ...old row, only on UPDATE/DELETE... }
}

Configure this in Supabase: Database -> Webhooks -> new webhook ->
table = deals/staff/etc, events = the ones you care about, URL = this
service's /webhooks/supabase, plus a shared secret header for auth.
"""

from __future__ import annotations

import hmac
import os

from fastapi import APIRouter, Header, HTTPException, Request

from app.automations.base import AutomationContext
from app.automations.engine import run_automation
from app.automations.registry import automations_for_table
from app.core.supabase_client import get_db
from app.llm.client import get_llm_client

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

WEBHOOK_SECRET = os.environ.get("SUPABASE_WEBHOOK_SECRET", "")


def _verify_secret(provided: str | None) -> None:
    if not WEBHOOK_SECRET:
        # Fail loudly in production rather than silently accepting
        # unauthenticated webhook traffic.
        raise HTTPException(500, "SUPABASE_WEBHOOK_SECRET not configured")
    if not provided or not hmac.compare_digest(provided, WEBHOOK_SECRET):
        raise HTTPException(401, "Invalid webhook secret")


@router.post("/supabase")
async def handle_supabase_webhook(
    request: Request,
    x_webhook_secret: str | None = Header(default=None),
):
    _verify_secret(x_webhook_secret)

    body = await request.json()
    table = body.get("table")
    event_type = body.get("type")
    record = body.get("record", {}) or {}
    old_record = body.get("old_record", {}) or {}
    org_id = record.get("org_id") or old_record.get("org_id")

    if not table or not org_id:
        raise HTTPException(400, "Payload missing table or org_id")

    candidates = automations_for_table(table)
    matching = [
        cls
        for cls in candidates
        if cls.listens_to_event is None or cls.listens_to_event == event_type
    ]

    if not matching:
        return {"status": "ignored", "reason": "no automation listens to this table/event"}

    db = get_db()
    llm = get_llm_client()
    ctx = AutomationContext(
        org_id=org_id,
        db=db,
        llm=llm,
        payload={"record": record, "old_record": old_record, "type": event_type},
    )

    results = []
    for automation_cls in matching:
        result = await run_automation(automation_cls, ctx)
        results.append(
            {
                "automation_key": result.automation_key,
                "triggered": result.triggered,
                "summary": result.summary,
                "error": result.error,
            }
        )

    return {"status": "processed", "results": results}

```

### `automation-service/requirements.txt`

```text
fastapi==0.115.6
uvicorn[standard]==0.34.0
supabase==2.11.0
anthropic==0.42.0
openai==1.59.6
apscheduler==3.11.0
pyjwt==2.10.1
python-dotenv==1.0.1
pydantic==2.10.4

```

### `docs/deployment.md`

````markdown
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
│   React (Vercel) │ ──────▶ │  Supabase (Postgres,  │
│                   │  reads  │  Auth)  unchanged    │
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

````

### `docs/supabase_webhooks_setup.md`

````markdown
# Wiring Supabase → Automation Service (Event triggers)

Two of the five automations are EVENT-driven and need Supabase to call
the automation service when a row changes:

- **Won deal → project kickoff**: fires on `UPDATE` to `deals`
- **New hire checklist**: fires on `INSERT` to `staff`

Supabase's built-in **Database Webhooks** feature is the cleanest way
to do this (it's a thin wrapper over `pg_net`, no custom SQL trigger
required). Steps:

## 1. Deploy the automation service first
You need a live HTTPS URL before configuring the webhook. Deploy to
Railway/Render/Fly (see `docs/deployment.md`), confirm `GET /health`
returns `{"status": "ok"}`, then continue.

## 2. Create the webhooks in the Supabase Dashboard
Go to **Database → Webhooks → Create a new webhook**, once for each:

### Webhook 1: deals → kickoff
- Name: `deals_won_kickoff`
- Table: `deals`
- Events: `Update` only
- Type: `HTTP Request`
- Method: `POST`
- URL: `https://your-automation-service.example.com/webhooks/supabase`
- Headers: `X-Webhook-Secret: <same value as SUPABASE_WEBHOOK_SECRET in .env>`

### Webhook 2: staff → new hire checklist
- Name: `staff_new_hire`
- Table: `staff`
- Events: `Insert` only
- Type: `HTTP Request`
- Method: `POST`
- URL: same as above
- Headers: same as above

Supabase sends the full row as `record` (and `old_record` on updates),
which is exactly the shape `app/routes/webhooks.py` expects  no
transformation needed.

## 3. Why not a raw Postgres trigger + pg_net instead?
You can do it that way (see `0002_optional_pg_net_trigger.sql` below
for reference), and it's marginally faster since it skips the Supabase
dashboard's webhook-management layer. But the Dashboard UI version is
easier to inspect, pause, and debug without writing SQL, and the
performance difference is irrelevant at this scale. Use the dashboard
version unless you have a specific reason not to.

## 4. Verify
Update a deal's `stage` to `closed_won` in the Supabase table editor.
Within a couple seconds, check:
```sql
select * from automation_runs order by created_at desc limit 5;
```
You should see a `won_deal_project_kickoff` row with `triggered = true`.

````

### `frontend-integration/automationApi.ts`

```typescript
/**
 * Thin client for the Cynda Automation Service, used by the React
 * (Vercel) app. Drop this into your existing project, e.g. at
 * src/lib/automationApi.ts.
 *
 * Auth: reuses your existing Supabase session  no separate login.
 * The automation service verifies the same JWT Supabase already gave
 * the browser.
 */

import { supabase } from "./supabaseClient"; // your existing client init

const AUTOMATION_API_URL = import.meta.env.VITE_AUTOMATION_API_URL as string;
// e.g. "https://cynda-automations.up.railway.app"

async function authedFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${AUTOMATION_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Automation API error (${res.status}): ${body}`);
  }

  return res.json();
}

export interface AutomationMeta {
  key: string;
  name: string;
  department: string;
  trigger_type: "event" | "poll" | "schedule";
  llm_powered: boolean;
}

export interface AutomationRun {
  id: string;
  automation_key: string;
  triggered: boolean;
  summary: string;
  actions_taken: string[];
  artifact: Record<string, unknown> | null;
  error: string | null;
  duration_ms: number;
  created_at: string;
}

/** List all automations + metadata, for the Automations settings panel. */
export function listAutomations(): Promise<AutomationMeta[]> {
  return authedFetch("/automations");
}

/** Recent run history, for an Activity / Audit feed. Optionally filter by key. */
export function listAutomationRuns(opts?: {
  limit?: number;
  automationKey?: string;
}): Promise<AutomationRun[]> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.automationKey) params.set("automation_key", opts.automationKey);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return authedFetch(`/automations/runs${qs}`);
}

/** Manual "Run now" button handler. */
export function triggerAutomation(key: string) {
  return authedFetch(`/automations/${key}/run`, { method: "POST" });
}

/** Approve an LLM-drafted item (follow-up email, reminder, kickoff suggestion). */
export function approveDraft(
  draftTable: "deal_drafts" | "invoice_drafts" | "project_suggestions",
  draftId: string
) {
  return authedFetch(`/automations/drafts/${draftTable}/${draftId}/approve`, {
    method: "POST",
  });
}

export function rejectDraft(
  draftTable: "deal_drafts" | "invoice_drafts" | "project_suggestions",
  draftId: string
) {
  return authedFetch(`/automations/drafts/${draftTable}/${draftId}/reject`, {
    method: "POST",
  });
}

```

### `supabase/migrations/0001_automation_tables.sql`

```sql
-- Cynda automation engine: supporting tables.
-- Run this against your existing Supabase project. Assumes you already
-- have: organizations, staff, deals, invoices, tasks (per your working
-- app). Adjust foreign key types (uuid vs bigint) to match your existing
-- primary key conventions if they differ.

-- Audit trail for every automation execution (powers the Activity feed)
create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  automation_key text not null,
  triggered boolean not null,
  summary text not null,
  actions_taken jsonb default '[]'::jsonb,
  artifact jsonb,
  error text,
  duration_ms integer,
  created_at timestamptz not null default now()
);
create index if not exists idx_automation_runs_org on automation_runs (org_id, created_at desc);
create index if not exists idx_automation_runs_key on automation_runs (automation_key, created_at desc);

-- LLM-drafted CRM follow-ups, pending human review before sending
create table if not exists deal_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid not null references deals(id) on delete cascade,
  kind text not null,
  draft_text text not null,
  status text not null default 'pending_review', -- pending_review | approved | rejected | sent
  created_at timestamptz not null default now()
);
create index if not exists idx_deal_drafts_org on deal_drafts (org_id, status);

-- LLM-drafted invoice payment reminders, pending human review
create table if not exists invoice_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  kind text not null,
  draft_text text not null,
  status text not null default 'pending_review',
  created_at timestamptz not null default now()
);
create index if not exists idx_invoice_drafts_org on invoice_drafts (org_id, status);

-- Suggested project name/summary when a deal closes won
create table if not exists project_suggestions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  source_deal_id uuid references deals(id) on delete set null,
  suggested_name text not null,
  kickoff_summary text not null,
  status text not null default 'pending_review', -- pending_review | approved | rejected
  created_project_id uuid references projects(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_project_suggestions_org on project_suggestions (org_id, status);

-- Weekly (and future cadence) leadership briefings
create table if not exists briefings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  kind text not null,
  content text not null,
  week_of date,
  created_at timestamptz not null default now()
);
create index if not exists idx_briefings_org on briefings (org_id, created_at desc);

-- Generic in-app notifications used by several automations
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references staff(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications (user_id, read, created_at desc);
-- Used by budget_threshold_alert / new_hire_checklist / weekly_briefing
-- to avoid duplicate notifications for the same logical event.
create unique index if not exists idx_notifications_org_kind on notifications (org_id, kind)
  where kind is not null;

-- Columns the automations read/write on your existing tables.
-- Run these only if the columns don't already exist.
alter table deals add column if not exists last_activity_at timestamptz default now();
alter table deals add column if not exists follow_up_drafted timestamptz;
alter table invoices add column if not exists reminder_drafted_at timestamptz;
alter table staff add column if not exists is_leadership boolean default false;
alter table staff add column if not exists hiring_manager_id uuid references staff(id);

-- Row Level Security: these tables are written exclusively by the
-- automation service (service-role key, bypasses RLS) but READ by
-- end users through the normal Supabase client in the React app.
-- Lock reads down to the user's own org.
alter table automation_runs enable row level security;
alter table deal_drafts enable row level security;
alter table invoice_drafts enable row level security;
alter table project_suggestions enable row level security;
alter table briefings enable row level security;
alter table notifications enable row level security;

create policy "org members can read automation_runs"
  on automation_runs for select
  using (org_id in (select org_id from staff where auth_user_id = auth.uid()));

create policy "org members can read deal_drafts"
  on deal_drafts for select
  using (org_id in (select org_id from staff where auth_user_id = auth.uid()));

create policy "org members can read invoice_drafts"
  on invoice_drafts for select
  using (org_id in (select org_id from staff where auth_user_id = auth.uid()));

create policy "org members can read project_suggestions"
  on project_suggestions for select
  using (org_id in (select org_id from staff where auth_user_id = auth.uid()));

create policy "org members can read briefings"
  on briefings for select
  using (org_id in (select org_id from staff where auth_user_id = auth.uid()));

create policy "users can read their own notifications"
  on notifications for select
  using (user_id in (select id from staff where auth_user_id = auth.uid()));

create policy "users can mark their own notifications read"
  on notifications for update
  using (user_id in (select id from staff where auth_user_id = auth.uid()))
  with check (user_id in (select id from staff where auth_user_id = auth.uid()));

```

### `supabase/migrations/0002_optional_pg_net_trigger.sql`

```sql
-- OPTIONAL, reference only. The Dashboard Webhooks UI (see
-- docs/supabase_webhooks_setup.md) is the recommended path  this file
-- shows the equivalent raw SQL if you ever want webhooks fully
-- version-controlled in migrations instead of dashboard config.
--
-- Requires the pg_net extension (enabled by default on Supabase).

create or replace function notify_automation_service()
returns trigger as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end
  );

  perform net.http_post(
    url := 'https://your-automation-service.example.com/webhooks/supabase',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Webhook-Secret', current_setting('app.settings.webhook_secret', true)
    ),
    body := payload
  );

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_deals_won_kickoff
  after update on deals
  for each row
  when (NEW.stage = 'closed_won' and OLD.stage is distinct from 'closed_won')
  execute function notify_automation_service();

create trigger trg_staff_new_hire
  after insert on staff
  for each row
  execute function notify_automation_service();

-- Set the secret once per database (or via Supabase Vault for better
-- secret hygiene): 
-- alter database postgres set app.settings.webhook_secret = 'your-secret';

```