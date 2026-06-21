// supabase/functions/_shared/types.ts

export enum TriggerType {
  EVENT = "event",
  POLL = "poll",
  SCHEDULE = "schedule",
}

export enum Department {
  CRM = "crm",
  FINANCE = "finance",
  PROJECTS = "projects",
  HR = "hr",
  CROSS = "cross_department",
}

export interface AutomationContext {
  businessId: string;
  db: any; // Supabase client
  payload: Record<string, any>;
  llm?: any;
  now: Date;
}

export interface AutomationResult {
  automationKey: string;
  triggered: boolean;
  summary: string;
  actionsTaken: string[];
  artifact?: Record<string, any>;
  error?: string;
}

export abstract class BaseAutomation {
  abstract key: string;
  abstract name: string;
  abstract department: Department;
  abstract triggerType: TriggerType;
  llmPowered: boolean = false;

  listensToTable?: string;
  listensToEvent?: string;
  pollIntervalSeconds?: number;
  cronExpression?: string;

  abstract shouldTrigger(ctx: AutomationContext): Promise<boolean>;
  abstract run(ctx: AutomationContext): Promise<AutomationResult>;

  describe() {
    return {
      key: this.key,
      name: this.name,
      department: this.department,
      triggerType: this.triggerType,
      llmPowered: this.llmPowered,
    };
  }
}
