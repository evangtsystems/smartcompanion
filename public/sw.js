// ✅ Smart Companion Service Worker

const CACHE_NAME = "smart-companion-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 🟢 INSTALL — cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  console.log("✅ [SW] Installed");
  self.skipWaiting();
});

// 🟡 ACTIVATE — clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  console.log("♻️ [SW] Activated");
  self.clients.claim();
});

// 🔵 FETCH — serve cached files first, then fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// 🔔 VIBRATION / NOTIFICATION TRIGGER
// 👉 This example vibrates if a "chatMessage" event is received via postMessage.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "chatMessage") {
    console.log("💬 [SW] Chat message received:", event.data.text);

    // Try vibration (mobile devices only)
    if (self.registration && self.registration.showNotification) {
      self.registration.showNotification("New message", {
        body: event.data.text,
        icon: "/icons/icon-192.png",
        vibrate: [200, 100, 200],
      });
    }
  }
});
