"""
Won deal -> project kickoff (Projects)

Suggests a project name and kickoff summary when a deal moves to
Closed Won using deterministic Python logic.

This is a genuine EVENT automation: it reacts to a specific
UPDATE on the `crm_deals` table (stage changed to 'Closed Won'), delivered
via a Supabase Database Webhook -> POST /webhooks/supabase.

See supabase/migrations for the trigger that fires this webhook.
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
class WonDealProjectKickoff(BaseAutomation):
    key = "deal-won-project"
    name = "Create project from won deal"
    department = Department.PROJECTS
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "crm_deals"
    listens_to_event = "UPDATE"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        record = ctx.payload.get("record", {})
        old_record = ctx.payload.get("old_record", {})
        # Only fire on the transition INTO Closed Won, not every update
        # while a deal is already won (which would re-draft endlessly).
        return (
            record.get("stage") == "Closed Won"
            and old_record.get("stage") != "Closed Won"
        )

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        deal = ctx.payload.get("record", {})

        suggestion = self._suggest_kickoff(deal)

        ctx.db.table("project_suggestions").insert(
            {
                "business_id": ctx.business_id,
                "source_deal_id": deal.get("id"),
                "suggested_name": suggestion["name"],
                "kickoff_summary": suggestion["summary"],
                "status": "pending_review",
            }
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Suggested project kickoff for won deal: {deal.get('title')}",
            actions_taken=[f"Project suggestion created: {suggestion['name']}"],
            artifact=suggestion,
        )

    def _suggest_kickoff(self, deal: dict) -> dict:
        """Generate project suggestion using deterministic logic."""
        deal_title = deal.get("title", "New Deal")
        deal_value = deal.get("value", 0)
        
        # Generate project name from deal title
        project_name = f"{deal_title} Implementation"
        if len(project_name) > 50:
            project_name = deal_title[:40] + " Implementation"
        
        # Generate summary based on deal value
        if deal_value > 50000:
            summary = f"Large-scale project implementation for {deal_title} with full team allocation and phased delivery approach."
        elif deal_value > 10000:
            summary = f"Standard project implementation for {deal_title} with dedicated team and regular milestone tracking."
        else:
            summary = f"Quick implementation project for {deal_title} with focused scope and rapid delivery timeline."
        
        return {
            "name": project_name,
            "summary": summary
        }
