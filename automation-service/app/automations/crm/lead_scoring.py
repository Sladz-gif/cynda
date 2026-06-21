"""
Lead scoring automation (CRM)

Calculates and updates lead score based on interactions and engagement.

Assumes a `crm_contacts` table with columns:
  id, business_id, name, email, lead_score, last_scored_at
And a `crm_interactions` table with columns:
  id, contact_id, interaction_type, created_at
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
class LeadScoringAutomation(BaseAutomation):
    key = "lead-score-update"
    name = "Lead scoring automation"
    department = Department.CRM
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "crm_contacts"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Always score new contacts
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        contact_id = ctx.payload.get("record", {}).get("id")
        if not contact_id:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No contact ID found in payload.",
            )

        # Calculate lead score based on interactions
        interactions = (
            ctx.db.table("crm_interactions")
            .select("id, interaction_type")
            .eq("contact_id", contact_id)
            .execute()
        )

        score = 0
        if interactions.data:
            for interaction in interactions.data:
                interaction_type = interaction.get("interaction_type", "")
                if interaction_type == "email_open":
                    score += 5
                elif interaction_type == "email_click":
                    score += 10
                elif interaction_type == "website_visit":
                    score += 3
                elif interaction_type == "meeting_scheduled":
                    score += 20
                elif interaction_type == "demo_requested":
                    score += 30

        # Cap score at 100
        score = min(score, 100)

        ctx.db.table("crm_contacts").update(
            {"lead_score": score, "last_scored_at": ctx.now.isoformat()}
        ).eq("id", contact_id).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Calculated lead score of {score} for contact.",
            actions_taken=[f"Lead score updated to {score}"],
            artifact={"score": score},
        )
