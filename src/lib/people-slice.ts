import { StateCreator } from 'zustand';
import { Staff } from './auth-slice';

export interface ExternalContact {
  id: string;
  name: string;
  email: string;
  type: "external";
}

export interface ExternalAccount {
  id: string;
  provider: "gmail" | "outlook";
  email: string;
  status: "connected";
}

export interface StaffCustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "email" | "tel" | "url";
  required: boolean;
}

export interface CustomDepartment {
  name: string;
  tools: string[];
}

export interface PeopleSlice {
  staffList: Staff[];
  externalContacts: ExternalContact[];
  externalAccounts: ExternalAccount[];
  staffCustomFields: StaffCustomField[];
  customDepartments: CustomDepartment[];
  addStaff: (staff: Staff) => void;
  addExternalContact: (contact: ExternalContact) => void;
  addExternalAccount: (account: ExternalAccount) => void;
  removeExternalAccount: (id: string) => void;
  setStaffCustomFields: (fields: StaffCustomField[]) => void;
  addCustomDepartment: (dept: CustomDepartment) => void;
}

export const createPeopleSlice: StateCreator<PeopleSlice> = (set) => ({
  staffList: [],
  externalContacts: [],
  externalAccounts: [],
  staffCustomFields: [],
  customDepartments: [],
  addStaff: (staff) =>
    set((state) => ({
      staffList: state.staffList.some((s) => s.id === staff.id)
        ? state.staffList.map((s) => (s.id === staff.id ? staff : s))
        : [...state.staffList, staff],
    })),
  addExternalContact: (contact) => set((state) => ({ externalContacts: [...state.externalContacts, contact] })),
  addExternalAccount: (account) => set((state) => ({ externalAccounts: [...state.externalAccounts, account] })),
  removeExternalAccount: (id) =>
    set((state) => ({
      externalAccounts: state.externalAccounts.filter((a) => a.id !== id),
    })),
  setStaffCustomFields: (fields) => set({ staffCustomFields: fields }),
  addCustomDepartment: (dept) => set((state) => ({ customDepartments: [...state.customDepartments, dept] })),
});
