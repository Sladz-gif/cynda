"""
Task deadline notifications (Projects)

Notifies assignees about upcoming task deadlines.

Assumes a `tasks` table with columns:
  id, business_id, title, assignee_id, due_date, reminder_sent_at
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
class TaskDeadlineNotifications(BaseAutomation):
    key = "task-reminder"
    name = "Task deadline notifications"
    department = Department.PROJECTS
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 9 * * *"  # Daily at 9 AM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        reminder_threshold = (ctx.now + timedelta(days=2)).date().isoformat()
        resp = (
            ctx.db.table("tasks")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .eq("due_date", reminder_threshold)
            .neq("status", "completed")
            .is_("reminder_sent_at", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        reminder_threshold = (ctx.now + timedelta(days=2)).date().isoformat()
        
        upcoming_tasks = (
            ctx.db.table("tasks")
            .select("id, title, assignee_id, due_date")
            .eq("business_id", ctx.business_id)
            .eq("due_date", reminder_threshold)
            .neq("status", "completed")
            .is_("reminder_sent_at", "null")
            .execute()
        )

        if not upcoming_tasks.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No tasks due in 2 days.",
            )

        notified: list[str] = []
        for task in upcoming_tasks.data:
            ctx.db.table("task_notifications").insert(
                {
                    "business_id": ctx.business_id,
                    "task_id": task["id"],
                    "assignee_id": task["assignee_id"],
                    "kind": "deadline_reminder",
                    "message": f"Task '{task['title']}' is due on {task['due_date']}",
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("tasks").update(
                {"reminder_sent_at": ctx.now.isoformat()}
            ).eq("id", task["id"]).execute()

            notified.append(task["title"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {len(notified)} task deadline reminder(s).",
            actions_taken=[f"Reminder sent for task: {name}" for name in notified],
            artifact={"task_names": notified},
        )
