"""
New client welcome sequence (CRM)

Sends a personalized welcome email when a new company is added to CRM
using deterministic Python logic.

Assumes a `crm_companies` table with columns:
  id, business_id, name, welcome_sent_at
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
class WelcomeEmailSequence(BaseAutomation):
    key = "welcome-email"
    name = "New client welcome sequence"
    department = Department.CRM
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "crm_companies"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Always send welcome for new companies
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        company_id = ctx.payload.get("record", {}).get("id")
        company_name = ctx.payload.get("record", {}).get("name", "New Company")
        
        if not company_id:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No company ID found in payload.",
            )

        draft = self._generate_welcome_email(company_name)

        ctx.db.table("company_messages").insert(
            {
                "business_id": ctx.business_id,
                "company_id": company_id,
                "kind": "welcome_email",
                "message_text": draft,
                "status": "pending_review",
            }
        ).execute()

        ctx.db.table("crm_companies").update(
            {"welcome_sent_at": ctx.now.isoformat()}
        ).eq("id", company_id).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Welcome email drafted for {company_name}.",
            actions_taken=[f"Welcome email drafted for: {company_name}"],
            artifact={"company_name": company_name},
        )

    def _generate_welcome_email(self, company_name: str) -> str:
        """Generate a welcome email using deterministic logic."""
        return f"""Welcome to our platform, {company_name}!

We're excited to have you on board. Here's what you need to know to get started:

1. Complete your profile setup
2. Invite your team members
3. Explore our documentation
4. Schedule your onboarding call

If you have any questions, our support team is here to help. We look forward to a successful partnership!

Best regards,
The Team"""
