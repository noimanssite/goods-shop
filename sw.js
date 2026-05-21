// turingshop PWA Service Worker
// - HTML/CSS/JS/아이콘은 cache-first (오프라인 캐시)
// - Supabase / 토스 / 쿠팡CDN / jsdelivr는 캐시 우회 (네트워크 그대로)
//   → 결제 무결성, 인증 최신성, 캐시 용량 보호

const CACHE = 'turingshop-v1';

const PRECACHE = [
  './',
  './index.html', './login.html', './checkout.html',
  './success.html', './fail.html', './orders.html', './admin.html',
  './css/style.css',
  './js/config.js', './js/supabase-client.js', './js/auth.js',
  './js/format.js', './js/nav.js', './js/products.js',
  './js/login.js', './js/checkout.js', './js/success.js',
  './js/orders.js', './js/admin.js',
  './js/sw-register.js', './js/install-prompt.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png',
  './manifest.webmanifest',
];

const EXCLUDE_HOSTS = [
  'supabase.co',
  'supabase.in',
  'tosspayments.com',
  'js.tosspayments.com',
  'coupangcdn.com',
  'cdn.jsdelivr.net',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 외부 동적 API/CDN은 SW가 손대지 않음 (브라우저가 직접 처리)
  if (EXCLUDE_HOSTS.some((h) => url.hostname.includes(h))) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          // 동일 출처 200 응답만 캐시 (CORS opaque, 4xx/5xx 캐시 안 함)
          if (resp.ok && url.origin === self.location.origin) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        })
        .catch(() => {
          // 오프라인 폴백: HTML 요청은 index.html로
          if (req.destination === 'document') {
            return caches.match('./index.html');
          }
          // 그 외는 그대로 실패
          return Response.error();
        });
    })
  );
});
