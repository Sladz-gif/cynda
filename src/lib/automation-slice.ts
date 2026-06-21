import { StateCreator } from 'zustand';
import { TIMEZONES, getTimezoneLabel } from './timezones';

export type AutomationDepartment = "CRM" | "Finance" | "Projects" | "HR" | "Cross-Department";

export interface AutomationTemplate {
  id: string;
  name: string;
  department: AutomationDepartment;
  triggerDescription: string;
  actionDescription: string;
  isGeminiPowered: boolean;
  triggerType: string;
  configurableTiming: boolean;
  defaultTiming?: string;
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
    id: "welcome-email",
    name: "New client welcome sequence",
    department: "CRM",
    triggerDescription: "When a new company is added to CRM",
    actionDescription: "Send personalized welcome email with onboarding info",
    isGeminiPowered: true,
    triggerType: "company_added",
    configurableTiming: false,
  },
  {
    id: "contact-birthday",
    name: "Birthday greetings",
    department: "CRM",
    triggerDescription: "When a contact's birthday is today",
    actionDescription: "Send personalized birthday message",
    isGeminiPowered: false,
    triggerType: "contact_birthday",
    configurableTiming: false,
  },
  {
    id: "contact-cleanup",
    name: "Contact data cleanup",
    department: "CRM",
    triggerDescription: "Daily for contact records",
    actionDescription: "Automatically cleans and standardizes contact data",
    isGeminiPowered: false,
    triggerType: "poll",
    configurableTiming: false,
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
