self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);

  // in this case, we need to wait for the initial caching operation to
  // finish to avoid other events from trying to access the cache when
  // it's not ready yet.
  event.waitUntil(
    // this name is arbitrary
    caches.open('static').then(
      // we receive a reference to the cache
      function (cache) {
        console.log('[Service Worker] Precaching App Shell...', event);
        cache.add('/src/js/app.js');
      }
    )
  );
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
