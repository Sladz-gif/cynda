"""
Stale deal follow-up (CRM)

Cyndi drafts a follow-up nudge if a deal has had no activity for a set
number of days using deterministic Python logic.

Trigger model: this one is technically a POLL, not a pure EVENT, even
though "no activity for N days" sounds passive. There's no row update
that fires when time silently passes  so we check deals on an interval
rather than waiting for a webhook that will never come for a stalled deal.

Assumes a `crm_deals` table with columns roughly:
  id, business_id, title, stage, contact_id,
  last_activity_at, follow_up_drafted
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

DEFAULT_STALE_DAYS = 7


@register_automation
class StaleDealFollowUp(BaseAutomation):
    key = "follow-up-reminder"
    name = "Auto follow-up on stale deals"
    department = Department.CRM
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60  # hourly is enough; deals don't go stale by the minute

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Cheap existence check only; the real per-deal filtering happens
        # in run() since "stale" is computed per-row, not globally.
        resp = (
            ctx.db.table("crm_deals")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .neq("stage", "Closed Won")
            .neq("stage", "Closed Lost")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        cutoff = (ctx.now - timedelta(days=DEFAULT_STALE_DAYS)).isoformat()

        # Join with crm_contacts for contact info
        stale_deals = (
            ctx.db.table("crm_deals")
            .select("id, title, last_activity_at, contact_id, crm_contacts(name, email)")
            .eq("business_id", ctx.business_id)
            .neq("stage", "Closed Won")
            .neq("stage", "Closed Lost")
            .lt("last_activity_at", cutoff)
            .is_("follow_up_drafted", "null")  # avoid re-drafting every poll
            .execute()
        )

        if not stale_deals.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No stale deals found this cycle.",
            )

        drafted: list[str] = []
        for deal in stale_deals.data:
            draft = self._generate_followup(deal)

            ctx.db.table("deal_drafts").insert(
                {
                    "business_id": ctx.business_id,
                    "deal_id": deal["id"],
                    "kind": "follow_up_email",
                    "draft_text": draft,
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("crm_deals").update({"follow_up_drafted": ctx.now.isoformat()}).eq(
                "id", deal["id"]
            ).execute()

            drafted.append(deal["title"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Drafted {len(drafted)} follow-up nudge(s) for stale deals.",
            actions_taken=[f"Draft created for deal: {name}" for name in drafted],
            artifact={"deal_names": drafted},
        )

    def _generate_followup(self, deal: dict) -> str:
        """Generate a follow-up email using deterministic logic."""
        contact = deal.get("crm_contacts", {})
        contact_name = contact.get("name", "there")
        deal_title = deal["title"]
        
        return f"""Hi {contact_name},

I hope you're doing well. I wanted to follow up on our conversation about {deal_title}.

It's been about a week since we last spoke, and I wanted to check if you had any questions or if there's anything I can help with to move things forward.

Would you be available for a quick call this week to discuss next steps?

Best regards"""
