// ✅ Smart Companion Service Worker


const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ✅ Smart Companion Service Worker (auto-update + safe caching)

const CACHE_VERSION = "v2-" + new Date().toISOString().slice(0, 10); // daily version tag
const CACHE_NAME = `smart-companion-${CACHE_VERSION}`;
const ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// 🟢 INSTALL — pre-cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 🟡 ACTIVATE — delete old caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// 🔵 FETCH — use network first for HTML (to avoid stale layouts/videos)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Always fetch latest HTML from network (avoid cached shell)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/"))
    );
    return;
  }

  // Cache-first for static assets (icons, manifest, etc.)
  event.respondWith(
    caches.match(req).then(
      (cached) => cached || fetch(req).then((res) => {
        const clone = res.clone();
        if (req.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
    )
  );
});

// 🔔 Notification hook (optional)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "chatMessage") {
    self.registration.showNotification("New message", {
      body: event.data.text,
      icon: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
    });
  }
});
