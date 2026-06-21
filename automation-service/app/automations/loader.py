
"""
Loader: importing this module has the side effect of populating the
registry, because every automation file's @register_automation
decorator runs on import.

Call load_all() once at app startup (see main.py) before anything
calls registry.all_automations() or registry.automations_for_table().

To add a new automation: write the file, then add one import line here.
Nothing else needs to change.
"""

from __future__ import annotations


def load_all() -> None:
    # CRM
    from app.automations.crm import (  # noqa: F401
        stale_deal_followup,
        contact_birthday,
        lead_scoring,
        welcome_email,
        lead_qualification,
        contact_cleanup,
    )

    # Finance
    from app.automations.finance import (  # noqa: F401
        budget_threshold_alert,
        overdue_invoice_reminder,
        expense_categorization,
        contract_expiry,
        revenue_report,
        invoice_generation,
        payment_reconciliation,
        budget_tracking,
    )

    # Projects
    from app.automations.projects import (  # noqa: F401
        won_deal_kickoff,
        task_reminder,
        task_assignment,
        project_health_check,
        task_auto_assignment,
        deadline_reminder,
        status_update,
    )

    # HR
    from app.automations.hr import (  # noqa: F401
        new_hire_checklist,
        leave_approval,
        payroll_preparation,
        performance_review_reminder,
        training_reminder,
    )

    # Cross-department
    from app.automations.cross import weekly_briefing  # noqa: F401
