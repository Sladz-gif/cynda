"""
Weekly Monday briefing (Cross-department)

Cyndi summarizes tasks, pipeline, and invoices for leadership every
Monday morning using deterministic Python logic.

This is the showcase automation  it's the one that should make a 
leadership team feel like the platform thinks ahead of them, which is 
exactly the "every day is a holiday" promise: the human doesn't have to 
go assemble this themselves.

Trigger: SCHEDULE, cron "0 8 * * 1" (Monday 08:00  runs in the
scheduler's configured timezone; see core/scheduler.py).
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
class WeeklyMondayBriefing(BaseAutomation):
    key = "weekly-briefing"
    name = "Weekly executive summary"
    department = Department.CROSS
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 8 * * 1"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Scheduler only calls run() when the cron fires, so this is
        # effectively always true. Kept as a hook in case you later want
        # to skip orgs with zero activity, paused plans, etc.
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        tasks_due = (
            ctx.db.table("tasks")
            .select("id, title, status, due_date", count="exact")
            .eq("business_id", ctx.business_id)
            .neq("status", "completed")
            .execute()
        )
        open_deals = (
            ctx.db.table("crm_deals")
            .select("id, title, stage, value")
            .eq("business_id", ctx.business_id)
            .neq("stage", "Closed Won")
            .neq("stage", "Closed Lost")
            .execute()
        )
        overdue_invoices = (
            ctx.db.table("invoices")
            .select("id, client_name, amount, due_date")
            .eq("business_id", ctx.business_id)
            .lt("due_date", ctx.now.date().isoformat())
            .neq("status", "Paid")
            .execute()
        )

        briefing_text = self._compose_briefing(
            tasks_due=tasks_due.data or [],
            open_deals=open_deals.data or [],
            overdue_invoices=overdue_invoices.data or [],
        )

        ctx.db.table("briefings").insert(
            {
                "business_id": ctx.business_id,
                "kind": "weekly_monday",
                "content": briefing_text,
                "week_of": ctx.now.date().isoformat(),
            }
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary="Weekly briefing generated.",
            artifact={"briefing": briefing_text},
        )

    def _compose_briefing(
        self,
        tasks_due: list[dict],
        open_deals: list[dict],
        overdue_invoices: list[dict],
    ) -> str:
        """Compose briefing using deterministic logic."""
        pipeline_value = sum(d.get("value") or 0 for d in open_deals)
        overdue_total = sum(i.get("amount") or 0 for i in overdue_invoices)

        # Build briefing text using deterministic logic
        briefing = f"Weekly Executive Briefing for {self._format_date()}\n\n"
        
        briefing += f"**Tasks**: {len(tasks_due)} tasks currently in progress. "
        if tasks_due:
            briefing += "Focus on completing high-priority items this week.\n\n"
        else:
            briefing += "All tasks completed - great progress!\n\n"
        
        briefing += f"**Sales Pipeline**: {len(open_deals)} active deals with total value ${pipeline_value:,.2f}. "
        if pipeline_value > 0:
            briefing += "Pipeline looks healthy - continue nurturing key opportunities.\n\n"
        else:
            briefing += "Pipeline needs attention - focus on lead generation.\n\n"
        
        briefing += f"**Invoices**: {len(overdue_invoices)} overdue invoices totaling ${overdue_total:,.2f}. "
        if overdue_invoices:
            briefing += "Immediate follow-up required to improve cash flow.\n\n"
        else:
            briefing += "All invoices current - excellent accounts receivable management.\n\n"
        
        briefing += "Overall: " + self._generate_overall_assessment(
            len(tasks_due), len(open_deals), pipeline_value, len(overdue_invoices), overdue_total
        )
        
        return briefing

    def _format_date(self) -> str:
        """Format current date for briefing."""
        from datetime import datetime
        return datetime.now().strftime("%B %d, %Y")

    def _generate_overall_assessment(
        self, tasks_count: int, deals_count: int, pipeline_value: float, 
        overdue_count: int, overdue_total: float
    ) -> str:
        """Generate overall assessment using deterministic logic."""
        if overdue_count > 0:
            return "Cash flow concerns due to overdue invoices require immediate attention."
        elif pipeline_value > 50000:
            return "Strong pipeline position with healthy revenue opportunities."
        elif tasks_count > 10:
            return "High task volume - consider resource allocation and prioritization."
        else:
            return "Operations running smoothly with balanced workload and healthy pipeline."
