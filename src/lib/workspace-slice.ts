import { StateCreator } from 'zustand';

export interface WorkspaceTask {
  id: string;
  title: string;
  project: string;
  due: string;
  priority: string;
  status: string;
  assignees: string[];
  description?: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  status: string;
  completion: number;
}

export interface WorkspaceInvoice {
  id: string;
  client: string;
  amount: number;
  date: string;
  status: string;
}

export interface WorkspaceExpense {
  id: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

export interface Notification {
  id: string;
  source: string;
  title?: string;
  message: string;
  read: boolean;
  timestamp: string;
  type?: 'share' | 'form' | 'migration' | 'error' | 'system' | 'task';
  actionUrl?: string;
}

export interface ThemeSettings {
  mode: "light" | "dark" | "system";
  accentColor: string;
  glassmorphism: boolean;
  density: "compact" | "comfortable" | "spacious";
  fontScale: number;
}

export interface WorkspaceSlice {
  selectedModules: string[];
  themeSettings: ThemeSettings;
  notifications: Notification[];
  tasks: WorkspaceTask[];
  projects: WorkspaceProject[];
  invoices: WorkspaceInvoice[];
  expenses: WorkspaceExpense[];
  setSelectedModules: (modules: string[]) => void;
  setThemeSettings: (settings: Partial<ThemeSettings>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addTask: (task: WorkspaceTask) => void;
  updateTask: (id: string, patch: Partial<WorkspaceTask>) => void;
  addProject: (project: WorkspaceProject) => void;
  addInvoice: (invoice: WorkspaceInvoice) => void;
  addExpense: (expense: WorkspaceExpense) => void;
  seedNotifications: () => void;
}

export const DEFAULT_SELECTED_MODULES: string[] = [
  "tasks",
  "crm",
  "finance-dashboard",
  "hr-dashboard",
  "chat",
  "email",
  "notes",
  "forms",
  "file-management",
  "inbox",
  "automation",
];

export const TRIAL_ALLOWED_TOOLS: string[] = ['tasks', 'chat', 'notes', 'inbox'];

export const createWorkspaceSlice: StateCreator<WorkspaceSlice> = (set) => ({
  selectedModules: [...DEFAULT_SELECTED_MODULES],
  themeSettings: {
    mode: "system",
    accentColor: "#FF6600",
    glassmorphism: true,
    density: "comfortable",
    fontScale: 100,
  },
  notifications: [
    { id: "n1", source: "System", title: "Welcome to Cynda", message: "Your workspace is ready. Explore the modules to get started.", read: false, timestamp: new Date().toISOString(), type: 'system' },
    { id: "n2", source: "Sarah Chen", title: "File shared with you", message: "Sarah shared 'Q3 Financial Report.pdf' in the Finance department.", read: false, timestamp: new Date(Date.now() - 300000).toISOString(), type: 'share', actionUrl: '/app/files' },
    { id: "n3", source: "Form System", title: "New Form Response", message: "Your 'Customer Feedback' form received a new submission.", read: false, timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'form', actionUrl: '/app/forms' },
    { id: "n4", source: "Alex Rivera", title: "Mentioned you in #Design", message: "@admin take a look at these new onboarding wireframes when you have a moment.", read: false, timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'mention', actionUrl: '/app/chat' },
    { id: "n5", source: "Finance Bot", title: "Invoice Paid", message: "Invoice #INV-2024-001 for $2,500.00 has been marked as paid.", read: true, timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'task', actionUrl: '/app/finance' },
    { id: "n6", source: "HR System", title: "New Leave Request", message: "James Miller submitted a vacation request for next week.", read: true, timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'task', actionUrl: '/app/hr' },
  ],
  tasks: [],
  projects: [],
  invoices: [],
  expenses: [],
  setSelectedModules: (modules) => set({ selectedModules: Array.isArray(modules) ? modules : [] }),
  setThemeSettings: (settings) =>
    set((state) => ({
      themeSettings: { ...state.themeSettings, ...settings },
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  seedNotifications: () => set((state) => {
    const samples: Notification[] = [
      { id: "n1", source: "System", title: "Welcome to Cynda", message: "Your workspace is ready. Explore the modules to get started.", read: false, timestamp: new Date().toISOString(), type: 'system' },
      { id: "n2", source: "Sarah Chen", title: "File shared with you", message: "Sarah shared 'Q3 Financial Report.pdf' in the Finance department.", read: false, timestamp: new Date(Date.now() - 300000).toISOString(), type: 'share', actionUrl: '/app/files' },
      { id: "n3", source: "Form System", title: "New Form Response", message: "Your 'Customer Feedback' form received a new submission.", read: false, timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'form', actionUrl: '/app/forms' },
      { id: "n4", source: "Alex Rivera", title: "Mentioned you in #Design", message: "@admin take a look at these new onboarding wireframes when you have a moment.", read: false, timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'mention', actionUrl: '/app/chat' },
      { id: "n5", source: "Finance Bot", title: "Invoice Paid", message: "Invoice #INV-2024-001 for $2,500.00 has been marked as paid.", read: true, timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'task', actionUrl: '/app/finance' },
      { id: "n6", source: "HR System", title: "New Leave Request", message: "James Miller submitted a vacation request for next week.", read: true, timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'task', actionUrl: '/app/hr' },
    ];
    
    const currentNotifs = state.notifications || [];
    const existingIds = currentNotifs.map(n => n.id);
    const newSamples = samples.filter(s => !existingIds.includes(s.id));
    
    return { notifications: [...currentNotifs, ...newSamples] };
  }),
});
