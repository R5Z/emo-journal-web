import { create } from 'zustand';
import { JournalEntry } from '@/types';

interface EditorInitial {
  id?: number;
  content: string;
  date: string; // YYYY-MM-DD
}

interface EditorState {
  open: boolean;
  initial: EditorInitial | null;
  /** 저장 성공할 때마다 ++ — 페이지가 이 값 변화로 reload */
  savedToken: number;
  openNew: (date: string) => void;
  openEdit: (entry: JournalEntry) => void;
  markSaved: () => void;
  close: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  open: false,
  initial: null,
  savedToken: 0,
  openNew: (date) => set({ open: true, initial: { content: '', date } }),
  openEdit: (entry) =>
    set({
      open: true,
      initial: {
        id: entry.id,
        content: entry.content,
        date: entry.createdAt.split(' ')[0],
      },
    }),
  markSaved: () => set((s) => ({ savedToken: s.savedToken + 1 })),
  close: () => set({ open: false, initial: null }),
}));