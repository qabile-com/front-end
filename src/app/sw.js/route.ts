import { getFirebaseConfig } from '@/core/config/public-env';

export const dynamic = 'force-dynamic';

function getServiceWorkerFirebaseConfig() {
  const { vapidKey: _vapidKey, ...appConfig } = getFirebaseConfig();
  return appConfig;
}

const ENABLE_CACHING = process.env.NODE_ENV === 'production';

function buildServiceWorkerScript(): string {
  return `const CACHE_NAME = 'qabile-pwa-v1';
const OFFLINE_URL = '/offline';
const STATIC_ASSETS = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png'];
const ENABLE_CACHING = ${ENABLE_CACHING};
const FIREBASE_CONFIG = ${JSON.stringify(getServiceWorkerFirebaseConfig())};

try {
  importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');

  if (self.firebase?.apps && !self.firebase.apps.length) {
    self.firebase.initializeApp(FIREBASE_CONFIG);
  }

  const messaging = self.firebase?.messaging?.();
  messaging?.onBackgroundMessage?.((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || data.title || 'قبیله';
    const options = {
      body: notification.body || data.body,
      icon: notification.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: {
        url: data.url || payload.fcmOptions?.link || '/',
      },
    };

    self.registration.showNotification(title, options);
  });
} catch (error) {
  console.warn('[sw] Firebase messaging failed to initialize', error);
}

self.addEventListener('install', (event) => {
  if (!ENABLE_CACHING) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (!ENABLE_CACHING) return;

  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) || (await caches.match(OFFLINE_URL));
        }),
    );
    return;
  }

  if (['image', 'font', 'style', 'script'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      }),
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
        return undefined;
      }),
  );
});
`;
}

export function GET() {
  return new Response(buildServiceWorkerScript(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  });
}
