"""
Auto-approve short leave (HR)

Automatically approves leave requests under 3 days with sufficient notice.

Assumes a `leave_requests` table with columns:
  id, business_id, staff_id, start_date, end_date, status, approved_at
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
class LeaveRequestAutoApproval(BaseAutomation):
    key = "leave-request-approval"
    name = "Auto-approve short leave"
    department = Department.HR
    trigger_type = TriggerType.EVENT
    llm_powered = False
    listens_to_table = "leave_requests"
    listens_to_event = "INSERT"

    async def should_trigger(self, ctx: AutomationContext) -> bool:
        record = ctx.payload.get("record", {})
        start_date = record.get("start_date")
        end_date = record.get("end_date")
        
        if not start_date or not end_date:
            return False
        
        # Calculate duration
        start = ctx.now.fromisoformat(start_date).date()
        end = ctx.now.fromisoformat(end_date).date()
        duration = (end - start).days + 1
        
        # Check if duration is ≤3 days
        if duration > 3:
            return False
        
        # Check if there's sufficient notice (7+ days)
        notice_days = (start - ctx.now.date()).days
        if notice_days < 7:
            return False
        
        return True

    async def run(self, ctx: AutomationContext) -> AutomationResult:
        request_id = ctx.payload.get("record", {}).get("id")
        staff_id = ctx.payload.get("record", {}).get("staff_id")
        start_date = ctx.payload.get("record", {}).get("start_date")
        end_date = ctx.payload.get("record", {}).get("end_date")
        
        if not request_id:
            return AutomationResult(
                automation_key=self.key,
                triggered=False,
                summary="No request ID found in payload.",
            )

        # Auto-approve the request
        ctx.db.table("leave_requests").update(
            {"status": "approved", "approved_at": ctx.now.isoformat()}
        ).eq("id", request_id).execute()

        # Get staff name for notification
        staff = (
            ctx.db.table("staff")
            .select("name")
            .eq("id", staff_id)
            .execute()
        )

        staff_name = staff.data[0]["name"] if staff.data else "Staff member"

        return AutomationResult(
            automation_key=self.key,
            triggered=True,
            summary=f"Auto-approved leave request for {staff_name}.",
            actions_taken=[f"Leave request auto-approved for {staff_name} ({start_date} to {end_date})"],
            artifact={"staff_name": staff_name, "dates": f"{start_date} to {end_date}"},
        )
