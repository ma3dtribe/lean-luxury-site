const CACHE_NAME = "ma3d-core-v3";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/chat-test.html",
  "/manifest.json",
  "/icons/ma3d-192.png",
  "/icons/ma3d-512.png",
  "/images/ma3dtribebanner_cropped.png"
];

// Install and cache the main app files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );

  self.skipWaiting();
});

// Remove older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// Handle page and asset requests
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  // Page navigation: use current online page first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Do not cache live or third-party information
  if (
    request.url.includes("supabase") ||
    request.url.includes("twitch") ||
    request.url.includes("decapi") ||
    request.url.includes("onesignal") ||
    request.url.includes("google")
  ) {
    return;
  }

  // Static files: cached copy first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseCopy = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseCopy);
        });

        return networkResponse;
      });
    })
  );
});        cached ||
        fetch(req).then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
      );
    })
  );
});
