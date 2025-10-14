// ✅ Smart Companion Service Worker (stable version)

const CACHE_VERSION = "v2"; // static cache version
const CACHE_NAME = `smart-companion-${CACHE_VERSION}`;

const ASSETS = [
  "/", // ensure shell is cached
  "/manifest.json",
  // include all manifest icons
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-144.png",
  "/icons/icon-152.png",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
];

// 🟢 INSTALL — pre-cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 🟡 ACTIVATE — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 🔵 FETCH — network-first for pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML: always try network first
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/"))
    );
    return;
  }

  // Other files: cache-first
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const clone = res.clone();
          if (req.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
    )
  );
});

// 🔔 Notification hook for chat messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "chatMessage") {
    self.registration.showNotification("New message", {
      body: event.data.text,
      icon: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
    });
  }
});
