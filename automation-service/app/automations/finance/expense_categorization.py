"""
Smart expense categorization (Finance)

Auto-categorizes expenses using deterministic Python logic based on keywords.

Assumes an `expenses` table with columns:
  id, business_id, description, amount, category, categorized_at
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
class ExpenseCategorization(BaseAutomation):
    key = "expense-categorization"
    name = "Smart expense categorization"
    department = Department.FINANCE
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "expenses"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        # Only categorize if category is missing
        record = ctx.payload.get("record", {})
        return not record.get("category")

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        expense_id = ctx.payload.get("record", {}).get("id")
        description = ctx.payload.get("record", {}).get("description", "")
        amount = ctx.payload.get("record", {}).get("amount", 0)
        
        if not expense_id or not description:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="Missing expense ID or description.",
            )

        category = self._categorize_expense(description, amount)

        ctx.db.table("expenses").update(
            {"category": category, "categorized_at": ctx.now.isoformat()}
        ).eq("id", expense_id).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Categorized expense as '{category}'.",
            actions_taken=[f"Expense categorized as: {category}"],
            artifact={"category": category},
        )

    def _categorize_expense(self, description: str, amount: float) -> str:
        """Categorize expense using keyword-based deterministic logic."""
        description_lower = description.lower()
        
        # Keyword-based categorization
        keyword_mapping = {
            "office supplies": ["office", "supplies", "paper", "pens", "stationery", "printer"],
            "travel": ["travel", "flight", "airline", "hotel", "rental car", "taxi", "uber", "lyft", "transport"],
            "meals": ["meal", "food", "restaurant", "lunch", "dinner", "breakfast", "coffee", "cafe"],
            "software": ["software", "subscription", "saas", "app", "license", "cloud", "hosting"],
            "marketing": ["marketing", "advertising", "ads", "promotion", "campaign", "social media"],
            "utilities": ["utility", "electric", "water", "gas", "internet", "phone", "electricity"],
            "rent": ["rent", "lease", "office space", "workspace"],
            "insurance": ["insurance", "liability", "coverage"],
            "salaries": ["salary", "payroll", "wage", "compensation", "bonus"],
            "professional services": ["consultant", "legal", "accounting", "professional", "services"],
            "equipment": ["equipment", "hardware", "computer", "laptop", "furniture", "machinery"],
        }
        
        for category, keywords in keyword_mapping.items():
            if any(keyword in description_lower for keyword in keywords):
                return category
        
        # Default category based on amount or description
        if amount > 1000:
            return "Equipment"
        elif "service" in description_lower:
            return "Professional Services"
        else:
            return "Other"
