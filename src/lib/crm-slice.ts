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
  deleteCRMContact: (id: string) => void;
  deleteCRMCompany: (id: string) => void;
  deleteCRMDeal: (id: string) => void;
}

export const createCRMSlice: StateCreator<CRMSlice> = (set) => ({
  crmCompanies: [],
  crmContacts: [],
  crmDeals: [],
  addCRMContact: (contact) => set((state) => ({ crmContacts: [...state.crmContacts, contact] })),
  addCRMCompany: (company) => set((state) => ({ crmCompanies: [...state.crmCompanies, company] })),
  addCRMDeal: (deal) => set((state) => ({ crmDeals: [...state.crmDeals, deal] })),
  updateCRMDeal: (id, patch) =>
    set((state) => ({
      crmDeals: state.crmDeals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),
  deleteCRMContact: (id) =>
    set((state) => ({
      crmContacts: state.crmContacts.filter((c) => c.id !== id),
    })),
  deleteCRMCompany: (id) =>
    set((state) => ({
      crmCompanies: state.crmCompanies.filter((c) => c.id !== id),
    })),
  deleteCRMDeal: (id) =>
    set((state) => ({
      crmDeals: state.crmDeals.filter((d) => d.id !== id),
    })),
});
