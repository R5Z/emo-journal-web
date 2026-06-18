'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

/**
 * 테마 mode를 실제 <html> 클래스에 반영.
 * - 'dark' → 항상 다크
 * - 'light' → 항상 라이트
 * - 'system' → OS 설정 따라가며, 변경 시 실시간 반영
 *
 * Tailwind darkMode: 'class' 와 짝을 이룸.
 */
export default function ThemeApplier() {
  const mode = useThemeStore((s) => s.mode);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  // 저장된 테마 모드 복원 (앱 시작 시 1회)
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  useEffect(() => {
    const root = document.documentElement;

    const apply = (isDark: boolean) => {
      root.classList.toggle('dark', isDark);
    };

    if (mode === 'dark') {
      apply(true);
      return;
    }
    if (mode === 'light') {
      apply(false);
      return;
    }

    // system: OS 설정 따라가기 + 변경 구독
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mql.matches);

    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode]);

  return null;
}
