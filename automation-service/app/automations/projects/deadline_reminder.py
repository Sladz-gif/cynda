"""
Task deadline reminder (Projects)

Automatically sends reminders for upcoming task deadlines.
This eliminates manual deadline tracking that needs to be done repeatedly.

Assumes tables:
  - tasks: id, business_id, project_id, title, assignee_id, due_date, status, reminder_sent
  - task_notifications: id, business_id, task_id, assignee_id, kind, message, status, created_at
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
class TaskDeadlineReminder(BaseAutomation):
    key = "task-deadline-reminder"
    name = "Task deadline reminder"
    department = Department.PROJECTS
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 6  # Every 6 hours

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for tasks due soon without reminders
        tomorrow = (ctx.now + timedelta(days=1)).date().isoformat()
        resp = (
            ctx.db.table("tasks")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .lte("due_date", tomorrow)
            .neq("status", "completed")
            .is_("reminder_sent", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        tomorrow = (ctx.now + timedelta(days=1)).date().isoformat()
        
        # Get tasks due soon without reminders
        tasks_due = (
            ctx.db.table("tasks")
            .select("id, title, assignee_id, due_date, priority")
            .eq("business_id", ctx.business_id)
            .lte("due_date", tomorrow)
            .neq("status", "completed")
            .is_("reminder_sent", "null")
            .execute()
        )

        if not tasks_due.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No upcoming deadlines requiring reminders.",
            )

        reminders_sent = 0
        for task in tasks_due.data:
            # Calculate urgency
            due_date = task["due_date"]
            today = ctx.now.date().isoformat()
            
            if due_date == today:
                urgency = "due today"
            elif due_date == tomorrow:
                urgency = "due tomorrow"
            else:
                urgency = "overdue"
            
            # Create notification
            ctx.db.table("task_notifications").insert({
                "business_id": ctx.business_id,
                "task_id": task["id"],
                "assignee_id": task["assignee_id"],
                "kind": "deadline_reminder",
                "message": f"Task '{task['title']}' is {urgency}. Priority: {task.get('priority', 'medium')}",
                "status": "pending_review"
            }).execute()
            
            # Mark reminder as sent
            ctx.db.table("tasks").update({
                "reminder_sent": ctx.now.isoformat()
            }).eq("id", task["id"]).execute()
            
            reminders_sent += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {reminders_sent} deadline reminders.",
            actions_taken=[f"Reminder sent for task: {task['title']}" for task in tasks_due.data],
            artifact={"reminders_sent": reminders_sent},
        )
