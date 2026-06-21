"""
Payroll preparation reminder (HR)

Notifies HR to verify timesheets and prepare payroll 3 days before month-end.

Assumes a `payroll_reminders` table with columns:
  id, business_id, month, reminder_sent_at
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
class PayrollPreparationReminder(BaseAutomation):
    key = "payroll-preparation"
    name = "Payroll preparation reminder"
    department = Department.HR
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 10 28-31 * *"  # 10 AM on days 28-31 (end of month)

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check if it's 3 days before month-end
        today = ctx.now.date()
        next_month = today.replace(day=28) + timedelta(days=4)
        month_end = next_month - timedelta(days=next_month.day)
        days_until_end = (month_end - today).days
        
        if days_until_end != 3:
            return False
        
        # Check if reminder already sent this month
        month_start = today.replace(day=1).isoformat()
        resp = (
            ctx.db.table("payroll_reminders")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .gte("reminder_sent_at", month_start)
            .limit(1)
            .execute()
        )
        return (resp.count or 0) == 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        today = ctx.now.date()
        month_start = today.replace(day=1)
        month_end = month_start.replace(day=28) + timedelta(days=4)
        month_end = month_end - timedelta(days=month_end.day)
        
        # Create payroll reminder
        ctx.db.table("payroll_reminders").insert(
            {
                "business_id": ctx.business_id,
                "month": month_start.isoformat(),
                "reminder_sent_at": ctx.now.isoformat(),
                "message": f"Payroll for {month_start.strftime('%B %Y')} is due in 3 days. Please verify timesheets.",
                "status": "pending_review",
            }
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Payroll preparation reminder sent for {month_start.strftime('%B %Y')}.",
            actions_taken=[f"Payroll reminder sent for {month_start.strftime('%B %Y')}"],
            artifact={"month": month_start.isoformat()},
        )
