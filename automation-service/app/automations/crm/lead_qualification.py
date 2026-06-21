"""
Lead qualification automation (CRM)

Automatically qualifies leads based on predefined criteria and assigns scores.
This eliminates manual lead qualification work that needs to be done repeatedly.

Assumes a `crm_contacts` table with columns:
  id, business_id, name, email, company, lead_score, last_scored_at, qualification_status
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
class LeadQualificationAutomation(BaseAutomation):
    key = "lead-qualification"
    name = "Automatic lead qualification"
    department = Department.CRM
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 2  # Every 2 hours

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for unqualified leads
        resp = (
            ctx.db.table("crm_contacts")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .is_("qualification_status", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get unqualified leads
        leads = (
            ctx.db.table("crm_contacts")
            .select("id, name, email, company, lead_score")
            .eq("business_id", ctx.business_id)
            .is_("qualification_status", "null")
            .execute()
        )

        if not leads.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No unqualified leads found.",
            )

        qualified_count = 0
        for lead in leads.data:
            qualification = self._qualify_lead(lead)
            
            ctx.db.table("crm_contacts").update({
                "qualification_status": qualification["status"],
                "lead_score": qualification["score"],
                "last_scored_at": ctx.now.isoformat()
            }).eq("id", lead["id"]).execute()
            
            qualified_count += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Qualified {qualified_count} leads automatically.",
            actions_taken=[f"Qualified lead: {lead['name']}" for lead in leads.data],
            artifact={"qualified_count": qualified_count},
        )

    def _qualify_lead(self, lead: dict) -> dict:
        """Qualify lead using deterministic scoring logic."""
        score = 0
        
        # Email presence (basic requirement)
        if lead.get("email"):
            score += 20
        
        # Company presence (indicates business lead)
        if lead.get("company"):
            score += 30
        
        # Existing lead score
        existing_score = lead.get("lead_score", 0)
        score += existing_score * 0.5
        
        # Determine qualification status
        if score >= 70:
            status = "hot"
        elif score >= 50:
            status = "warm"
        elif score >= 30:
            status = "cold"
        else:
            status = "unqualified"
        
        return {
            "status": status,
            "score": min(int(score), 100)
        }
