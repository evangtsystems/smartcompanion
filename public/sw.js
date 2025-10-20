// ✅ Smart Companion Service Worker (stable + push + offline)

const CACHE_VERSION = "v6"; // 🔁 bump this when deploying new builds
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

// 🟢 INSTALL — Precache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 🟡 ACTIVATE — Remove old caches + take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      );
      await self.clients.claim();
      console.log("🔥 Service Worker active — cache cleaned");

      // Notify clients that new SW took control
      const clientsList = await self.clients.matchAll({ type: "window" });
      clientsList.forEach((client) =>
        client.postMessage({ type: "NEW_SW_ACTIVE" })
      );
    })()
  );
});

// 🔵 FETCH — Network-first for HTML, cache-first for others
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 🧭 For navigation requests (pages)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/"))
    );
    return;
  }

  // 🧱 For static files
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Cache successful same-origin responses
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

// 💬 In-app chat messages (manual trigger)
self.addEventListener("message", (event) => {
  if (event.data?.type === "chatMessage") {
    self.registration.showNotification("New message", {
      body: event.data.text || "You received a new message",
      icon: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
    });
  }
});

// 🔔 PUSH — Handle incoming push notifications
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
          renotify: true,
          tag: "smart-companion",
        });
      } catch (err) {
        console.error("❌ Push event failed:", err);
      }
    })()
  );
});

// 🔗 Click on notification → open or focus tab
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

// 🧹 Optional: clear obsolete caches when user sends manual request
self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_CACHES") {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    console.log("🧹 Caches cleared manually");
  }
});
