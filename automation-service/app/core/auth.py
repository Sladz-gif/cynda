"""
Verifies the Supabase Auth JWT sent by the React frontend on every
request to this service, and extracts business_id from it.

This assumes your `staff`/`profiles` table (or wherever business membership
lives) is queryable by the Supabase auth user id, OR that business_id is
already embedded as a custom claim on the JWT (set via a Supabase Auth
Hook). Adjust `_resolve_business_id` to match however your existing app
already does this  it almost certainly already has this logic
somewhere in the Supabase-backed frontend.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import jwt
from fastapi import Header, HTTPException

from app.core.supabase_client import get_db

# Handle missing environment variables for development mode
DEV_MODE = os.environ.get("DEV_MODE", "false").lower() == "true"
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "dev-secret")


@dataclass
class AuthedUser:
    user_id: str
    business_id: str
    email: str | None = None


async def require_auth(authorization: str | None = Header(default=None)) -> AuthedUser:
    # Development mode: return mock user without authentication
    if DEV_MODE:
        return AuthedUser(
            user_id="dev-user-id",
            business_id="dev-business-id",
            email="dev@example.com"
        )

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(401, f"Invalid token: {exc}")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Token missing subject")

    business_id = payload.get("business_id")  # if set via custom claim/Auth Hook
    if not business_id:
        business_id = await _resolve_business_id(user_id)

    if not business_id:
        raise HTTPException(403, "User has no associated business")

    return AuthedUser(user_id=user_id, business_id=business_id, email=payload.get("email"))


async def _resolve_business_id(user_id: str) -> str | None:
    """
    Fallback lookup if business_id isn't already on the JWT as a custom
    claim. Adjust table/column names to match your existing schema 
    this is the one place that almost certainly needs a one-line edit
    to match what you already built.
    """
    db = get_db()
    resp = (
        db.table("profiles")
        .select("business_id")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if resp.data:
        return resp.data[0]["business_id"]
    return None
