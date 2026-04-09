const CACHE_NAME = "ma3d-core-v1";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/chat-test.html",
  "/manifest.json",
  "/icons/ma3d-192.png",
  "/images/ma3dtribebanner_cropped.png"
];

// Install → cache core UI
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate → clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch → ONLY cache safe assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle navigation (page loads)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // ❌ NEVER cache these (critical)
  if (
    req.url.includes("supabase") ||
    req.url.includes("twitch") ||
    req.url.includes("decapi") ||
    req.url.includes("onesignal") ||
    req.url.includes("google")
  ) {
    return;
  }

  // ✅ Cache-first for static assets
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
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
