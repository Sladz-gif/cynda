"""
Receives Supabase Database Webhook POSTs and dispatches to whichever
EVENT automations are listening on that table.

Supabase's Database Webhook payload shape (pg_net / supabase_functions):
{
  "type": "INSERT" | "UPDATE" | "DELETE",
  "table": "crm_deals",
  "schema": "public",
  "record": { ...new row... },
  "old_record": { ...old row, only on UPDATE/DELETE... }
}

Configure this in Supabase: Database -> Webhooks -> new webhook ->
table = crm_deals/staff/etc, events = the ones you care about, URL = this
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
    business_id = record.get("business_id") or old_record.get("business_id")

    if not table or not business_id:
        raise HTTPException(400, "Payload missing table or business_id")

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
        business_id=business_id,
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
