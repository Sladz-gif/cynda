"""
Project risk alerts (Projects)

Flags projects with missed deadlines or blocked tasks every Friday.

Assumes a `projects` table with columns:
  id, business_id, name, health_status, last_health_check
And a `tasks` table with columns:
  id, project_id, status, due_date
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
class ProjectHealthCheck(BaseAutomation):
    key = "project-health-check"
    name = "Project risk alerts"
    department = Department.PROJECTS
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 17 * * 5"  # Friday at 5:00 PM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Always run health check on schedule
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get all active projects
        projects = (
            ctx.db.table("projects")
            .select("id, name")
            .eq("business_id", ctx.business_id)
            .neq("status", "completed")
            .execute()
        )

        if not projects.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No active projects to check.",
            )

        at_risk: list[str] = []
        for project in projects.data:
            project_id = project["id"]
            project_name = project["name"]

            # Check for overdue tasks
            overdue_tasks = (
                ctx.db.table("tasks")
                .select("id", count="exact")
                .eq("project_id", project_id)
                .lt("due_date", ctx.now.date().isoformat())
                .neq("status", "completed")
                .execute()
            )

            # Check for blocked tasks
            blocked_tasks = (
                ctx.db.table("tasks")
                .select("id", count="exact")
                .eq("project_id", project_id)
                .eq("status", "blocked")
                .execute()
            )

            # Calculate risk score
            risk_score = 0
            if overdue_tasks.count:
                risk_score += overdue_tasks.count * 10
            if blocked_tasks.count:
                risk_score += blocked_tasks.count * 15

            # Update project health
            health_status = "healthy"
            if risk_score >= 30:
                health_status = "at_risk"
            elif risk_score >= 15:
                health_status = "warning"

            ctx.db.table("projects").update(
                {"health_status": health_status, "last_health_check": ctx.now.isoformat()}
            ).eq("id", project_id).execute()

            if health_status in ["warning", "at_risk"]:
                at_risk.append(f"{project_name} ({health_status})")

        if not at_risk:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="All projects are healthy.",
            )

        # Generate summary of risks using template-based logic
        risk_summary = self._generate_risk_summary(ctx, at_risk)

        ctx.db.table("project_health_reports").insert(
            {
                "business_id": ctx.business_id,
                "report_date": ctx.now.date().isoformat(),
                "at_risk_projects": at_risk,
                "summary": risk_summary,
            }
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Flagged {len(at_risk)} project(s) at risk.",
            actions_taken=[f"Health check completed for {len(projects.data)} project(s)"],
            artifact={"at_risk_projects": at_risk},
        )

    def _generate_risk_summary(self, ctx: AutomationContext, at_risk: list[str]) -> str:
        """Generate risk summary using template-based logic instead of AI."""
        if not at_risk:
            return "All projects are currently healthy with no identified risks."
        
        # Count risk levels
        at_risk_count = sum(1 for project in at_risk if "at_risk" in project)
        warning_count = sum(1 for project in at_risk if "warning" in project)
        
        # Build template summary
        summary_parts = []
        summary_parts.append(f"Project Health Report - {ctx.now.date().isoformat()}")
        summary_parts.append(f"Total projects requiring attention: {len(at_risk)}")
        
        if at_risk_count > 0:
            summary_parts.append(f"Critical risk: {at_risk_count} project(s)")
        if warning_count > 0:
            summary_parts.append(f"Warning level: {warning_count} project(s)")
        
        summary_parts.append("\nAction items:")
        summary_parts.append("- Review overdue tasks and update deadlines")
        summary_parts.append("- Address blocked tasks and dependencies")
        summary_parts.append("- Consider resource reallocation for at-risk projects")
        
        return "\n".join(summary_parts)
