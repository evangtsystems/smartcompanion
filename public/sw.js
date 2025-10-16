// ✅ Smart Companion Service Worker (auto-refresh stable version)

const CACHE_VERSION = "v3"; // 🟣 bump version to force new cache on deploy
const CACHE_NAME = `smart-companion-${CACHE_VERSION}`;

const ASSETS = [
  "/", // shell
  "/manifest.json",
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
  self.skipWaiting(); // activate immediately
});

// 🟡 ACTIVATE — clean up old caches + claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
      await self.clients.claim();
      console.log("🔥 Old caches cleared and new SW activated");

      // 🟣 Tell pages to reload when a new SW takes control
      const clientsList = await self.clients.matchAll({ type: "window" });
      clientsList.forEach((client) =>
        client.postMessage({ type: "NEW_SW_ACTIVE" })
      );
    })()
  );
});

// 🔵 FETCH — network-first for pages, cache-first for assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML: network-first
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }

  // Other: cache-first
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

// 🔔 Chat notifications
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "chatMessage") {
    self.registration.showNotification("New message", {
      body: event.data.text,
      icon: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
    });
  }
});

// 🔔 Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Smart Companion";
  const body = data.body || "You have a new message";
  const url = data.url || "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      vibrate: [200, 100, 200],
      data: { url },
      actions: [{ action: "open", title: "Open" }],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clis) => {
      const client = clis.find((c) => c.url.includes(url));
      if (client) return client.focus();
      return clients.openWindow(url);
    })
  );
});


