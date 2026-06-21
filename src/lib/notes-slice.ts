import { StateCreator } from 'zustand';

export interface Note {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  parentId?: string;
  folder?: string;
  content: string; // HTML content from Quill
  isFavorite: boolean;
  isArchived: boolean;
  updatedAt: string;
  tags: string[];
  access: Array<{ userId: string; name: string; role: 'Owner' | 'Editor' | 'Viewer' }>;
}

export interface NotesSlice {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string, permanently?: boolean) => void;
  restoreNote: (id: string) => void;
}

export const createNotesSlice: StateCreator<NotesSlice> = (set) => ({
  notes: [],
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    })),
  deleteNote: (id, permanently = false) =>
    set((state) => ({
      notes: permanently
        ? state.notes.filter((n) => n.id !== id)
        : state.notes.map((n) => (n.id === id ? { ...n, isArchived: true } : n)),
    })),
  restoreNote: (id) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, isArchived: false } : n)),
    })),
});
