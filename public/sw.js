var CACHE_STATIC = 'static-v5';
var CACHE_DYNAMIC = 'dynamic';

self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);

  // in this case, we need to wait for the initial caching operation to
  // finish to avoid other events from trying to access the cache when
  // it's not ready yet.
  event.waitUntil(
    // remember that caches is a global overall caches storage
    // the cache name here (static) is arbitrary. could name it anything
    // we've now added a version to the cache name itself
    // (and that's called - believe it or not - a caching strategy)
    caches.open(CACHE_STATIC).then(
      // we receive a reference to the cache
      function (cache) {
        console.log('[Service Worker] Precaching App Shell...', event);
        // caching only /index.html won't work.
        // the request must match exactly.
        // Important: what we're caching here are URLs, not paths, not strings!
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          // course instructor decided not to cache the icons as this is
          // not supposed to be the default state of the app
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
        ]);
      }
    )
  );

  // Just for reference: when you open a cache, you get a CacheStorage
  // const cacheStorage = await caches.open(cacheName);
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  // This is a good place to clean up stale caches
  event.waitUntil(
    caches.keys().then(function (cachesKeys) {
      return Promise.all(
        cachesKeys.map(function (cacheKey) {
          if (cacheKey !== CACHE_STATIC && cacheKey !== CACHE_DYNAMIC) {
            console.log('[Service Worker] Removing old caches ....', cacheKey);
            return caches.delete(cacheKey);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    // Remember that the request is the key for the map!
    caches
      .match(event.request)
      // this is always executed. if not found, response will be null
      // meaning that not found will not throw an error
      .then((cacheResponse) => {
        if (cacheResponse) {
          return cacheResponse;
        }

        return (
          fetch(event.request)
            // this is where we will work Dynamic Caching
            .then(function (fetchResponse) {
              return caches.open(CACHE_DYNAMIC).then(function (cache) {
                // - the difference between .add and .put is that the later
                // requires you to provide the key as well
                // - also notice that we need to clone the response,
                // otherwise it will have been consumed

                // temporary disable dynamic cache for this section
                // cache.put(event.request.url, fetchResponse.clone());
                return fetchResponse;
              });
            })
            // ignore fetch errors
            .catch(function (err) {})
        );
      })
  );
});
