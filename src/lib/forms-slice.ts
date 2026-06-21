import { StateCreator } from 'zustand';

type QuestionType = 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'linear_scale' | 'date' | 'time';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    type: string;
    value: any;
  };
}

interface AccessControl {
  userId: string;
  name: string;
  role: 'Owner' | 'Editor' | 'Viewer';
}

interface Form {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Active';
  questions: Question[];
  theme: {
    primaryColor: string;
    font: string;
    headerImage?: string;
  };
  responses: any[];
  access: AccessControl[];
}

type FieldType = 'text' | 'number' | 'date' | 'attachment' | 'checkbox' | 'dropdown' | 'link';

interface Field {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
}

interface Record {
  id: string;
  data: { [key: string]: any };
}

interface Table {
  id: string;
  name: string;
  fields: Field[];
  records: Record[];
  views: {
    id: string;
    name: string;
    type: 'grid' | 'kanban' | 'calendar' | 'gallery';
  }[];
}

interface Base {
  id: string;
  name: string;
  tables: Table[];
  access: AccessControl[];
}

export interface FormsSlice {
  forms: Form[];
  bases: Base[];
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  addBase: (base: Base) => void;
  updateBase: (id: string, updates: Partial<Base>) => void;
  deleteBase: (id: string) => void;
}

export const createFormsSlice: StateCreator<FormsSlice> = (set) => ({
  forms: [],
  bases: [],
  addForm: (form) => set((state) => ({ forms: [form, ...state.forms] })),
  updateForm: (id, updates) => set((state) => ({
    forms: state.forms.map((f) => f.id === id ? { ...f, ...updates } : f))
  })),
  deleteForm: (id) => set((state) => ({ forms: state.forms.filter((f) => f.id !== id) })),
  addBase: (base) => set((state) => ({ bases: [base, ...state.bases] })),
  updateBase: (id, updates) => set((state) => ({
    bases: state.bases.map((b) => b.id === id ? { ...b, ...updates } : b))
  })),
  deleteBase: (id) => set((state) => ({ bases: state.bases.filter((b) => b.id !== id) }))
});
