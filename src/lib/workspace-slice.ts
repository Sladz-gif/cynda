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

export interface WorkspacePayroll {
  id: string;
  employee: string;
  role: string;
  amount: number;
  date: string;
  status: string;
}

export interface WorkspaceAsset {
  id: string;
  item: string;
  serial: string;
  value: number;
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
  payroll: WorkspacePayroll[];
  assets: WorkspaceAsset[];
  setSelectedModules: (modules: string[]) => void;
  setThemeSettings: (settings: Partial<ThemeSettings>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addTask: (task: WorkspaceTask) => void;
  updateTask: (id: string, patch: Partial<WorkspaceTask>) => void;
  deleteTask: (id: string) => void;
  addProject: (project: WorkspaceProject) => void;
  addInvoice: (invoice: WorkspaceInvoice) => void;
  addExpense: (expense: WorkspaceExpense) => void;
  addPayroll: (payroll: WorkspacePayroll) => void;
  addAsset: (asset: WorkspaceAsset) => void;
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
  ],
  tasks: [],
  projects: [],
  invoices: [],
  expenses: [],
  payroll: [],
  assets: [],
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
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  addPayroll: (payroll) => set((state) => ({ payroll: [...state.payroll, payroll] })),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  seedNotifications: () => set((state) => {
    const samples: Notification[] = [
      { id: "n1", source: "System", title: "Welcome to Cynda", message: "Your workspace is ready. Explore the modules to get started.", read: false, timestamp: new Date().toISOString(), type: 'system' },
    ];
    
    const currentNotifs = state.notifications || [];
    const existingIds = currentNotifs.map(n => n.id);
    const newSamples = samples.filter(s => !existingIds.includes(s.id));
    
    return { notifications: [...currentNotifs, ...newSamples] };
  }),
});
