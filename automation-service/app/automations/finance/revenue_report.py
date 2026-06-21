"""
Monthly revenue report (Finance)

Generates a detailed revenue breakdown by client and service on the 1st of each month.

Assumes an `invoices` table with columns:
  id, business_id, client_name, amount, status, created_at
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
class MonthlyRevenueReport(BaseAutomation):
    key = "revenue-report"
    name = "Monthly revenue report"
    department = Department.FINANCE
    trigger_type = TriggerType.SCHEDULE
    llm_powered = False
    cron_expression = "0 9 1 * *"  # 1st of every month at 9 AM

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Always generate report on schedule
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        # Get previous month's date range
        first_day = ctx.now.replace(day=1)
        last_month = first_day - timedelta(days=1)
        month_start = last_month.replace(day=1).date().isoformat()
        month_end = last_month.date().isoformat()

        # Get paid invoices from previous month
        invoices = (
            ctx.db.table("invoices")
            .select("id, client_name, amount, created_at")
            .eq("business_id", ctx.business_id)
            .eq("status", "Paid")
            .gte("created_at", month_start)
            .lte("created_at", month_end)
            .execute()
        )

        if not invoices.data:
            return AutomationResult(
                automation_key=self.key,
                triggered=True,
                summary=f"No paid invoices for {last_month.strftime('%B %Y')}.",
            )

        # Calculate revenue by client
        revenue_by_client: dict[str, float] = {}
        total_revenue = 0
        for invoice in invoices.data:
            client = invoice["client_name"]
            amount = float(invoice.get("amount", 0))
            revenue_by_client[client] = revenue_by_client.get(client, 0) + amount
            total_revenue += amount

        # Generate summary using template-based logic
        report_summary = self._generate_summary(ctx, revenue_by_client, total_revenue, last_month)

        ctx.db.table("revenue_reports").insert(
            {
                "business_id": ctx.business_id,
                "month": month_start,
                "total_revenue": total_revenue,
                "revenue_by_client": revenue_by_client,
                "summary": report_summary,
                "status": "completed",
            }
        ).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Generated revenue report for {last_month.strftime('%B %Y')}: ${total_revenue:,.2f}",
            actions_taken=[f"Revenue report generated for {last_month.strftime('%B %Y')}"],
            artifact={
                "total_revenue": total_revenue,
                "revenue_by_client": revenue_by_client,
                "month": month_start,
            },
        )

    def _generate_summary(
        self, ctx: AutomationContext, revenue_by_client: dict[str, float], total_revenue: float, month
    ) -> str:
        """Generate executive summary using template-based logic instead of AI."""
        # Sort clients by revenue
        sorted_clients = sorted(revenue_by_client.items(), key=lambda x: x[1], reverse=True)
        top_clients = sorted_clients[:5]
        
        # Calculate percentage breakdown
        client_percentages = []
        for client, revenue in top_clients:
            percentage = (revenue / total_revenue) * 100 if total_revenue > 0 else 0
            client_percentages.append(f"{client}: {percentage:.1f}%")
        
        # Build template summary
        summary_parts = []
        summary_parts.append(f"Revenue Executive Summary - {month.strftime('%B %Y')}")
        summary_parts.append(f"Total Revenue: ${total_revenue:,.2f}")
        summary_parts.append(f"Total Clients: {len(revenue_by_client)}")
        
        if top_clients:
            summary_parts.append("\nTop Revenue Sources:")
            for client, revenue in top_clients:
                percentage = (revenue / total_revenue) * 100 if total_revenue > 0 else 0
                summary_parts.append(f"  • {client}: ${revenue:,.2f} ({percentage:.1f}%)")
        
        # Add insights based on data patterns
        if len(revenue_by_client) > 1:
            max_client, max_revenue = top_clients[0]
            concentration = (max_revenue / total_revenue) * 100 if total_revenue > 0 else 0
            if concentration > 50:
                summary_parts.append(f"\nNote: {max_client} accounts for {concentration:.1f}% of total revenue.")
        
        summary_parts.append("\nRecommendations:")
        summary_parts.append("- Continue engagement with top-performing clients")
        summary_parts.append("- Review opportunities with mid-tier clients for growth")
        summary_parts.append("- Analyze any significant revenue changes from previous periods")
        
        return "\n".join(summary_parts)
