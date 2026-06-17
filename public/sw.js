// public/sw.js
// 정적 자산: cache-first
// HTML(네비게이션): network-first (새 배포 즉시 반영)

const CACHE_VERSION = 'v1';
const CACHE_NAME = `emo-journal-${CACHE_VERSION}`;

// 최소 프리캐시 — 나머지는 fetch 시점에 채워진다
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // 일부 실패해도 install은 계속 진행
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] precache fail:', url, err)),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET만 캐싱
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 동일 출처만 (외부 도메인은 패스)
  if (url.origin !== self.location.origin) return;

  // dev 전용 경로는 절대 캐싱하지 않음 (혹시 prod에서 잘못 fetch되더라도)
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  // HTML 네비게이션 → network-first
  // (새 배포가 바로 반영되도록. 실패하면 캐시)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
    );
    return;
  }

  // 정적 자산 → cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        // 성공 응답만 캐싱
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return res;
      });
    }),
  );
});