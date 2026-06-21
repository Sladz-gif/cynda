"""
Contact data cleanup (CRM)

Automatically cleans up and standardizes contact data.
This eliminates manual data cleanup that needs to be done repeatedly.

Assumes a `crm_contacts` table with columns:
  id, business_id, name, email, phone, company, last_cleaned_at
"""

from __future__ import annotations

import re

from app.automations.base import (
    AutomationContext,
    AutomationResult,
    BaseAutomation,
    Department,
    TriggerType,
)
from app.automations.registry import register_automation


@register_automation
class ContactDataCleanup(BaseAutomation):
    key = "contact-cleanup"
    name = "Contact data cleanup"
    department = Department.CRM
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 24  # Daily

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for contacts that haven't been cleaned in 7 days
        seven_days_ago = (ctx.now - timedelta(days=7)).isoformat()
        resp = (
            ctx.db.table("crm_contacts")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .or_("last_cleaned_at.is.null", f"last_cleaned_at.lt.{seven_days_ago}")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get contacts that need cleaning
        contacts = (
            ctx.db.table("crm_contacts")
            .select("id, name, email, phone, company")
            .eq("business_id", ctx.business_id)
            .execute()
        )

        if not contacts.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No contacts to clean.",
            )

        cleaned_count = 0
        for contact in contacts.data:
            updates = {}
            
            # Clean name (capitalize properly)
            if contact.get("name"):
                updates["name"] = self._clean_name(contact["name"])
            
            # Clean email (lowercase and trim)
            if contact.get("email"):
                updates["email"] = contact["email"].lower().strip()
            
            # Clean phone (format consistently)
            if contact.get("phone"):
                updates["phone"] = self._clean_phone(contact["phone"])
            
            # Clean company (capitalize properly)
            if contact.get("company"):
                updates["company"] = self._clean_company(contact["company"])
            
            if updates:
                updates["last_cleaned_at"] = ctx.now.isoformat()
                ctx.db.table("crm_contacts").update(updates).eq("id", contact["id"]).execute()
                cleaned_count += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Cleaned {cleaned_count} contact records.",
            actions_taken=[f"Cleaned contact: {contact['name']}" for contact in contacts.data],
            artifact={"cleaned_count": cleaned_count},
        )

    def _clean_name(self, name: str) -> str:
        """Clean and capitalize name properly."""
        return " ".join(word.capitalize() for word in name.strip().split())

    def _clean_phone(self, phone: str) -> str:
        """Clean and format phone number."""
        # Remove all non-numeric characters
        digits = re.sub(r"[^\d]", "", phone)
        # Format as (XXX) XXX-XXXX if 10 digits
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        return phone.strip()

    def _clean_company(self, company: str) -> str:
        """Clean and capitalize company name."""
        return " ".join(word.capitalize() for word in company.strip().split())
