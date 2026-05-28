import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/storageKeys';

export type FontSize = 'small' | 'medium' | 'large';
export type WeekStart = 'sunday' | 'monday';

type SettingsState = {
  fontSize: FontSize;
  weekStart: WeekStart;
  loaded: boolean;
  setFontSize: (size: FontSize) => void;
  setWeekStart: (start: WeekStart) => void;
  loadSettings: () => void;
};

export const FONT_SIZES = {
  small: { body: 14, entry: 14, label: 11, title: 16 },
  medium: { body: 16, entry: 16, label: 13, title: 18 },
  large: { body: 18, entry: 18, label: 15, title: 20 },
} as const;

function saveToStorage(key: string, value: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    settings[key] = value;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save setting:', e);
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 'medium',
  weekStart: 'monday',
  loaded: false,

  setFontSize: (size) => {
    set({ fontSize: size });
    saveToStorage('fontSize', size);
  },

  setWeekStart: (start) => {
    set({ weekStart: start });
    saveToStorage('weekStart', start);
  },

  loadSettings: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          fontSize: parsed.fontSize || 'medium',
          weekStart: parsed.weekStart || 'monday',
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));