"""
Contract renewal alerts (Finance)

Notifies team to initiate renewal process 30 days before contract expiry.

Assumes a `contracts` table with columns:
  id, business_id, name, expiry_date, renewal_notified_at
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
class ContractRenewalAlerts(BaseAutomation):
    key = "contract-expiry"
    name = "Contract renewal alerts"
    department = Department.FINANCE
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 9 * * *"  # Daily at 9 AM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        notification_threshold = (ctx.now + timedelta(days=30)).date().isoformat()
        resp = (
            ctx.db.table("contracts")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .eq("expiry_date", notification_threshold)
            .is_("renewal_notified_at", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        notification_threshold = (ctx.now + timedelta(days=30)).date().isoformat()
        
        expiring_contracts = (
            ctx.db.table("contracts")
            .select("id, name, expiry_date")
            .eq("business_id", ctx.business_id)
            .eq("expiry_date", notification_threshold)
            .is_("renewal_notified_at", "null")
            .execute()
        )

        if not expiring_contracts.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No contracts expiring in 30 days.",
            )

        notified: list[str] = []
        for contract in expiring_contracts.data:
            ctx.db.table("contract_notifications").insert(
                {
                    "business_id": ctx.business_id,
                    "contract_id": contract["id"],
                    "kind": "renewal_reminder",
                    "message": f"Contract '{contract['name']}' expires on {contract['expiry_date']}",
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("contracts").update(
                {"renewal_notified_at": ctx.now.isoformat()}
            ).eq("id", contract["id"]).execute()

            notified.append(contract["name"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Sent {len(notified)} contract renewal alert(s).",
            actions_taken=[f"Renewal alert sent for: {name}" for name in notified],
            artifact={"contract_names": notified},
        )
