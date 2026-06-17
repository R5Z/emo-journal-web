'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // dev에서는 등록 안 함 — HMR이랑 충돌하고 캐시 꼬임
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] register failed:', err);
        });
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
