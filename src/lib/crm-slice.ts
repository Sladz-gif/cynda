import { StateCreator } from 'zustand';

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  status: string;
  phone?: string;
  companyId?: string;
  role?: string;
}

export interface CRMCompany {
  id: string;
  name: string;
  industry: string;
  status: string;
  size: string;
  website?: string;
}

export interface CRMDeal {
  id: string;
  stage: string;
  title: string;
  companyId: string;
  value: number;
  probability: number;
  status?: string;
  contactId?: string;
  company?: string;
  contact?: string;
  email?: string;
}

export interface CRMSlice {
  crmContacts: CRMContact[];
  crmCompanies: CRMCompany[];
  crmDeals: CRMDeal[];
  addCRMContact: (contact: CRMContact) => void;
  addCRMCompany: (company: CRMCompany) => void;
  addCRMDeal: (deal: CRMDeal) => void;
  updateCRMDeal: (id: string, patch: Partial<CRMDeal>) => void;
}

export const createCRMSlice: StateCreator<CRMSlice> = (set) => ({
  crmCompanies: [
    { id: "co1", name: "TechFlow Inc", industry: "Technology", status: "Customer", size: "50-200" },
    { id: "co2", name: "Acme Corp", industry: "Retail", status: "Lead", size: "1-10" },
    { id: "co3", name: "Global Logics", industry: "Logistics", status: "Qualified", size: "200+" },
  ],
  crmContacts: [
    { id: "ct1", name: "James Wilson", email: "james@techflow.com", status: "Customer", companyId: "co1" },
    { id: "ct2", name: "Sarah Jenkins", email: "sarah@acme.com", status: "Lead", companyId: "co2" },
  ],
  crmDeals: [
    { id: "d1", title: "TechFlow renewal", companyId: "co1", value: 45000, stage: "Negotiation", probability: 75, status: "active" },
    { id: "d2", title: "Acme expansion", companyId: "co2", value: 12000, stage: "Proposal", probability: 40, status: "active" },
    { id: "d3", title: "Global Logics pilot", companyId: "co3", value: 88000, stage: "Qualified", probability: 20, status: "active" },
  ],
  addCRMContact: (contact) => set((state) => ({ crmContacts: [...state.crmContacts, contact] })),
  addCRMCompany: (company) => set((state) => ({ crmCompanies: [...state.crmCompanies, company] })),
  addCRMDeal: (deal) => set((state) => ({ crmDeals: [...state.crmDeals, deal] })),
  updateCRMDeal: (id, patch) =>
    set((state) => ({
      crmDeals: state.crmDeals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),
});
