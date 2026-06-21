
/**
 * Thin client for the Cynda Automation Service, used by the React
 * (Vercel) app. Drop this into your existing project, e.g. at
 * src/lib/automationApi.ts.
 *
 * Auth: reuses your existing Supabase session  no separate login.
 * The automation service verifies the same JWT Supabase already gave
 * the browser.
 */

import { supabase } from "./supabaseClient"; // your existing client init

const AUTOMATION_API_URL = import.meta.env.VITE_AUTOMATION_API_URL as string;
// e.g. "https://cynda-automations.up.railway.app"

async function authedFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${AUTOMATION_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Automation API error (${res.status}): ${body}`);
  }

  return res.json();
}

export interface AutomationMeta {
  key: string;
  name: string;
  department: string;
  trigger_type: "event" | "poll" | "schedule";
  llm_powered: boolean;
}

export interface AutomationRun {
  id: string;
  automation_key: string;
  triggered: boolean;
  summary: string;
  actions_taken: string[];
  artifact: Record<string, unknown> | null;
  error: string | null;
  duration_ms: number;
  created_at: string;
}

/** List all automations + metadata, for the Automations settings panel. */
export function listAutomations(): Promise<AutomationMeta[]> {
  return authedFetch("/automations");
}

/** Recent run history, for an Activity / Audit feed. Optionally filter by key. */
export function listAutomationRuns(opts?: {
  limit?: number;
  automationKey?: string;
}): Promise<AutomationRun[]> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.automationKey) params.set("automation_key", opts.automationKey);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return authedFetch(`/automations/runs${qs}`);
}

/** Manual "Run now" button handler. */
export function triggerAutomation(key: string) {
  return authedFetch(`/automations/${key}/run`, { method: "POST" });
}

/** Approve an LLM-drafted item (follow-up email, reminder, kickoff suggestion). */
export function approveDraft(
  draftTable: "deal_drafts" | "invoice_drafts" | "project_suggestions",
  draftId: string
) {
  return authedFetch(`/automations/drafts/${draftTable}/${draftId}/approve`, {
    method: "POST",
  });
}

export function rejectDraft(
  draftTable: "deal_drafts" | "invoice_drafts" | "project_suggestions",
  draftId: string
) {
  return authedFetch(`/automations/drafts/${draftTable}/${draftId}/reject`, {
    method: "POST",
  });
}
