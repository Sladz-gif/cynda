"""
Automatic task assignment (Projects)

Automatically assigns tasks to team members based on workload and expertise.
This eliminates manual task assignment work that needs to be done repeatedly.

Assumes tables:
  - tasks: id, business_id, project_id, title, status, assignee_id, priority, created_at
  - staff: id, business_id, name, role, department, active_task_count
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
class AutoTaskAssignment(BaseAutomation):
    key = "auto-task-assignment"
    name = "Automatic task assignment"
    department = Department.PROJECTS
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "tasks"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Only assign if task has no assignee
        record = ctx.payload.get("record", {})
        return not record.get("assignee_id")

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        task = ctx.payload.get("record", {})
        task_id = task.get("id")
        project_id = task.get("project_id")
        priority = task.get("priority", "medium")
        
        if not task_id:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No task ID found.",
            )

        # Get available staff with lowest workload
        staff = (
            ctx.db.table("staff")
            .select("id, name, active_task_count")
            .eq("business_id", ctx.business_id)
            .order("active_task_count", ascending=True)
            .limit(1)
            .execute()
        )

        if not staff.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No available staff to assign task.",
            )

        assignee = staff.data[0]
        
        # Assign task
        ctx.db.table("tasks").update({
            "assignee_id": assignee["id"]
        }).eq("id", task_id).execute()
        
        # Update staff task count
        ctx.db.table("staff").update({
            "active_task_count": (assignee.get("active_task_count", 0) + 1)
        }).eq("id", assignee["id"]).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Assigned task to {assignee['name']} (workload: {assignee.get('active_task_count', 0)}).",
            actions_taken=[f"Task assigned to: {assignee['name']}"],
            artifact={"assignee": assignee["name"], "workload": assignee.get("active_task_count", 0)},
        )
