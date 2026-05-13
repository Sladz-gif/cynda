import { useIndustryStore } from './industry-store';
import { callGemini } from './gemini';

/**
 * The central function that receives a trigger event and its data,
 * checks which automations are listening for that trigger, and executes them.
 */
export async function triggerAutomation(triggerType: string, payload: unknown) {
  const store = useIndustryStore.getState();
  const { activeAutomations, addAutomationLog, adminProfile, currentUser } = store;

  const userName = currentUser?.name || adminProfile?.name || "User";

  // 1. Find all active automations that listen for this trigger
  const matchingAutomations = activeAutomations.filter(
    (a) => a.status === 'active' && store.automationLibrary.find(t => t.id === a.templateId)?.triggerType === triggerType
  );

  // 2. Execute each matching automation
  for (const automation of matchingAutomations) {
    const template = store.automationLibrary.find(t => t.id === automation.templateId);
    if (!template) continue;

    try {
      let geminiResponse = "";
      let geminiCallMade = false;

      // Condition Evaluation (Simple mock for now, can be expanded per automation)
      const conditionsMet = evaluateConditions(automation, payload);
      
      if (!conditionsMet) {
        addAutomationLog({
          timestamp: new Date().toISOString(),
          automationName: automation.name,
          triggerEvent: triggerType,
          affectedRecord: getAffectedRecordName(payload),
          outcome: 'Skipped',
          geminiCall: false,
          errorReason: "Conditions not met"
        });
        continue;
      }

      // Action Execution
      if (template.isGeminiPowered) {
        geminiCallMade = true;
        const prompt = constructPrompt(automation, template, payload, userName);
        geminiResponse = await callGemini(prompt, { payload, config: automation.config });
      }

      // Perform the actual action (e.g., send notification, update store)
      await executeAction(automation, payload, geminiResponse);

      // Log the execution
      addAutomationLog({
        timestamp: new Date().toISOString(),
        automationName: automation.name,
        triggerEvent: triggerType,
        affectedRecord: getAffectedRecordName(payload),
        outcome: 'Success',
        geminiCall: geminiCallMade,
        promptContext: { payload, config: automation.config },
        responseReceived: geminiResponse
      });

      // Update run count
      useIndustryStore.setState((state) => ({
        activeAutomations: state.activeAutomations.map(a => 
          a.id === automation.id ? { ...a, runCount: a.runCount + 1, lastTriggered: new Date().toISOString(), triggeredRecord: getAffectedRecordName(payload) } : a
        )
      }));

    } catch (error: unknown) {
      console.error(`Automation execution failed [${automation.name}]:`, error);
      const message = error instanceof Error ? error.message : "Unknown error during execution";
      addAutomationLog({
        timestamp: new Date().toISOString(),
        automationName: automation.name,
        triggerEvent: triggerType,
        affectedRecord: getAffectedRecordName(payload),
        outcome: 'Failed',
        geminiCall: template.isGeminiPowered,
        errorReason: message
      });
    }
  }

  // 3. Handle Automatic Automations (Silent background ones)
  handleAutomaticAutomations(triggerType, payload, userName);
}

/**
 * Evaluates whether an automation's conditions are met for a given payload
 */
function evaluateConditions(automation: any, payload: any): boolean {
  const { config } = automation;
  
  switch (automation.templateId) {
    case 'follow-up-reminder':
      // Example: Check if days since last activity >= config days
      return true; // Simplified for build
    case 'budget-overspend':
      // Example: Check if expense amount + current total > budget
      return true;
    default:
      return true;
  }
}

/**
 * Constructs a specific prompt for Gemini based on the automation and data
 */
