import { StateCreator } from 'zustand';

export type AutomationDepartment = "CRM" | "Finance" | "Projects" | "HR" | "Cross-Department";

export interface AutomationTemplate {
  id: string;
  name: string;
  department: AutomationDepartment;
  triggerDescription: string;
  actionDescription: string;
  isGeminiPowered: boolean;
  triggerType: string;
}

export interface ActiveAutomation {
  id: string;
  templateId: string;
  name: string;
  status: "active" | "paused";
  runCount: number;
  lastTriggered?: string;
  triggeredRecord?: string;
  config: Record<string, unknown>;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  automationName: string;
  triggerEvent: string;
  affectedRecord: string;
  outcome: "Success" | "Failed" | "Skipped";
  geminiCall: boolean;
  errorReason?: string;
  promptContext?: unknown;
  responseReceived?: string;
}

export interface AutomationSlice {
  automationLibrary: AutomationTemplate[];
  activeAutomations: ActiveAutomation[];
  automationLogs: AutomationLog[];
  cyndiOpen: boolean;
  cyndiDraft: string;
  setCyndiOpen: (open: boolean) => void;
  setCyndiDraft: (draft: string) => void;
  activateAutomation: (templateId: string, config: Record<string, unknown>) => void;
  deactivateAutomation: (automationId: string) => void;
  toggleAutomationStatus: (automationId: string) => void;
  deleteAutomation: (automationId: string) => void;
  updateAutomationConfig: (automationId: string, config: Record<string, unknown>) => void;
  addAutomationLog: (log: Omit<AutomationLog, "id"> & { id?: string }) => void;
}

const defaultAutomationLibrary: AutomationTemplate[] = [
  {
    id: "follow-up-reminder",
    name: "Stale deal follow-up",
    department: "CRM",
    triggerDescription: "A deal has had no activity for a set number of days.",
    actionDescription: "Cyndi drafts a follow-up nudge with context from the pipeline.",
    isGeminiPowered: true,
    triggerType: "deal_stage_changed",
  },
  {
    id: "deal-won-project",
    name: "Won deal → project kickoff",
    department: "Projects",
    triggerDescription: "A deal moves to Closed Won.",
    actionDescription: "Suggest a project name and kickoff summary for the delivery team.",
    isGeminiPowered: true,
    triggerType: "deal_stage_changed",
  },
  {
    id: "budget-overspend",
    name: "Budget threshold alert",
    department: "Finance",
    triggerDescription: "Spending approaches or exceeds a configured budget.",
    actionDescription: "Notify finance owners and log the event for audit.",
    isGeminiPowered: false,
    triggerType: "expense_logged",
  },
  {
    id: "weekly-briefing",
    name: "Weekly Monday briefing",
    department: "Cross-Department",
    triggerDescription: "Scheduled every Monday morning.",
    actionDescription: "Cyndi summarizes tasks, pipeline, and invoices for leadership.",
    isGeminiPowered: true,
    triggerType: "weekly_briefing_trigger",
  },
  {
    id: "hr-onboarding-reminder",
    name: "New hire checklist",
    department: "HR",
    triggerDescription: "A new staff record is added to the directory.",
    actionDescription: "Send onboarding tasks to HR and the hiring manager.",
    isGeminiPowered: false,
    triggerType: "staff_added",
  },
  {
    id: "invoice-followup",
    name: "Overdue invoice reminder",
    department: "Finance",
    triggerDescription: "An invoice passes its due date unpaid.",
    actionDescription: "Draft a polite payment reminder for the client contact.",
    isGeminiPowered: true,
    triggerType: "invoice_overdue",
  },
];

export const createAutomationSlice: StateCreator<AutomationSlice> = (set) => ({
  automationLibrary: defaultAutomationLibrary,
  activeAutomations: [],
  automationLogs: [],
  cyndiOpen: false,
  cyndiDraft: "",
  setCyndiOpen: (open) => set({ cyndiOpen: open }),
  setCyndiDraft: (draft) => set({ cyndiDraft: draft }),
  activateAutomation: (templateId, config) =>
    set((state) => {
      const template = state.automationLibrary.find((t) => t.id === templateId);
      if (!template) return state;
      const newAutomation: ActiveAutomation = {
        id: `auto-${Date.now()}`,
        templateId,
        name: template.name,
        status: "active",
        runCount: 0,
        config,
      };
      return { activeAutomations: [...state.activeAutomations, newAutomation] };
    }),
  deactivateAutomation: (automationId) =>
    set((state) => ({
      activeAutomations: state.activeAutomations.filter((a) => a.id !== automationId),
    })),
  toggleAutomationStatus: (automationId) =>
    set((state) => ({
      activeAutomations: state.activeAutomations.map((a) =>
        a.id === automationId ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
      ),
    })),
  deleteAutomation: (automationId) =>
    set((state) => ({
      activeAutomations: state.activeAutomations.filter((a) => a.id !== automationId),
    })),
  updateAutomationConfig: (automationId, config) =>
    set((state) => ({
      activeAutomations: state.activeAutomations.map((a) =>
        a.id === automationId ? { ...a, config: { ...a.config, ...config } } : a
      ),
    })),
  addAutomationLog: (log) =>
    set((state) => ({
      automationLogs: [
        { ...log, id: log.id || `log-${Date.now()}` } as AutomationLog,
        ...state.automationLogs,
      ],
    })),
});
