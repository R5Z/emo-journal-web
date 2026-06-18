'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useDateStore } from '@/store/useDateStore';
import { useEditorStore } from '@/store/useEditorStore';

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const selectedDate = useDateStore((s) => s.selectedDate);
  const openNew = useEditorStore((s) => s.openNew);

  const isHome = pathname === '/';
  const isMy = pathname === '/mypage';

  const base =
    'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px]';
  const inactive = 'text-neutral-400 dark:text-neutral-500';
  const active = 'text-blue-500';

  return (
    <nav
      className="flex h-16 shrink-0 items-center justify-around border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-neutral-800 dark:bg-neutral-900"
      aria-label="하단 네비게이션"
    >
      <button
        onClick={() => router.push('/')}
        className={`${base} ${isHome ? active : inactive}`}
        aria-current={isHome ? 'page' : undefined}
        aria-label="홈"
      >
        <CalendarIcon active={isHome} />
        
      </button>

      <button
        onClick={() => openNew(selectedDate)}
        className={`${base} ${inactive}`}
        aria-label="새 일기 작성"
      >
        <PlusIcon />
        
      </button>

      <button
        onClick={() => router.push('/mypage')}
        className={`${base} ${isMy ? active : inactive}`}
        aria-current={isMy ? 'page' : undefined}
        aria-label="마이페이지"
      >
        <UserIcon active={isMy} />
        
      </button>
    </nav>
  );
}
