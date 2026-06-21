"""
Engine: executes one automation instance and records what happened.

Every trigger pathway (webhook route, poller, scheduler) funnels through
`run_automation()`. This is the only place that:
  1. Calls should_trigger() then run()
  2. Catches and logs errors so one broken automation can't crash a request
  3. Writes a row to automation_runs for the Activity / Audit feed
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
        _persist_run(ctx.db, ctx.business_id, result, duration_ms=_elapsed(started))
        return result

    if not should_run:
        result = AutomationResult(
            automation_key=automation.key,
            triggered=False,
            summary="Conditions not met; skipped.",
        )
        # Skips are cheap and frequent (esp. for POLL automations)  don't
        # spam the audit table with them, just log at debug level.
        logger.debug("Skipped %s for business %s", automation.key, ctx.business_id)
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

    _persist_run(ctx.db, ctx.business_id, result, duration_ms=_elapsed(started))
    return result


def _elapsed(started: float) -> int:
    return int((time.monotonic() - started) * 1000)


def _persist_run(
    db: Client,
    business_id: str,
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
                "business_id": business_id,
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
