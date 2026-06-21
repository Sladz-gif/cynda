import { IndustryState } from "./industry-store";
import cyndiPlaybook from "../cyndi.md?raw";

/**
 * Builds the workspaceContext object for Cyndi based on the current state
 * Only includes data the user has access to via their active modules
 */
export function buildWorkspaceContext(state: IndustryState) {
  const { 
    currentUser, 
    adminProfile, 
    userType = 'solo', 
    selectedModules = [],
    tasks = [],
    projects = [],
    crmDeals = [],
    crmContacts = [],
    invoices = [],
    expenses = [],
    staffList = [],
    activeAutomations = [],
    automationLogs = [],
    notifications = []
  } = state;

  const activeUser = currentUser || adminProfile;
  const activeModules = selectedModules || [];

  const context: any = {
    user: {
      name: activeUser?.name || "User",
      role: activeUser?.role || "User",
      department: (activeUser as any)?.department || "General",
      activeModules: activeModules
    }
  };

  // 1. Projects Context
  if (activeModules.some(m => ['tasks', 'projects', 'kanban'].includes(m))) {
    const userTasks = tasks.filter(t => 
      !activeUser?.name || t.assignees.includes(activeUser.name) || t.assignees.length === 0
    );
    
    context.projects = {
      openTasks: userTasks.filter(t => t.status !== 'completed').map(t => ({
        id: t.id,
        title: t.title,
        project: t.project,
        due: t.due,
        priority: t.priority,
        status: t.status
      })),
      overdueTasks: userTasks.filter(t => {
        if (t.status === 'completed') return false;
        const dueDate = new Date(t.due);
        return dueDate < new Date();
      }),
      activeProjects: projects.filter(p => p.status === 'active').map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        completion: p.completion
      }))
    };
  }

  // 2. CRM Context
  if (activeModules.includes('crm')) {
    context.crm = {
      openDeals: crmDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost'),
      stalledDeals: crmDeals.filter(d => {
        return d.stage === 'Proposal' || d.stage === 'Negotiation';
      }),
      recentContacts: crmContacts.slice(0, 5)
    };
  }

  // 3. Finance Context
  if (activeModules.includes('finance') || activeModules.includes('invoicing')) {
    context.finance = {
      outstandingInvoices: invoices.filter(i => i.status !== 'Paid'),
      monthRevenue: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0),
      monthExpenses: expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0),
      netProfit: 0,
      pendingExpenseApprovals: expenses.filter(e => e.status === 'Pending')
    };
    context.finance.netProfit = context.finance.monthRevenue - (context.finance.monthExpenses || 0);
  }

  // 4. HR Context
  if (activeModules.includes('hr')) {
    context.hr = {
      onboardingInProgress: staffList.filter(s => s.role === 'Employee'),
      pendingLeaveRequests: [],
      upcomingBirthdays: [],
      openPositions: []
    };
  }

  // 5. Automations Context
  if (activeModules.includes('automation')) {
    context.automations = {
      recentlyTriggered: (automationLogs || []).slice(0, 5).map(log => ({
        name: log.automationName,
        outcome: log.outcome,
        timestamp: log.timestamp
      })),
      activeAutomations: (activeAutomations || []).map(a => a.name)
    };
  }

  // 6. Notifications Context
  context.notifications = {
    unread: (notifications || []).filter(n => !n.read).map(n => ({
      source: n.source,
      message: n.message
    }))
  };

  return context;
}

/**
 * Builds the system prompt for Cyndi: static playbook from `src/cyndi.md` plus session context.
 */
export function buildCyndiSystemPrompt(workspaceContext: any, state: IndustryState) {
  const { user } = workspaceContext;
  const modules =
    Array.isArray(user?.activeModules) && user.activeModules.length > 0
      ? user.activeModules.join(", ")
      : "(none listed  treat module-specific questions carefully)";

  const sessionContext = `
## Session context (authoritative; apply on every turn)
- User name: ${user.name}
- Role: ${user.role}
- Workspace type: ${state.userType ?? "unknown"}
- Active modules: ${modules}
- Local time: ${new Date().toLocaleString()} (${user.timezone})
`;

  return `${cyndiPlaybook.trim()}\n\n${sessionContext.trim()}`;
}
