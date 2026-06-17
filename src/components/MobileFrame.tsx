'use client';

import React from 'react';

/**
 * 데스크탑(sm 이상)에서는 가운데 좁은 박스(폰 폭), 양옆 비움 + 좌측 안내.
 * 모바일에서는 풀스크린.
 */
export default function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:max-w-[440px] sm:shadow-2xl sm:ring-1 sm:ring-black/5 dark:bg-neutral-950 dark:sm:ring-white/10">
      {/* 데스크탑 좌측 안내 (모바일에선 숨김) */}
      <aside
        className="pointer-events-none fixed left-8 top-8 hidden font-mono text-xs leading-relaxed text-neutral-400 sm:block dark:text-neutral-600"
        aria-hidden
      >
        <p>모바일에 최적화된 앱이에요.</p>
        <p className="mt-1 text-neutral-300 dark:text-neutral-700">
          폰에서 열거 홈 화면에<br />
          추가해서 사용해 보세요.
        </p>
      </aside>

      {/* 프레임 박스 */}
      <div className="relative mx-auto flex min-h-[100dvh] w-full flex-col overflow-hidden bg-white sm:max-w-[440px] sm:shadow-2xl sm:ring-1 sm:ring-black/5 dark:bg-neutral-950 dark:sm:ring-white/10">
        {children}
      </div>
    </div>
  );
}
