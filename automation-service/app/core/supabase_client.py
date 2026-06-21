
"""
Supabase client for the automation service.

CRITICAL: this uses the service-role key, which bypasses Row Level
Security entirely. That's intentional and necessary  automations need
to read/write across the whole org (e.g. the weekly briefing touches
CRM, Finance, and Projects tables for every user). But it means:

  1. This key must NEVER be sent to the frontend or committed to git.
  2. Every query MUST explicitly filter by business_id  there's no RLS
     safety net here, the automation code IS the safety net.

Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in this service's env
(not the same as the anon key your React app uses).
"""

from __future__ import annotations

import os

from supabase import Client, create_client

_client_singleton: Client | None = None
DEV_MODE = os.environ.get("DEV_MODE", "false").lower() == "true"


def get_db() -> Client:
    global _client_singleton
    if _client_singleton is not None:
        return _client_singleton

    # Development mode: use mock credentials
    if DEV_MODE:
        url = os.environ.get("SUPABASE_URL", "https://dev.supabase.co")
        service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "dev-service-role-key")
        _client_singleton = create_client(url, service_role_key)
        return _client_singleton

    url = os.environ["SUPABASE_URL"]
    service_role_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    _client_singleton = create_client(url, service_role_key)
    return _client_singleton
