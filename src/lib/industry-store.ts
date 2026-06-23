import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOOL_METADATA } from "./tool-metadata";
import { createAuthSlice, AuthSlice, UserType, SubscriptionTier, AdminProfile, Staff } from "./auth-slice";
import { createCRMSlice, CRMSlice, CRMContact, CRMCompany, CRMDeal } from "./crm-slice";
import { createWorkspaceSlice, WorkspaceSlice, WorkspaceTask, WorkspaceProject, WorkspaceInvoice, WorkspaceExpense, WorkspacePayroll, WorkspaceAsset, Notification, ThemeSettings, DEFAULT_SELECTED_MODULES, TRIAL_ALLOWED_TOOLS } from "./workspace-slice";
import { createAutomationSlice, AutomationSlice, AutomationTemplate, ActiveAutomation, AutomationLog, AutomationDepartment } from "./automation-slice";
import { createPeopleSlice, PeopleSlice, ExternalContact, ExternalAccount, StaffCustomField, CustomDepartment } from "./people-slice";
import { createNotesSlice, NotesSlice, Note } from "./notes-slice";
import { createFormsSlice, FormsSlice } from "./forms-slice";
import { User, Building2, Users, Globe, LucideIcon } from "lucide-react";

// Re-export types for backward compatibility
export type { 
  UserType, SubscriptionTier, AdminProfile, Staff, 
  CRMContact, CRMCompany, CRMDeal,
  WorkspaceTask, WorkspaceProject, WorkspaceInvoice, WorkspaceExpense, WorkspacePayroll, WorkspaceAsset, Notification, ThemeSettings,
  AutomationTemplate, ActiveAutomation, AutomationLog, AutomationDepartment,
  ExternalContact, ExternalAccount, StaffCustomField, CustomDepartment,
  Note, NotesSlice
};

export { DEFAULT_SELECTED_MODULES, TRIAL_ALLOWED_TOOLS };

export const USER_TYPES: Record<
  UserType,
  { id: UserType; name: string; description: string; icon: LucideIcon }
> = {
  solo: {
    id: "solo",
    name: "Solo",
    description: "Just me.",
    icon: User,
  },
  team: {
    id: "team",
    name: "Small Team",
    description: "2 to 10 people",
    icon: Users,
  },
  organisation: {
    id: "organisation",
    name: "Organisation",
    description: "11 to 50 members",
    icon: Building2,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom scale & deployment.",
    icon: Globe,
  },
};

export const DEPARTMENTS = {
  CRM: {
    id: "crm",
    label: TOOL_METADATA.crm.label,
    tools: [
      { ...TOOL_METADATA.crm, description: "Manage your contact database and view customer activity." },
      { ...TOOL_METADATA.marketing, description: "Launch and track multi-channel marketing campaigns." },
      { ...TOOL_METADATA["crm-automation"], description: "Automate your sales pipeline and lead follow-ups." },
      { ...TOOL_METADATA.reports, description: "Detailed analytics on conversion rates and revenue growth." },
    ],
  },
  Finance: {
    id: "finance",
    label: TOOL_METADATA.finance.label,
    tools: [
      { ...TOOL_METADATA["finance-dashboard"], description: "Overview of your cash flow, profit, and financial health." },
      { ...TOOL_METADATA.invoicing, description: "Create professional invoices and track payments." },
      { ...TOOL_METADATA.expenses, description: "Log business spending and manage reimbursement workflows." },
      { ...TOOL_METADATA.payroll, description: "Manage employee salaries, taxes, and distributions." },
      { ...TOOL_METADATA.inventory, description: "Track stock levels, assets, and equipment in real-time." },
    ],
  },
  Projects: {
    id: "projects",
    label: TOOL_METADATA.projects.label,
    tools: [
      { ...TOOL_METADATA.tasks, description: "Coordinate work across your team with lists and priorities." },
      { ...TOOL_METADATA["list-view"], description: "A detailed list-based approach to project management." },
      { ...TOOL_METADATA.calendar, description: "Visualize deadlines and milestones on a unified timeline." },
      { ...TOOL_METADATA.timeline, description: "Advanced project planning with dependencies and roadmaps." },
      { ...TOOL_METADATA["resource-management"], description: "Balance team workload and assign tasks efficiently." },
    ],
  },
  HR: {
    id: "hr",
    label: TOOL_METADATA.hr.label,
    tools: [
      { ...TOOL_METADATA["hr-dashboard"], description: "Monitor team health, attendance, and general staff metrics." },
      { ...TOOL_METADATA.directory, description: "A central hub for all staff contact and profile information." },
      { ...TOOL_METADATA.hiring, description: "Manage job postings, candidates, and interview pipelines." },
      { ...TOOL_METADATA.onboarding, description: "Streamline the experience for new team members." },
      { ...TOOL_METADATA["time-off"], description: "Track leave requests, vacations, and sick days." },
    ],
  },
  Other: {
    id: "other",
    label: TOOL_METADATA.other.label,
    tools: [
      { ...TOOL_METADATA.chat, description: "Real-time communication with channels and direct messages." },
      { ...TOOL_METADATA.email, description: "Send and receive professional emails from your workspace." },
      { ...TOOL_METADATA.notes, description: "Collaborative documents, wikis, and personal knowledge base." },
      { ...TOOL_METADATA.forms, description: "Build custom forms and databases to collect structured data." },
      { ...TOOL_METADATA["file-management"], description: "A secure repository for all your documents and assets." },
    ],
  },
};

export type IndustryState = AuthSlice & CRMSlice & WorkspaceSlice & AutomationSlice & PeopleSlice & NotesSlice & FormsSlice;

export const useIndustryStore = create<IndustryState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createCRMSlice(...a),
      ...createWorkspaceSlice(...a),
      ...createAutomationSlice(...a),
      ...createPeopleSlice(...a),
      ...createNotesSlice(...a),
      ...createFormsSlice(...a),
      // Override logout to clear all relevant slices if needed
      logout: () => {
        const [set] = a;
        set({
          currentUser: null,
          isAuthenticated: false,
          adminProfile: null,
          selectedModules: [],
          notifications: [],
          trialStartedAt: null,
          trialMessageCount: 0,
          isOnboarded: false
        });
      },
      // Dev tool to clear storage and reset
      resetStore: () => {
        const [set] = a;
        localStorage.removeItem('industry-storage');
        window.location.reload();
      }
    }),
    {
      name: "industry-storage",
    }
  )
);
