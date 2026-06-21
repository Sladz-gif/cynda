"""
Management API consumed by the React frontend:
  - List all automations + metadata (for the settings/automations panel)
  - View recent run history (for the activity feed)
  - Manually trigger an automation on demand (e.g. "Run now" button)
  - Approve/reject LLM-drafted content (follow-ups, reminders, kickoffs)

Auth: this service trusts a Supabase JWT passed from the frontend (the
same one the user already has from Supabase Auth). We verify it and
extract business_id rather than accepting business_id as a client-supplied param
 never trust the browser to tell you which business it belongs to.
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
        .eq("business_id", user.business_id)
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
    ctx = AutomationContext(business_id=user.business_id, db=db, llm=llm)
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
        .eq("business_id", user.business_id)
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
        .eq("business_id", user.business_id)
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
