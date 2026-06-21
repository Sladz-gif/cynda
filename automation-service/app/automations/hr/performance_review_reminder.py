"""
Performance review reminder (HR)

Automatically reminds managers and employees about upcoming performance reviews.
This eliminates manual reminder tracking that needs to be done repeatedly.

Assumes tables:
  - staff: id, business_id, name, role, department, hire_date, last_review_date
  - performance_reviews: id, business_id, staff_id, review_date, status, reminder_sent
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
class PerformanceReviewReminder(BaseAutomation):
    key = "performance-review-reminder"
    name = "Performance review reminder"
    department = Department.HR
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 9 * * 1"  # Every Monday at 9 AM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for staff with upcoming reviews
        thirty_days_out = (ctx.now + timedelta(days=30)).date().isoformat()
        resp = (
            ctx.db.table("staff")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .lte("last_review_date", thirty_days_out)
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        thirty_days_out = (ctx.now + timedelta(days=30)).date().isoformat()
        
        # Get staff with reviews due
        staff_due = (
            ctx.db.table("staff")
            .select("id, name, role, last_review_date")
            .eq("business_id", ctx.business_id)
            .lte("last_review_date", thirty_days_out)
            .execute()
        )

        if not staff_due.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No performance reviews due.",
            )

        reminders_sent = 0
        for employee in staff_due.data:
            # Create performance review reminder
            ctx.db.table("performance_reviews").insert({
                "business_id": ctx.business_id,
                "staff_id": employee["id"],
                "review_date": (ctx.now + timedelta(days=30)).date().isoformat(),
                "status": "scheduled",
                "reminder_sent": ctx.now.isoformat()
            }).execute()
            
            reminders_sent += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {reminders_sent} performance review reminders.",
            actions_taken=[f"Reminder sent for: {employee['name']}" for employee in staff_due.data],
            artifact={"reminders_sent": reminders_sent},
        )
