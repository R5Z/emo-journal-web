'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [standalone, setStandalone] = useState(() => isStandaloneMode());

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setStandalone(true);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (standalone || dismissed || !installEvent) return null;

  const handleInstall = async () => {
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallEvent(null);
      }
    } catch (error) {
      console.error('PWA install prompt failed:', error);
    }
  };

  return (
    <div className="px-5 pb-3">
      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
        <div className="flex-1">
          홈 화면에 설치해 두면 브라우저 UI 없이 더 앱처럼 사용할 수 있어요.
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white"
        >
          설치
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-xs text-blue-700/80"
          aria-label="설치 안내 닫기"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
