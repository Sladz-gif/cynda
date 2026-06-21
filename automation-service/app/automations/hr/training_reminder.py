"""
Training reminder (HR)

Automatically reminds staff about required training and certifications.
This eliminates manual training tracking that needs to be done repeatedly.

Assumes tables:
  - staff: id, business_id, name, role, department
  - training_requirements: id, business_id, staff_id, training_type, due_date, completed, reminder_sent
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
class TrainingReminder(BaseAutomation):
    key = "training-reminder"
    name = "Training requirement reminder"
    department = Department.HR
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 8 * * *"  # Daily at 8 AM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for training due soon
        seven_days_out = (ctx.now + timedelta(days=7)).date().isoformat()
        resp = (
            ctx.db.table("training_requirements")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .lte("due_date", seven_days_out)
            .eq("completed", False)
            .is_("reminder_sent", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        seven_days_out = (ctx.now + timedelta(days=7)).date().isoformat()
        
        # Get training due soon
        training_due = (
            ctx.db.table("training_requirements")
            .select("id, staff_id, training_type, due_date")
            .eq("business_id", ctx.business_id)
            .lte("due_date", seven_days_out)
            .eq("completed", False)
            .is_("reminder_sent", "null")
            .execute()
        )

        if not training_due.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No training due soon.",
            )

        reminders_sent = 0
        for training in training_due.data:
            # Get staff name
            staff = (
                ctx.db.table("staff")
                .select("name")
                .eq("id", training["staff_id"])
                .execute()
            )
            
            staff_name = staff.data[0]["name"] if staff.data else "Unknown"
            
            # Calculate urgency
            due_date = training["due_date"]
            today = ctx.now.date().isoformat()
            
            if due_date == today:
                urgency = "due today"
            elif due_date == seven_days_out:
                urgency = "due in 7 days"
            else:
                urgency = "overdue"
            
            # Create reminder notification
            ctx.db.table("staff_notifications").insert({
                "business_id": ctx.business_id,
                "staff_id": training["staff_id"],
                "kind": "training_reminder",
                "message": f"Training '{training['training_type']}' is {urgency}. Please complete by {due_date}.",
                "status": "pending_review"
            }).execute()
            
            # Mark reminder as sent
            ctx.db.table("training_requirements").update({
                "reminder_sent": ctx.now.isoformat()
            }).eq("id", training["id"]).execute()
            
            reminders_sent += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {reminders_sent} training reminders.",
            actions_taken=[f"Training reminder sent for: {training['training_type']}" for training in training_due.data],
            artifact={"reminders_sent": reminders_sent},
        )
