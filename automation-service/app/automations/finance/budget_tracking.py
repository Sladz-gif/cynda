"""
Budget tracking automation (Finance)

Automatically tracks spending against budget limits and alerts when thresholds are exceeded.
This eliminates manual budget monitoring that needs to be done repeatedly.

Assumes tables:
  - budgets: id, business_id, category, monthly_limit, current_spend, alert_threshold
  - expenses: id, business_id, category, amount, created_at
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


@register_automation
class BudgetTrackingAutomation(BaseAutomation):
    key = "budget-tracking"
    name = "Automatic budget tracking"
    department = Department.FINANCE
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 12  # Every 12 hours

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for budgets that need updating
        resp = (
            ctx.db.table("budgets")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get all budgets
        budgets = (
            ctx.db.table("budgets")
            .select("id, category, monthly_limit, current_spend, alert_threshold")
            .eq("business_id", ctx.business_id)
            .execute()
        )

        if not budgets.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No budgets configured.",
            )

        # Calculate current month spending
        month_start = ctx.now.replace(day=1).date().isoformat()
        
        alerts_triggered = 0
        for budget in budgets.data:
            # Get expenses for this category this month
            expenses = (
                ctx.db.table("expenses")
                .select("amount", count="exact")
                .eq("business_id", ctx.business_id)
                .eq("category", budget["category"])
                .gte("created_at", month_start)
                .execute()
            )
            
            current_spend = sum(exp.get("amount", 0) for exp in (expenses.data or []))
            monthly_limit = budget["monthly_limit"]
            alert_threshold = budget.get("alert_threshold", 0.8)  # Default 80%
            
            # Update current spend
            ctx.db.table("budgets").update({
                "current_spend": current_spend
            }).eq("id", budget["id"]).execute()
            
            # Check if threshold exceeded
            if monthly_limit > 0 and current_spend >= (monthly_limit * alert_threshold):
                # Create budget alert
                ctx.db.table("budget_alerts").insert({
                    "business_id": ctx.business_id,
                    "budget_id": budget["id"],
                    "category": budget["category"],
                    "current_spend": current_spend,
                    "monthly_limit": monthly_limit,
                    "percentage_used": (current_spend / monthly_limit * 100) if monthly_limit > 0 else 0,
                    "message": f"Budget alert: {budget['category']} spending at {current_spend/monthly_limit*100:.1f}% of monthly limit",
                    "status": "pending_review"
                }).execute()
                
                alerts_triggered += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Updated {len(budgets.data)} budgets and triggered {alerts_triggered} alerts.",
            actions_taken=[f"Budget updated for: {budget['category']}" for budget in budgets.data],
            artifact={"budgets_updated": len(budgets.data), "alerts_triggered": alerts_triggered},
        )
