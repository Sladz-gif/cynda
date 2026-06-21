"""
Poller: runs every POLL-type automation, for every active business, on its
own interval. This is the mechanism behind "stale deal follow-up",
"budget threshold alert", and "overdue invoice reminder"  none of
these have a natural webhook moment, so they're checked periodically
instead.

Implementation note: APScheduler runs one job per (automation, and we
fan out to businesses inside that job) rather than one job per business, because
business count will grow and we don't want N*M scheduler jobs registered.
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


async def _get_active_business_ids(db) -> list[str]:
    """
    Every poll cycle needs to know which businesses to check. Pulled from a
    `businesses` table; swap the filter if you add a plan/status
    column later (e.g. only poll businesses on active subscriptions).
    """
    resp = db.table("businesses").select("id").execute()
    return [row["id"] for row in (resp.data or [])]


async def _run_poll_automation(automation_cls) -> None:
    db = get_db()
    llm = get_llm_client()
    business_ids = await _get_active_business_ids(db)

    for business_id in business_ids:
        ctx = AutomationContext(business_id=business_id, db=db, llm=llm)
        try:
            await run_automation(automation_cls, ctx)
        except Exception:  # noqa: BLE001
            # One business's failure should never block the rest of the fan-out.
            logger.exception(
                "Poll automation %s failed for business %s", automation_cls.key, business_id
            )


def register_poll_jobs(scheduler: AsyncIOScheduler) -> None:
    poll_automations = automations_by_trigger(TriggerType.POLL)

    for automation_cls in poll_automations:
        if not automation_cls.poll_interval_seconds:
            logger.warning(
                "Automation %s is POLL type but has no poll_interval_seconds set; skipping.",
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
