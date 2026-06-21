"""
Base contract for all Cynda automations.

Every automation  CRM, Finance, Projects, HR, or cross-department 
implements this interface. The engine (engine.py) doesn't know or care
what an automation *does*; it only knows how to ask "should you run?"
and tell it "run." That seam is what lets the platform grow from 6
automations to 60 without ever touching orchestration code.

Data access: automations receive a Supabase client already authenticated
with the service-role key (full read/write, bypasses RLS  this service
is trusted backend code, never exposed to the browser).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from supabase import Client


class TriggerType(str, Enum):
    """How an automation gets woken up."""

    EVENT = "event"        # fired by a Supabase Database Webhook (row insert/update)
    POLL = "poll"            # checked on an interval (e.g. every 15 min)
    SCHEDULE = "schedule"    # fired on a cron expression (e.g. weekly Monday 8am)


class Department(str, Enum):
    CRM = "crm"
    FINANCE = "finance"
    PROJECTS = "projects"
    HR = "hr"
    CROSS = "cross_department"


@dataclass
class AutomationContext:
    """
    Everything an automation needs to evaluate and run.

    `payload` holds the webhook row data for EVENT-type automations;
    it's empty for POLL/SCHEDULE, which pull their own data via `db`.
    """

    business_id: str
    db: Client
    payload: dict[str, Any] = field(default_factory=dict)
    llm: Any = None
    now: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class AutomationResult:
    """Standardized output so the engine can log/audit/notify uniformly."""

    automation_key: str
    triggered: bool
    summary: str
    actions_taken: list[str] = field(default_factory=list)
    artifact: Optional[dict[str, Any]] = None  # e.g. drafted email text, suggested name
    error: Optional[str] = None


class BaseAutomation(ABC):
    """
    Subclass this for every new automation.

    Required class attrs:
      key            - unique snake_case id, e.g. "stale_deal_followup"
      name           - human label shown in the UI automations list
      department     - which department tab it lives under
      trigger_type   - EVENT, POLL, or SCHEDULE
      llm_powered    - whether run() calls an LLM (shown as a badge in UI)

    EVENT automations additionally set `listens_to_table` + optionally
    `listens_to_event` ("INSERT"/"UPDATE"/"DELETE").
    POLL automations set `poll_interval_seconds`.
    SCHEDULE automations set `cron_expression`.
    """

    key: str
    name: str
    department: Department
    trigger_type: TriggerType
    llm_powered: bool = False

    listens_to_table: Optional[str] = None
    listens_to_event: Optional[str] = None
    poll_interval_seconds: Optional[int] = None
    cron_expression: Optional[str] = None

    @abstractmethod
    async def should_trigger(self, ctx: AutomationContext) -> bool:
        """Cheap check, no side effects. Decides whether run() is worth calling."""
        raise NotImplementedError

    @abstractmethod
    async def run(self, ctx: AutomationContext) -> AutomationResult:
        """Does the actual work. Only called if should_trigger() returned True."""
        raise NotImplementedError

    def describe(self) -> dict[str, Any]:
        """Metadata surfaced to the frontend's Automations settings panel."""
        return {
            "key": self.key,
            "name": self.name,
            "department": self.department.value,
            "trigger_type": self.trigger_type.value,
            "llm_powered": self.llm_powered,
        }
