"""
Scheduler: runs SCHEDULE-type automations (cron expressions) for every
business, e.g. the weekly Monday briefing.

Separate from poller.py deliberately  polling is "check if condition
X is true periodically" while scheduling is "do this at this exact
calendar moment regardless of state". Conflating them made the early
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
from app.core.poller import _get_active_business_ids
from app.core.supabase_client import get_db
from app.llm.client import get_llm_client

logger = logging.getLogger("cynda.scheduler")

# All cron expressions are interpreted in this timezone. Set to your
# primary customer base's timezone, or make this per-business later if you
# expand globally (Google/Microsoft-scale would eventually want
# per-business timezone-aware briefings).
SCHEDULER_TIMEZONE = os.environ.get("SCHEDULER_TIMEZONE", "UTC")


async def _run_scheduled_automation(automation_cls) -> None:
    db = get_db()
    llm = get_llm_client()
    business_ids = await _get_active_business_ids(db)

    for business_id in business_ids:
        ctx = AutomationContext(business_id=business_id, db=db, llm=llm)
        try:
            await run_automation(automation_cls, ctx)
        except Exception:  # noqa: BLE001
            logger.exception(
                "Scheduled automation %s failed for business %s", automation_cls.key, business_id
            )


def register_scheduled_jobs(scheduler: AsyncIOScheduler) -> None:
    scheduled_automations = automations_by_trigger(TriggerType.SCHEDULE)

    for automation_cls in scheduled_automations:
        if not automation_cls.cron_expression:
            logger.warning(
                "Automation %s is SCHEDULE type but has no cron_expression set; skipping.",
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