function constructPrompt(automation: any, template: any, payload: any, userName: string): string {
  const { config } = automation;
  
  let basePrompt = `Hi Cyndi, you are an AI assistant for Cynda. Help ${userName} with an automation task.
  Task: ${template.name}
  Description: ${template.triggerDescription}
  Action to take: ${template.actionDescription}
  
  Tone required: professional and concise.
  Output length: 2 to 3 sentences.
  This will be shown as a notification message to the user.
  `;

  // Add specific context based on template
  if (automation.templateId === 'follow-up-reminder') {
    basePrompt += `The deal "${payload.deal?.title}" for client "${payload.deal?.companyId}" has been quiet for ${config.days || 7} days. The last stage was "${payload.deal?.stage}". Generate a contextual nudge for follow-up.`;
  } else if (automation.templateId === 'deal-won-project') {
    basePrompt += `A deal "${payload.deal?.title}" worth $${payload.deal?.value} was just won. Suggest a name and a 2-sentence description for the new project starting from this deal.`;
  }

  return basePrompt;
}

/**
 * Performs the actual side-effect action of an automation
 */
async function executeAction(automation: any, payload: any, geminiResponse: string) {
  // In a real app, this would send emails, create DB records, etc.
  // For Cynda, we'll mostly generate notifications and Cyndi messages.
  console.log(`Executing action for ${automation.name}:`, geminiResponse || "Standard action");
  
  // Example: Add a notification to the user's notifications list if we had one in the store
  // For now, we'll just rely on the run log and console.
}

/**
 * Extracts a human-readable name for the record affected by the trigger
 */
function getAffectedRecordName(payload: any): string {
  if (payload.deal) return payload.deal.title;
  if (payload.task) return payload.task.title;
  if (payload.invoice) return payload.invoice.number;
  if (payload.expense) return `Expense: ${payload.expense.category}`;
  if (payload.employee) return payload.employee.name;
  return "Unknown Record";
}

/**
 * Handles always-on automatic background automations
 */
async function handleAutomaticAutomations(triggerType: string, payload: any, userName: string) {
  const store = useIndustryStore.getState();
  const { addAutomationLog } = store;

  // 1. Weekly Briefing (Scheduled)
  if (triggerType === 'weekly_briefing_trigger') {
    const prompt = `Good morning ${userName}. Generate a 8 to 12 line Monday morning briefing. 
    Include:
    - User's name and role: ${userName}
    - Count and list of open tasks with due dates
    - Pipeline deals by stage with values
    - Outstanding invoice totals
    
    Tone: warm, direct, and thoughtful.
    Deliver as a Cyndi message.`;

    const context = {
      user: userName,
      tasks: payload.tasks,
      deals: payload.deals,
      invoices: payload.invoices
    };

    const response = await callGemini(prompt, context);
    
    addAutomationLog({
      timestamp: new Date().toISOString(),
      automationName: "Weekly Monday Morning Briefing",
      triggerEvent: "Weekly Schedule",
      affectedRecord: "Workspace Overview",
      outcome: 'Success',
      geminiCall: true,
      responseReceived: response
    });
  }

  // 2. Overdue Task Escalation
  if (triggerType === 'task_completed' && payload.task?.isOverdue) {
    // This is just a trigger point example
  }

  // 3. Project Complete -> Invoice Prompt
  if (triggerType === 'project_completed') {
    const prompt = `A project "${payload.project?.name}" was just marked complete. 
    Generate a professional prompt for the finance team to create an invoice. 
    Include client name and suggested description.`;
    
    const response = await callGemini(prompt, { project: payload.project });
    
    addAutomationLog({
      timestamp: new Date().toISOString(),
      automationName: "Project Complete → Invoice Prompt",
      triggerEvent: "Project Completed",
      affectedRecord: payload.project?.name || "Project",
      outcome: 'Success',
      geminiCall: true,
      responseReceived: response
    });
  }

  // 4. Deal Gone Quiet Alert (Check would happen on a schedule, here we mock it)
  if (triggerType === 'deal_inactivity') {
    const prompt = `A deal "${payload.deal?.title}" has had zero activity for 7 days. 
    Generate a specific nudge referencing the last activity: "${payload.deal?.lastActivity}". 
    Suggest a logical next step.`;
    
    const response = await callGemini(prompt, { deal: payload.deal });
    
    addAutomationLog({
      timestamp: new Date().toISOString(),
      automationName: "Deal Gone Quiet Alert",
      triggerEvent: "7 Days Inactivity",
      affectedRecord: payload.deal?.title || "Deal",
      outcome: 'Success',
      geminiCall: true,
      responseReceived: response
    });
  }
}
