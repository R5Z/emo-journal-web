'use client';

import { useEffect, useState } from 'react';
import { useThemeStore, useIsDark } from '@/store/useThemeStore';
import { useSettingsStore } from '@/store/useSettingsStore';

type Tab = 'calendar' | 'mypage';

export default function AppShell({ children }: { children: (tab: Tab, setTab: (t: Tab) => void, onWrite: () => void) => React.ReactNode }) {
  const { loadTheme } = useThemeStore();
  const { loadSettings } = useSettingsStore();
  const isDark = useIsDark();
  const [tab, setTab] = useState<Tab>('calendar');

  useEffect(() => {
    loadTheme();
    loadSettings();
  }, [loadSettings, loadTheme]);

  // dark class 관리
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="max-w-[430px] mx-auto min-h-dvh flex flex-col relative" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children(tab, setTab, () => undefined)}
      </div>

      {/* Bottom Tab Bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around pb-safe"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '0.5px solid var(--separator)',
          paddingTop: 6,
          paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 20px)',
          zIndex: 50,
        }}
      >
        {/* 달력 탭 */}
        <button
          onClick={() => setTab('calendar')}
          className="flex flex-col items-center gap-0.5 py-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tab === 'calendar' ? 'var(--tint)' : 'var(--text-tertiary)'} strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="16" y1="2" x2="16" y2="6" />
          </svg>
          <span className="text-[10px]" style={{ color: tab === 'calendar' ? 'var(--tint)' : 'var(--text-tertiary)', fontWeight: tab === 'calendar' ? 600 : 400 }}>달력</span>
        </button>

        {/* 쓰기 버튼 */}
        <button
          onClick={() => undefined}
          className="flex items-center justify-center rounded-full -mt-3"
          style={{
            width: 52, height: 52,
            backgroundColor: 'var(--tint)',
            boxShadow: '0 2px 8px rgba(0,122,255,0.3)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* MY 탭 */}
        <button
          onClick={() => setTab('mypage')}
          className="flex flex-col items-center gap-0.5 py-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={tab === 'mypage' ? 'var(--tint)' : 'var(--text-tertiary)'}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
          <span className="text-[10px]" style={{ color: tab === 'mypage' ? 'var(--tint)' : 'var(--text-tertiary)', fontWeight: tab === 'mypage' ? 600 : 400 }}>MY</span>
        </button>
      </div>
    </div>
  );
}
