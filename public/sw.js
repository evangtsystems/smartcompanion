// ✅ Smart Companion Service Worker (stable + reliable push notifications)

const CACHE_VERSION = "v5"; // bump version on each deploy
const CACHE_NAME = `smart-companion-${CACHE_VERSION}`;

const ASSETS = [
  "/",
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

// 🟢 INSTALL — Pre-cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 🟡 ACTIVATE — Clean up old caches and reload pages
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      );
      await self.clients.claim();
      console.log("🔥 New service worker active — caches cleaned");

      // Notify pages that a new SW took over
      const clientsList = await self.clients.matchAll({ type: "window" });
      clientsList.forEach((client) =>
        client.postMessage({ type: "NEW_SW_ACTIVE" })
      );
    })()
  );
});

// 🔵 FETCH — Network-first for pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (
            req.url.startsWith(self.location.origin) &&
            res.ok &&
            res.status === 200
          ) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

// 🔔 In-app chat notification (manual trigger from page)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "chatMessage") {
    self.registration.showNotification("New message", {
      body: event.data.text,
      icon: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
    });
  }
});

// 🔔 PUSH — Reliable push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) return;

  event.waitUntil(
    (async () => {
      try {
        const data = event.data.json();
        const title = data.title || "Smart Companion";
        const body = data.body || "You have a new message";
        const url = data.url || "/";

        console.log("📨 Push received:", title, body);

        await self.registration.showNotification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-72.png",
          vibrate: [200, 100, 200],
          data: { url },
          actions: [{ action: "open", title: "Open" }],
          renotify: true, // replaces old notifications with same tag
          tag: "smart-companion", // ensures deduplication
        });
      } catch (err) {
        console.error("❌ Push event failed:", err);
      }
    })()
  );
});

// 🔗 Handle notification clicks — reopen or focus app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const focused = clientsList.find((c) => c.url.includes(url));
      if (focused) return focused.focus();
      return clients.openWindow(url);
    })()
  );
});


