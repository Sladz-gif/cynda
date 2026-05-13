import { useIndustryStore } from "./industry-store";

export type GhostInvoice = {
  id: string;
  sourceModule: "CRM" | "Projects";
  sourceId: string;
  clientName: string;
  amount: number;
  description: string;
  status: "Pending" | "Paid" | "Overdue";
  createdAt: string;
};

class TransactionService {
  private ghostInvoices: GhostInvoice[] = [];
  private listeners: ((invoices: GhostInvoice[]) => void)[] = [];

  // Mock fetch from 'Database'
  async getInvoices(): Promise<GhostInvoice[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.ghostInvoices]), 300);
    });
  }

  // Called by CRM when Deal is Closed Won
  async createGhostInvoiceFromDeal(deal: any, clientName: string) {
    const invoice: GhostInvoice = {
      id: `inv_crm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sourceModule: "CRM",
      sourceId: deal.id,
      clientName,
      amount: typeof deal.value === "string" ? parseFloat(deal.value.replace(/[^0-9.-]+/g, "")) : deal.value,
      description: `Invoice for Deal: ${deal.title || 'Untitled Deal'}`,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    
    this.ghostInvoices.push(invoice);
    this.notifyListeners();
    
    // Also push to industry store for immediate UI syncing in standard Finance pages if they use that store
    const store = useIndustryStore.getState();
    store.addInvoice({
      id: invoice.id,
      client: invoice.clientName,
      amount: invoice.amount,
      date: invoice.createdAt.split('T')[0],
      status: "Pending"
    });
    
    return invoice;
  }

  // Called by Projects when Project is Complete
  async createGhostInvoiceFromProject(project: any, clientName: string) {
    const invoice: GhostInvoice = {
      id: `inv_prj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sourceModule: "Projects",
      sourceId: project.id,
      clientName,
      amount: project.budget ? parseFloat(project.budget.toString().replace(/[^0-9.-]+/g, "")) : 0,
      description: `Invoice for Project completion: ${project.name || 'Untitled Project'}`,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    
    this.ghostInvoices.push(invoice);
    this.notifyListeners();

    const store = useIndustryStore.getState();
    store.addInvoice({
      id: invoice.id,
      client: invoice.clientName,
      amount: invoice.amount,
      date: invoice.createdAt.split('T')[0],
      status: "Pending"
    });
    
    return invoice;
  }

  subscribe(listener: (invoices: GhostInvoice[]) => void) {
    this.listeners.push(listener);
    // Send immediate state
    listener([...this.ghostInvoices]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l([...this.ghostInvoices]));
  }
}

export const transactionService = new TransactionService();
