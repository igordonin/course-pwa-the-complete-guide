importScripts('/src/js/idb.js');
importScripts('/src/js/indexed_db.utils.js');

var CACHE_STATIC = 'static-v14';
var CACHE_DYNAMIC = 'dynamic';
var API_URL = 'https://pwa-course-90792-default-rtdb.firebaseio.com/posts.json';
var FUNCTION_URL = 'https://storepostdata-gl7o3b2hjq-uc.a.run.app';

function trimCache(name, maxItems) {
  caches.open(name).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(
          // recursevely call itself until the if condition above is met
          trimCache(name, maxItems)
        );
      }
    });
  });
}

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
          '/offline.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/idb.js',
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
  // If we're fetching data, not assets
  if (event.request.url.indexOf(API_URL) > -1) {
    // - Use the Cache then Network Strategy
    // - Remember this Strategy has two part. One lives here at the
    // Service Worker. The other part consists of the code living
    // in the App, which fires a request to fetch data in parallel
    // from both the Cache and the Network
    event.respondWith(
      fetch(event.request).then(function (response) {
        const clonedResponse = response.clone();
        clearAllData('posts')
          .then(() => {
            return clonedResponse.json();
          })
          .then(function (data) {
            Object.values(data).forEach((card) => {
              writeData('posts', card);
            });
          });
        return response;
      })
    );
  } else {
    // - Use the Cache with Network Fallback Strategy
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
                  // commenting it out for the course
                  // trimCache(CACHE_DYNAMIC, 3);
                  // - the difference between .add and .put is that the later
                  // requires you to provide the key as well
                  // - also notice that we need to clone the response,
                  // otherwise it will have been consumed
                  cache.put(event.request.url, fetchResponse.clone());
                  return fetchResponse;
                });
              })
              // ignore fetch errors
              .catch(function (err) {
                return caches.open(CACHE_STATIC).then(function (cache) {
                  // there's a side effect here, bc this is a naive approach
                  // for every fetch request that fails, we're returning this
                  // html page.
                  // - now we have a better solution that will fallback for
                  // any html pages only
                  if (
                    event.request.headers.get('accept').includes('text/html')
                  ) {
                    return cache.match('/offline.html');
                  }
                });
              })
          );
        })
    );
  }
});

self.addEventListener('sync', function (event) {
  console.log('[Service Worker] Background synching ....', event);
  // filter the event by tag
  // do not mix up the event tag with the store name
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new Posts ....');
    event.waitUntil(
      readAllData('sync-posts').then(function (data) {
        for (var dt of data) {
          fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              id: dt.id,
              title: dt.title,
              location: dt.location,
              image:
                'https://bavipower.com/cdn/shop/articles/7469e9c9652967f4c8591dc7ca0b3a54--viking-ship_1024x1024.jpg?v=1607843960',
            }),
          })
            .then(function (res) {
              console.log('Sent data', res);
              if (res.ok) {
                res.json().then(function (resData) {
                  console.log(
                    'Response received. Delete the sync-post',
                    resData
                  );
                  // delete from indexedDB
                  deleteById('sync-posts', resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log('Error while sending data', err);
            });
        }
      })
    );
  }
});
