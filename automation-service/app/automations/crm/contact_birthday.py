"""
Contact birthday greeting (CRM)

Sends a personalized birthday message when a contact's birthday is today
using deterministic Python logic.

Assumes a `crm_contacts` table with columns:
  id, business_id, name, email, birthday, birthday_sent_at
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
class ContactBirthdayGreeting(BaseAutomation):
    key = "contact-birthday"
    name = "Birthday greetings"
    department = Department.CRM
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 9 * * *"  # Daily at 9 AM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        today = ctx.now.date().isoformat()
        resp = (
            ctx.db.table("crm_contacts")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .eq("birthday", today)
            .is_("birthday_sent_at", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        today = ctx.now.date().isoformat()
        
        birthday_contacts = (
            ctx.db.table("crm_contacts")
            .select("id, name, email")
            .eq("business_id", ctx.business_id)
            .eq("birthday", today)
            .is_("birthday_sent_at", "null")
            .execute()
        )

        if not birthday_contacts.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No birthdays today.",
            )

        sent: list[str] = []
        for contact in birthday_contacts.data:
            draft = self._generate_birthday_message(contact["name"])

            ctx.db.table("contact_messages").insert(
                {
                    "business_id": ctx.business_id,
                    "contact_id": contact["id"],
                    "kind": "birthday_greeting",
                    "message_text": draft,
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("crm_contacts").update(
                {"birthday_sent_at": ctx.now.isoformat()}
            ).eq("id", contact["id"]).execute()

            sent.append(contact["name"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {len(sent)} birthday greeting(s).",
            actions_taken=[f"Birthday message sent to: {name}" for name in sent],
            artifact={"contact_names": sent},
        )

    def _generate_birthday_message(self, name: str) -> str:
        """Generate a birthday message using deterministic logic."""
        return f"Happy Birthday, {name}! 🎉 Wishing you a wonderful day and a fantastic year ahead from the entire team."
