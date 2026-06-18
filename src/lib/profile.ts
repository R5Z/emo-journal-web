import { STORAGE_KEYS } from '../constants/storageKeys';

export interface Profile {
  nickname: string;
  avatarType: 'emoji' | 'image';
  avatarEmoji: string;
  avatarImageUri: string | null;
}

export const DEFAULT_PROFILE: Profile = {
  nickname: '하이',
  avatarType: 'emoji',
  avatarEmoji: '🌈',
  avatarImageUri: null,
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}