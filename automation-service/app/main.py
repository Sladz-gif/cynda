
"""
Cynda Automation Service entrypoint.

Responsibilities on startup:
  1. Import every automation module so the registry is populated.
  2. Start the APScheduler instance with poll jobs + cron jobs registered.
  3. Mount the webhook + management API routes.

Run locally with:  uvicorn app.main:app --reload --port 8000
Deploy with:        any host that runs a long-lived process (Railway,
                     Render, Fly.io, a small VM). NOT Vercel  this
                     service needs a persistent process for the
                     in-memory scheduler to keep ticking, which
                     serverless functions can't guarantee.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.automations.loader import load_all
from app.core.poller import register_poll_jobs
from app.core.scheduler import register_scheduled_jobs
from app.routes import automations, file_processing, webhooks

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cynda.main")

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all()
    logger.info("Automations loaded.")

    register_poll_jobs(scheduler)
    register_scheduled_jobs(scheduler)
    scheduler.start()
    logger.info("Scheduler started.")

    yield

    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped.")


app = FastAPI(title="Cynda Automation Service", lifespan=lifespan)

# Configure CORS based on environment
# In production, set ALLOWED_ORIGINS env var to your frontend domain(s)
# In development, allows localhost for local testing
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)
app.include_router(automations.router)
app.include_router(file_processing.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
