'use client';

import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/storageKeys';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  loaded: boolean;
  setMode: (mode: ThemeMode) => void;
  loadTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  loaded: false,

  setMode: (mode) => {
    set({ mode });
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  loadTheme: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (saved && ['system', 'light', 'dark'].includes(saved)) {
        set({ mode: saved as ThemeMode, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));

export function useIsDark(): boolean {
  const { mode } = useThemeStore();

  if (mode === 'dark') return true;
  if (mode === 'light') return false;

  // system mode
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}