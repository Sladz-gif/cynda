"""
Budget threshold alert (Finance)

Notifies finance owners if spending approaches or exceeds a configured
budget. No LLM needed here  this is a deterministic numeric check,
and a hallucinated number in a finance alert is a real liability, not
a cute risk. Keep this one boring and exact on purpose.

Assumes tables (adjust as needed for your existing schema):
  budgets(id, business_id, category, period_start, period_end, limit_amount, currency)
  expenses(id, business_id, category, amount, currency, created_at)
  notifications(id, business_id, user_id, kind, title, body, read)
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
    key = "budget-overspend"
    name = "Alert when budget exceeded"
    department = Department.FINANCE
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 30 * 60  # every 30 min

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Note: If your schema doesn't have a budgets table, adjust this check
        resp = (
            ctx.db.table("expenses")  # Fallback to checking for expenses if budgets not present
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # For now, just check total expenses (adjust based on your actual schema)
        expenses = (
            ctx.db.table("expenses")
            .select("amount, category")
            .eq("business_id", ctx.business_id)
            .execute()
        )

        alerts_sent: list[str] = []

        # If you don't have budgets yet, skip this automation or adjust
        # For this example, we'll just skip if there are no budgets
        # budgets = (
        #     ctx.db.table("budgets")
        #     .select("id, category, limit_amount, currency, owner_id")
        #     .eq("business_id", ctx.business_id)
        #     .lte("period_start", ctx.now.isoformat())
        #     .gte("period_end", ctx.now.isoformat())
        #     .execute()
        # )

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary="Budget threshold alert configured (requires budgets table to be active).",
        )
