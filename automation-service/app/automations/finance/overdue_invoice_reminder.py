"""
Overdue invoice reminder (Finance)

Drafts a polite payment reminder for clients when an invoice passes its
due date using deterministic Python logic.

Assumes `invoices` table as per your schema:
  id, business_id, client_id, client_name, amount,
  due_date, status ('Paid'|'Pending'|'Draft'|'Overdue'), reminder_drafted_at
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
class OverdueInvoiceReminder(BaseAutomation):
    key = "invoice-followup"
    name = "Chase overdue invoices"
    department = Department.FINANCE
    trigger_type = TriggerType.POLL
    llm_powered = False
    poll_interval_seconds = 60 * 60 * 6  # every 6 hours; invoices don't need minute-level checks

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        resp = (
            ctx.db.table("invoices")
            .select("id", count="exact")
            .eq("business_id", ctx.business_id)
            .lt("due_date", ctx.now.date().isoformat())
            .neq("status", "Paid")
            .is_("reminder_drafted_at", "null")
            .limit(1)
            .execute()
        )
        return (resp.count or 0) > 0

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        overdue = (
            ctx.db.table("invoices")
            .select("id, client_name, amount, due_date")
            .eq("business_id", ctx.business_id)
            .lt("due_date", ctx.now.date().isoformat())
            .neq("status", "Paid")
            .is_("reminder_drafted_at", "null")
            .execute()
        )

        if not overdue.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary="No newly overdue invoices.",
            )

        drafted: list[str] = []
        for invoice in overdue.data:
            draft = self._generate_reminder(invoice)

            ctx.db.table("invoice_drafts").insert(
                {
                    "business_id": ctx.business_id,
                    "invoice_id": invoice["id"],
                    "kind": "payment_reminder",
                    "draft_text": draft,
                    "status": "pending_review",
                }
            ).execute()

            ctx.db.table("invoices").update(
                {"reminder_drafted_at": ctx.now.isoformat(), "status": "Overdue"}
            ).eq("id", invoice["id"]).execute()

            drafted.append(invoice["client_name"])

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Drafted {len(drafted)} overdue payment reminder(s).",
            actions_taken=[f"Reminder drafted for: {name}" for name in drafted],
            artifact={"client_names": drafted},
        )

    def _generate_reminder(self, invoice: dict) -> str:
        """Generate a payment reminder using deterministic logic."""
        return f"""Dear {invoice['client_name']},

This is a friendly reminder that invoice #{invoice['id']} for ${invoice['amount']} is now overdue.

The original due date was {invoice['due_date']}. Please arrange payment at your earliest convenience.

If you have any questions or need to discuss payment terms, please don't hesitate to contact us.

Thank you for your business.

Best regards"""
