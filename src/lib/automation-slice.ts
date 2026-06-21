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
    id: "follow-up-reminder",
    name: "Auto follow-up on stale deals",
    department: "CRM",
    triggerDescription: "When a deal has no activity for 7+ days",
    actionDescription: "Send a personalized follow-up email to re-engage the prospect",
    isGeminiPowered: false,
    triggerType: "deal_stage_changed",
    configurableTiming: false,
  },
  {
    id: "deal-won-project",
    name: "Create project from won deal",
    department: "Projects",
    triggerDescription: "When a deal moves to 'Closed Won'",
    actionDescription: "Auto-create a project with tasks based on deal value and scope",
    isGeminiPowered: false,
    triggerType: "deal_stage_changed",
    configurableTiming: false,
  },
  {
    id: "budget-overspend",
    name: "Alert when budget exceeded",
    department: "Finance",
    triggerDescription: "When spending exceeds 90% of monthly budget",
    actionDescription: "Send immediate alert to finance team with breakdown",
    isGeminiPowered: false,
    triggerType: "expense_logged",
    configurableTiming: false,
  },
  {
    id: "weekly-briefing",
    name: "Weekly executive summary",
    department: "Cross-Department",
    triggerDescription: "Every Monday at 9:00 AM",
    actionDescription: "Generate summary of tasks, deals, and revenue",
    isGeminiPowered: false,
    triggerType: "weekly_briefing_trigger",
    configurableTiming: true,
    defaultTiming: "Monday 9:00 AM",
  },
  {
    id: "hr-onboarding-reminder",
    name: "New hire onboarding workflow",
    department: "HR",
    triggerDescription: "When a new staff member is added",
    actionDescription: "Auto-assign onboarding checklist and notify team",
    isGeminiPowered: false,
    triggerType: "staff_added",
    configurableTiming: false,
  },
  {
    id: "lead-qualification",
    name: "Automatic lead qualification",
    department: "CRM",
    triggerDescription: "Every 2 hours for unqualified leads",
    actionDescription: "Automatically scores and qualifies leads based on criteria",
    isGeminiPowered: false,
    triggerType: "poll",
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
  {
    id: "auto-invoice-generation",
    name: "Automatic invoice generation",
    department: "Finance",
    triggerDescription: "Every 4 hours for completed work",
    actionDescription: "Automatically generates invoices for completed work",
    isGeminiPowered: false,
    triggerType: "poll",
    configurableTiming: false,
  },
  {
    id: "payment-reconciliation",
    name: "Automatic payment reconciliation",
    department: "Finance",
    triggerDescription: "When new payment is received",
    actionDescription: "Automatically matches payments to invoices and updates status",
    isGeminiPowered: false,
    triggerType: "payment_received",
    configurableTiming: false,
  },
  {
    id: "budget-tracking",
    name: "Automatic budget tracking",
    department: "Finance",
    triggerDescription: "Every 12 hours for budget monitoring",
    actionDescription: "Tracks spending against budget limits and alerts when exceeded",
    isGeminiPowered: false,
    triggerType: "poll",
    configurableTiming: false,
  },
  {
    id: "auto-task-assignment",
    name: "Automatic task assignment",
    department: "Projects",
    triggerDescription: "When new task is created without assignee",
    actionDescription: "Automatically assigns tasks to team members with lowest workload",
    isGeminiPowered: false,
    triggerType: "task_created",
    configurableTiming: false,
  },
  {
    id: "task-deadline-reminder",
    name: "Task deadline reminder",
    department: "Projects",
    triggerDescription: "Every 6 hours for upcoming deadlines",
    actionDescription: "Sends reminders for tasks due soon or overdue",
    isGeminiPowered: false,
    triggerType: "poll",
    configurableTiming: false,
  },
  {
    id: "project-status-update",
    name: "Automatic project status update",
    department: "Projects",
    triggerDescription: "Every 6 hours for active projects",
    actionDescription: "Automatically updates project status based on task completion",
    isGeminiPowered: false,
    triggerType: "poll",
    configurableTiming: false,
  },
  {
    id: "performance-review-reminder",
    name: "Performance review reminder",
    department: "HR",
    triggerDescription: "Every Monday for upcoming reviews",
    actionDescription: "Reminds managers and employees about upcoming performance reviews",
    isGeminiPowered: false,
    triggerType: "schedule",
    configurableTiming: true,
    defaultTiming: "Monday 9:00 AM",
  },
  {
    id: "training-reminder",
    name: "Training requirement reminder",
    department: "HR",
    triggerDescription: "Daily for training due soon",
    actionDescription: "Reminds staff about required training and certifications",
    isGeminiPowered: false,
    triggerType: "schedule",
    configurableTiming: true,
    defaultTiming: "Daily 8:00 AM",
  },
  {
    id: "invoice-followup",
    name: "Chase overdue invoices",
    department: "Finance",
    triggerDescription: "When an invoice is 7+ days overdue",
    actionDescription: "Send polite payment reminder with invoice details",
    isGeminiPowered: false,
    triggerType: "invoice_overdue",
    configurableTiming: true,
    defaultTiming: "7 days after due date",
  },
  {
    id: "task-reminder",
    name: "Task deadline notifications",
    department: "Projects",
    triggerDescription: "When a task is due in 2 days",
    actionDescription: "Notify assignee via email with task details",
    isGeminiPowered: false,
    triggerType: "task_due_soon",
    configurableTiming: true,
    defaultTiming: "2 days before deadline",
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
    id: "expense-categorization",
    name: "Smart expense categorization",
    department: "Finance",
    triggerDescription: "When an expense is logged without category",
    actionDescription: "Auto-categorize using keyword-based logic",
    isGeminiPowered: false,
    triggerType: "expense_logged",
    configurableTiming: false,
  },
  {
    id: "leave-request-approval",
    name: "Auto-approve short leave",
    department: "HR",
    triggerDescription: "When leave request is ≤3 days with 7+ days notice",
    actionDescription: "Automatically approve and update calendar",
    isGeminiPowered: false,
    triggerType: "leave_request_created",
    configurableTiming: false,
  },
  {
    id: "project-health-check",
    name: "Project risk alerts",
    department: "Projects",
    triggerDescription: "Every Friday at 5:00 PM",
    actionDescription: "Flag projects with missed deadlines or blocked tasks",
    isGeminiPowered: true,
    triggerType: "scheduled_health_check",
    configurableTiming: true,
    defaultTiming: "Friday 5:00 PM",
  },
  {
    id: "lead-score-update",
    name: "Lead scoring automation",
    department: "CRM",
    triggerDescription: "When contact is created or updated",
    actionDescription: "Calculate lead score based on interactions and engagement",
    isGeminiPowered: false,
    triggerType: "contact_updated",
    configurableTiming: false,
  },
  {
    id: "payroll-preparation",
    name: "Payroll preparation reminder",
    department: "HR",
    triggerDescription: "3 days before month-end at 10:00 AM",
    actionDescription: "Notify HR to verify timesheets and prepare payroll",
    isGeminiPowered: false,
    triggerType: "scheduled_payroll_reminder",
    configurableTiming: true,
    defaultTiming: "3 days before month-end",
  },
  {
    id: "revenue-report",
    name: "Monthly revenue report",
    department: "Finance",
    triggerDescription: "On the 1st of every month at 9:00 AM",
    actionDescription: "Generate detailed revenue breakdown by client and service",
    isGeminiPowered: true,
    triggerType: "scheduled_monthly_report",
    configurableTiming: true,
    defaultTiming: "1st of month 9:00 AM",
  },
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
    id: "task-assignment",
    name: "Auto-assign tasks",
    department: "Projects",
    triggerDescription: "When a new task is created without assignee",
    actionDescription: "Assign to team member with lowest workload",
    isGeminiPowered: false,
    triggerType: "task_created",
    configurableTiming: false,
  },
  {
    id: "contract-expiry",
    name: "Contract renewal alerts",
    department: "Finance",
    triggerDescription: "30 days before contract expiry",
    actionDescription: "Notify team to initiate renewal process",
    isGeminiPowered: false,
    triggerType: "contract_expiry",
    configurableTiming: true,
    defaultTiming: "30 days before expiry",
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
