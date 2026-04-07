const CACHE_VERSION = '8bit-legends-v1.6.3';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/pwa/icon.svg',
  '/pwa/icon-maskable.svg',
  '/assets/sprites/player_sheet.png',
  '/assets/sprites/arrow.png',
  '/assets/sprites/shield.png',
  '/assets/tiles/rpg_tileset.png',
  '/assets/tiles/biome_forest.png',
  '/assets/tiles/biome_ruins.png',
  '/assets/tiles/biome_volcano.png',
  '/assets/tiles/biome_crystal.png',
  '/assets/sounds/click_003.ogg',
  '/assets/sounds/close_002.ogg',
  '/assets/sounds/confirmation_002.ogg',
  '/assets/sounds/drop_002.ogg',
  '/assets/sounds/tick_002.ogg',
  '/assets/sounds/switch_004.ogg',
  '/assets/sounds/glitch_003.ogg',
  '/assets/sounds/maximize_004.ogg',
  '/assets/sounds/error_003.ogg',
];

const isCacheableAsset = (request) => {
  const url = new URL(request.url);
  return (
    ['style', 'script', 'worker', 'image', 'audio', 'font'].includes(request.destination) ||
    url.pathname.startsWith('/assets/')
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          return (await caches.match(request)) || (await caches.match('/offline.html'));
        }
      })(),
    );
    return;
  }

  if (isCacheableAsset(request)) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          event.waitUntil(
            fetch(request)
              .then((response) => {
                if (response?.ok) {
                  return caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
                }
                return undefined;
              })
              .catch(() => undefined),
          );

          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse?.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return caches.match(request);
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse?.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        return (await caches.match(request)) || (await caches.match('/offline.html'));
      }
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
