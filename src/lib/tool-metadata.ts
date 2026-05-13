import { 
  Users, Receipt, Kanban, UserCheck, LayoutGrid, LayoutDashboard, Zap, BarChart3, 
  Clock, Globe, FileText, CheckCircle, MessageSquare, Mail, ClipboardList, HardDrive, Inbox,
  ComponentType
} from "lucide-react";

export interface ToolInfo {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
}

export const TOOL_METADATA: Record<string, ToolInfo> = {
  // Departments
  crm: { id: 'crm', label: 'Clients', icon: Users },
  finance: { id: 'finance', label: 'Finance', icon: Receipt },
  projects: { id: 'projects', label: 'Projects', icon: Kanban },
  hr: { id: 'hr', label: 'People', icon: UserCheck },
  other: { id: 'other', label: 'Tools', icon: LayoutGrid },
  
  // Specific Tools
  'crm-dashboard': { id: 'crm-dashboard', label: 'CRM Dashboard', icon: LayoutDashboard },
  'marketing': { id: 'marketing', label: 'Marketing', icon: Zap },
  'crm-automation': { id: 'crm-automation', label: 'Sales Automation', icon: Zap },
  'reports': { id: 'reports', label: 'Sales Reports', icon: BarChart3 },
  'finance-dashboard': { id: 'finance-dashboard', label: 'Finance Dashboard', icon: LayoutDashboard },
  'invoicing': { id: 'invoicing', label: 'Invoicing', icon: Receipt },
  'expenses': { id: 'expenses', label: 'Expenses', icon: Receipt },
  'payroll': { id: 'payroll', label: 'Payroll', icon: Receipt },
  'inventory': { id: 'inventory', label: 'Inventory', icon: FileText },
  'clients': { id: 'clients', label: 'Clients', icon: Users },
  'finance-time-tracking': { id: 'finance-time-tracking', label: 'Time Tracking', icon: Clock },
  'payments': { id: 'payments', label: 'Payments', icon: Receipt },
  'multi-currency': { id: 'multi-currency', label: 'Multi-Currency', icon: Globe },
  'integrations': { id: 'integrations', label: 'Integrations', icon: Zap },
  'documents': { id: 'documents', label: 'Documents', icon: FileText },
  'tasks': { id: 'tasks', label: 'Task Management', icon: CheckCircle },
  'kanban': { id: 'kanban', label: 'Kanban Board', icon: Kanban },
  'list-view': { id: 'list-view', label: 'List View', icon: FileText },
  'calendar': { id: 'calendar', label: 'Calendar View', icon: Clock },
  'timeline': { id: 'timeline', label: 'Timeline / Gantt', icon: Clock },
  'resource-management': { id: 'resource-management', label: 'Resource Planning', icon: Users },
  'hr-dashboard': { id: 'hr-dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
  'directory': { id: 'directory', label: 'Directory', icon: Users },
  'hiring': { id: 'hiring', label: 'Hiring', icon: UserCheck },
  'onboarding': { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
  'time-off': { id: 'time-off', label: 'Time Off', icon: Clock },
  'hr-time-tracking': { id: 'hr-time-tracking', label: 'Time Tracking', icon: Clock },
  'hr-payroll': { id: 'hr-payroll', label: 'HR Payroll', icon: Receipt },
  'performance': { id: 'performance', label: 'Performance', icon: BarChart3 },
  'hr-analytics': { id: 'hr-analytics', label: 'HR Analytics', icon: BarChart3 },
  'chat': { id: 'chat', label: 'Chat', icon: MessageSquare },
  'email': { id: 'email', label: 'Email', icon: Mail },
  'notes': { id: 'notes', label: 'Notes', icon: FileText },
  'automation': { id: 'automation', label: 'Automation', icon: Zap },
  'forms': { id: 'forms', label: 'Forms', icon: ClipboardList },
  'file-management': { id: 'file-management', label: 'Files', icon: HardDrive },
  'dashboard': { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  'inbox': { id: 'inbox', label: 'Inbox', icon: Inbox }
};

export const getToolIcon = (toolId: string) => TOOL_METADATA[toolId]?.icon || LayoutGrid;
export const getToolLabel = (toolId: string) => TOOL_METADATA[toolId]?.label || toolId;
