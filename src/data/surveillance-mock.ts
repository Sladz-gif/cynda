export type SurveillanceEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  module: string;
  action: string;
  target: string;
  severity: "info" | "warning" | "critical";
  detail: string;
  ip: string;
};

export const SURVEILLANCE_MOCK_EVENTS: SurveillanceEvent[] = [
  {
    id: "s1",
    timestamp: "2026-03-28T14:22:11Z",
    actor: "Jordan Blake",
    actorRole: "Director",
    module: "CRM",
    action: "Deal stage changed",
    target: "Enterprise License — Acme Corp",
    severity: "info",
    detail: "Stage moved from Proposal to Negotiation. Value $50,000.",
    ip: "203.0.113.42",
  },
  {
    id: "s2",
    timestamp: "2026-03-28T14:18:02Z",
    actor: "Priya Shah",
    actorRole: "Manager",
    module: "Finance",
    action: "Invoice approved",
    target: "INV-2026-03-8841",
    severity: "info",
    detail: "Approval chain completed. Amount $12,400.",
    ip: "198.51.100.8",
  },
  {
    id: "s3",
    timestamp: "2026-03-28T14:05:44Z",
    actor: "Marcus Webb",
    actorRole: "Employee",
    module: "HR",
    action: "Payroll export downloaded",
    target: "March 2026 payroll batch",
    severity: "warning",
    detail: "Sensitive export. Two-factor verified.",
    ip: "192.0.2.15",
  },
  {
    id: "s4",
    timestamp: "2026-03-28T13:51:30Z",
    actor: "System",
    actorRole: "Automation",
    module: "Automations",
    action: "Workflow triggered",
    target: "Lead nurture — Design vertical",
    severity: "info",
    detail: "Webhook fired successfully to connected CRM.",
    ip: "—",
  },
  {
    id: "s5",
    timestamp: "2026-03-28T13:40:12Z",
    actor: "Alex Rivera",
    actorRole: "Employee",
    module: "Files",
    action: "Bulk download",
    target: "Folder /Finance/Q1/*",
    severity: "warning",
    detail: "12 files · 240 MB · policy acknowledgement on file.",
    ip: "203.0.113.88",
  },
  {
    id: "s6",
    timestamp: "2026-03-28T12:15:00Z",
    actor: "Unknown API client",
    actorRole: "—",
    module: "Auth",
    action: "Failed login attempt",
    target: "admin@company.com",
    severity: "critical",
    detail: "5 failures in 10 minutes. IP temporarily rate-limited.",
    ip: "185.220.101.3",
  },
];
