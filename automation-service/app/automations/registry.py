
"""
Registry: the single source of truth for "what automations exist."

New automations register themselves with @register_automation and the
engine, the API, and the frontend's settings list all read from this
one place. You never edit a master list by hand when adding #21.
"""

from __future__ import annotations

from app.automations.base import BaseAutomation, TriggerType

_REGISTRY: dict[str, type[BaseAutomation]] = {}


def register_automation(cls: type[BaseAutomation]) -> type[BaseAutomation]:
    """Class decorator. Put @register_automation above every automation class."""
    if cls.key in _REGISTRY:
        raise ValueError(f"Duplicate automation key: {cls.key!r}")
    _REGISTRY[cls.key] = cls
    return cls


def all_automations() -> list[type[BaseAutomation]]:
    return list(_REGISTRY.values())


def get_automation(key: str) -> type[BaseAutomation]:
    if key not in _REGISTRY:
        raise KeyError(f"No automation registered with key {key!r}")
    return _REGISTRY[key]


def automations_by_trigger(trigger_type: TriggerType) -> list[type[BaseAutomation]]:
    return [cls for cls in _REGISTRY.values() if cls.trigger_type == trigger_type]


def automations_for_table(table_name: str) -> list[type[BaseAutomation]]:
    """Used by the webhook route to find which automations care about a table."""
    return [
        cls
        for cls in _REGISTRY.values()
        if cls.trigger_type == TriggerType.EVENT and cls.listens_to_table == table_name
    ]
