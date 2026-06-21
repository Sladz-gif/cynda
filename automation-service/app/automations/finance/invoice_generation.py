"""
Automatic invoice generation (Finance)

Generates invoices automatically based on completed work or milestones.
This eliminates manual invoice creation work that needs to be done repeatedly.

Assumes tables:
  - completed_work: id, business_id, project_id, client_id, amount, description, completed_at, invoiced
  - invoices: id, business_id, client_id, amount, description, status, due_date, created_at
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
class AutomaticInvoiceGeneration(BaseAutomation):
    key = "auto-invoice-generation"
    name = "Automatic invoice generation"
    department = Department.FINANCE
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 4  # Every 4 hours

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Check for completed work that hasn't been invoiced
        resp = (
            ctx.db.table("completed_work")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .is_("invoiced", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get completed work that hasn't been invoiced
        completed_work = (
            ctx.db.table("completed_work")
            .select("id, project_id, client_id, amount, description, completed_at")
            .eq("business_id", ctx.business_id)
            .is_("invoiced", "null")
            .execute()
        )

        if not completed_work.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No completed work to invoice.",
            )

        invoices_created = 0
        for work in completed_work.data:
            # Create invoice
            due_date = (ctx.now + timedelta(days=30)).date().isoformat()
            
            ctx.db.table("invoices").insert({
                "business_id": ctx.business_id,
                "client_id": work["client_id"],
                "amount": work["amount"],
                "description": f"Invoice for {work['description']}",
                "status": "Pending",
                "due_date": due_date
            }).execute()
            
            # Mark work as invoiced
            ctx.db.table("completed_work").update({
                "invoiced": ctx.now.isoformat()
            }).eq("id", work["id"]).execute()
            
            invoices_created += 1

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Generated {invoices_created} invoices automatically.",
            actions_taken=[f"Invoice created for work: {work['description']}" for work in completed_work.data],
            artifact={"invoices_created": invoices_created},
        )
