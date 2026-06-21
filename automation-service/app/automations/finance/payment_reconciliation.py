"""
Payment reconciliation (Finance)

Automatically matches payments to invoices and updates invoice status.
This eliminates manual payment reconciliation work that needs to be done repeatedly.

Assumes tables:
  - payments: id, business_id, amount, payment_date, reference, reconciled, invoice_id
  - invoices: id, business_id, client_id, amount, status, due_date
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
class PaymentReconciliation(BaseAutomation):
    key = "payment-reconciliation"
    name = "Automatic payment reconciliation"
    department = Department.FINANCE
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "payments"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Always reconcile new payments
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        payment = ctx.payload.get("record", {})
        payment_id = payment.get("id")
        payment_amount = payment.get("amount", 0)
        payment_reference = payment.get("reference", "")
        
        if not payment_id:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No payment ID found.",
            )

        # Find matching invoice by amount and reference
        invoices = (
            ctx.db.table("invoices")
            .select("id, amount, status")
            .eq("business_id", ctx.business_id)
            .eq("amount", payment_amount)
            .neq("status", "Paid")
            .execute()
        )

        matched_invoice = None
        if invoices.data:
            # Try to match by reference if available
            if payment_reference:
                for invoice in invoices.data:
                    if payment_reference in str(invoice.get("id", "")):
                        matched_invoice = invoice
                        break
            
            # If no reference match, use first matching amount
            if not matched_invoice:
                matched_invoice = invoices.data[0]

        if matched_invoice:
            # Update invoice status to Paid
            ctx.db.table("invoices").update({
                "status": "Paid"
            }).eq("id", matched_invoice["id"]).execute()
            
            # Mark payment as reconciled
            ctx.db.table("payments").update({
                "reconciled": ctx.now.isoformat(),
                "invoice_id": matched_invoice["id"]
            }).eq("id", payment_id).execute()

            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary=f"Reconciled payment of ${payment_amount} to invoice.",
                actions_taken=[f"Payment reconciled to invoice: {matched_invoice['id']}"],
                artifact={"invoice_id": matched_invoice["id"], "amount": payment_amount},
            )
        else:
            # Mark payment as unreconciled
            ctx.db.table("payments").update({
                "reconciled": ctx.now.isoformat()
            }).eq("id", payment_id).execute()

            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary=f"Payment of ${payment_amount} could not be matched to any invoice.",
                actions_taken=["Payment marked as unreconciled"],
                artifact={"amount": payment_amount},
            )
