"""
Auto-assign tasks (Projects)

Assigns new tasks to team member with lowest workload.

Assumes a `tasks` table with columns:
  id, business_id, title, assignee_id
And a `staff` table with columns:
  id, business_id, name, active_task_count
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


@register_automation
class AutoAssignTasks(BaseAutomation):
    key = "task-assignment"
    name = "Auto-assign tasks"
    department = Department.PROJECTS
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "tasks"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Only auto-assign if no assignee is set
        record = ctx.payload.get("record", {})
        return not record.get("assignee_id")

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        task_id = ctx.payload.get("record", {}).get("id")
        task_title = ctx.payload.get("record", {}).get("title", "New Task")
        
        if not task_id:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No task ID found in payload.",
            )

        # Find team member with lowest workload
        staff = (
            ctx.db.table("staff")
            .select("id, name, active_task_count")
            .eq("business_id", ctx.business_id)
            .order("active_task_count")
            .limit(1)
            .execute()
        )

        if not staff.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No staff members available for assignment.",
            )

        assignee = staff.data[0]
        assignee_id = assignee["id"]
        assignee_name = assignee["name"]

        # Assign task
        ctx.db.table("tasks").update(
            {"assignee_id": assignee_id}
        ).eq("id", task_id).execute()

        # Update staff workload
        current_count = assignee.get("active_task_count", 0)
        ctx.db.table("staff").update(
            {"active_task_count": current_count + 1}
        ).eq("id", assignee_id).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Task assigned to {assignee_name}.",
            actions_taken=[f"Task '{task_title}' assigned to {assignee_name}"],
            artifact={"assignee_name": assignee_name, "assignee_id": assignee_id},
        )
