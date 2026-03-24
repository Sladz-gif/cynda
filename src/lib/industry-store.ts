import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Briefcase, User, Building2, Globe, LayoutDashboard, MessageSquare, Kanban, Users, Receipt, UserCheck, FileText, BarChart3, Zap, ClipboardList
} from "lucide-react";

export type UserType = 'solo' | 'small-business' | 'large-business' | 'enterprise';

export interface ModuleConfig {
  id: string;
  label: string;
  icon: any;
  department: string;
}

export interface UserConfig {
  id: UserType;
  name: string;
  icon: any;
  description: string;
}

export const DEPARTMENTS = {
  CRM: {
    id: 'crm',
    label: 'CRM',
    tools: [
      { id: 'leads', label: 'Leads', icon: Users },
      { id: 'contacts', label: 'Contacts', icon: Users },
      { id: 'pipeline', label: 'Pipeline', icon: Kanban },
      { id: 'deals', label: 'Deals', icon: FileText },
      { id: 'sales-forecast', label: 'Sales Forecast', icon: BarChart3 },
    ]
  },
  Finance: {
    id: 'finance',
    label: 'Finance',
    tools: [
      { id: 'invoicing', label: 'Invoicing', icon: Receipt },
      { id: 'expenses', label: 'Expenses', icon: Receipt },
      { id: 'payroll', label: 'Payroll', icon: Receipt },
      { id: 'budgeting', label: 'Budgeting', icon: BarChart3 },
      { id: 'tax-management', label: 'Tax Management', icon: FileText },
    ]
  },
  Projects: {
    id: 'projects',
    label: 'Projects',
    tools: [
      { id: 'tasks', label: 'Tasks', icon: CheckCircle },
      { id: 'kanban', label: 'Kanban', icon: Kanban },
      { id: 'gantt', label: 'Gantt', icon: BarChart3 },
      { id: 'time-tracking', icon: Clock, label: 'Time Tracking' },
      { id: 'resource-management', label: 'Resource Management', icon: Users },
    ]
  },
  HR: {
    id: 'hr',
    label: 'HR',
    tools: [
      { id: 'employees', label: 'Employees', icon: UserCheck },
      { id: 'attendance', label: 'Attendance', icon: UserCheck },
      { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
      { id: 'performance', label: 'Performance', icon: BarChart3 },
      { id: 'benefits', label: 'Benefits', icon: Receipt },
    ]
  },
  Other: {
    id: 'other',
    label: 'Other Tools',
    tools: [
      { id: 'chat', label: 'Chat', icon: MessageSquare },
      { id: 'notes', label: 'Notes', icon: FileText },
      { id: 'automation', label: 'Automation', icon: Zap },
      { id: 'forms', label: 'Forms', icon: ClipboardList },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'wiki', label: 'Wiki', icon: Globe },
      { id: 'file-management', label: 'File Management', icon: FileText },
    ]
  }
};

export const USER_TYPES: Record<UserType, UserConfig> = {
  solo: {
    id: 'solo',
    name: 'Solo',
    icon: User,
    description: 'Solo workspace with lightweight tools',
  },
  'small-business': {
    id: 'small-business',
    name: 'Small Business',
    icon: Building2,
    description: 'Team workspace with full tool access',
  },
  'large-business': {
    id: 'large-business',
    name: 'Large Business',
    icon: Globe,
    description: 'Multi-department with advanced controls',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Globe,
    description: 'Custom solutions for large organizations',
  },
};

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  tools: string[];
  department?: string;
  role: 'Director' | 'Manager' | 'Employee';
}

interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
}

interface IndustryState {
  userType: UserType;
  selectedModules: string[];
  adminProfile: AdminProfile | null;
  staffList: Staff[];
  teams: Team[];
  customDepartments: { name: string; tools: string[] }[];
  setUserType: (type: UserType) => void;
  setSelectedModules: (modules: string[]) => void;
  setAdminProfile: (profile: AdminProfile) => void;
  addStaff: (staff: Staff) => void;
  addTeam: (team: Team) => void;
  addCustomDepartment: (dept: { name: string; tools: string[] }) => void;
}

export const useIndustryStore = create<IndustryState>()(
  persist(
    (set) => ({
      userType: 'solo',
      selectedModules: [],
      adminProfile: { name: "Guest User", email: "guest@cynda.io", role: "Solo" },
      staffList: [],
      teams: [],
      customDepartments: [],
      setUserType: (type) => set({ userType: type }),
      setSelectedModules: (modules) => set({ selectedModules: Array.isArray(modules) ? modules : [] }),
      setAdminProfile: (profile) => set({ adminProfile: profile }),
      addStaff: (staff) => set((state) => ({ staffList: Array.isArray(state.staffList) ? [...state.staffList, staff] : [staff] })),
      addTeam: (team) => set((state) => ({ teams: Array.isArray(state.teams) ? [...state.teams, team] : [team] })),
      addCustomDepartment: (dept) => set((state) => ({ customDepartments: Array.isArray(state.customDepartments) ? [...state.customDepartments, dept] : [dept] })),
    }),
    {
      name: 'cynda-user-storage',
    }
  )
);
