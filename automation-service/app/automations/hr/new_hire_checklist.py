"""
New hire checklist (HR)

Sends onboarding tasks to HR and the hiring manager when a new staff
record is added. No LLM needed  this is a fixed checklist creation,
deterministic by design so onboarding is consistent for every hire.

Trigger: Supabase Database Webhook on INSERT to `staff`.
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

DEFAULT_ONBOARDING_TASKS = [
    "Send welcome email and first-day logistics",
    "Set up workstation / equipment request",
    "Create accounts (email, Slack/Chat, core tools)",
    "Schedule 1:1 with hiring manager (week 1)",
    "Assign onboarding buddy",
    "Add to payroll and benefits enrollment",
    "Share employee handbook and policies",
    "Schedule 30-day check-in",
]


@register_automation
class NewHireChecklist(BaseAutomation):
    key = "hr-onboarding-reminder"
    name = "New hire onboarding workflow"
    department = Department.HR
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "staff"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        record = ctx.payload.get("record", {})
        return bool(record.get("id"))

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        staff = ctx.payload.get("record", {})
        staff_id = staff.get("id")
        hiring_manager_id = staff.get("hiring_manager_id")

        task_rows = [
            {
                "business_id": ctx.business_id,
                "title": task,
                "category": "onboarding",
                "status": "todo",
            }
            for task in DEFAULT_ONBOARDING_TASKS
        ]
        ctx.db.table("tasks").insert(task_rows).execute()

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Created {len(DEFAULT_ONBOARDING_TASKS)} onboarding tasks for new hire.",
            actions_taken=[f"Task created: {t}" for t in DEFAULT_ONBOARDING_TASKS],
        )
