"""
Project status update (Projects)

Automatically updates project status based on task completion and health metrics.
This eliminates manual status tracking that needs to be done repeatedly.

Assumes tables:
  - projects: id, business_id, name, status, health_status, last_status_update
  - tasks: id, business_id, project_id, status
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
class ProjectStatusUpdate(BaseAutomation):
    key = "project-status-update"
    name = "Automatic project status update"
    department = Department.PROJECTS
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 6  # Every 6 hours

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for active projects
        resp = (
            ctx.db.table("projects")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .eq("status", "active")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get active projects
        projects = (
            ctx.db.table("projects")
            .select("id, name, status, health_status")
            .eq("business_id", ctx.business_id)
            .eq("status", "active")
            .execute()
        )

        if not projects.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No active projects to update.",
            )

        updated_count = 0
        for project in projects.data:
            # Get tasks for this project
            tasks = (
                ctx.db.table("tasks")
                .select("status", count="exact")
                .eq("business_id", ctx.business_id)
                .eq("project_id", project["id"])
                .execute()
            )
            
            if not tasks.data:
                continue
            
            total_tasks = len(tasks.data)
            completed_tasks = len([t for t in tasks.data if t["status"] == "completed"])
            completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0
            
            # Determine new status
            new_status = self._determine_status(completion_rate)
            new_health = self._determine_health(completion_rate, total_tasks)
            
            # Update project
            ctx.db.table("projects").update({
                "status": new_status,
                "health_status": new_health,
                "last_status_update": ctx.now.isoformat()
            }).eq("id", project["id"]).execute()
            
            updated_count += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Updated status for {updated_count} projects.",
            actions_taken=[f"Status updated for: {project['name']}" for project in projects.data],
            artifact={"updated_count": updated_count},
        )

    def _determine_status(self, completion_rate: float) -> str:
        """Determine project status based on completion rate."""
        if completion_rate >= 1.0:
            return "completed"
        elif completion_rate >= 0.75:
            return "near_completion"
        elif completion_rate >= 0.25:
            return "in_progress"
        else:
            return "just_started"

    def _determine_health(self, completion_rate: float, total_tasks: int) -> str:
        """Determine project health based on completion rate and task count."""
        if completion_rate >= 0.75:
            return "healthy"
        elif completion_rate >= 0.5:
            return "on_track"
        elif completion_rate >= 0.25:
            return "at_risk"
        else:
            return "critical"
