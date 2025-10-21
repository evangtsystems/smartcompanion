
import ClientHeader from "../src/components/ClientHeader";
import { Toaster } from "react-hot-toast";

export const metadata = { title: "Smart Companion" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ PWA manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f3b2e" />

        {/* ✅ SEO & Description */}
        <meta
          name="description"
          content="Smart Companion — your AI-powered travel assistant PWA for smarter trips."
        />
        <title>Smart Companion</title>

        {/* ✅ iOS install & splash support */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Smart Companion" />
        <meta name="format-detection" content="telephone=no" />

        {/* ✅ Optional splash screen for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/splash-1242x2688.png"
          media="(device-width: 414px)"
        />

        {/* ✅ Favicons for browsers */}
        <link rel="icon" href="/icons/icon-96.png" type="image/png" />
        <link rel="shortcut icon" href="/icons/icon-96.png" type="image/png" />

        {/* ✅ Viewport & responsiveness */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>

      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f8f8f8",
        }}
      >
        <ClientHeader />
        <main style={{ padding: "20px" }}>{children}</main>

        {/* ✅ Toast notifications */}
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />

        {/* ✅ Service Worker + Push Notifications */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const reg = await navigator.serviceWorker.register('/sw.js');
                    console.log('✅ Custom Service Worker registered:', reg.scope);

                    const readyReg = await navigator.serviceWorker.ready;
                    console.log('📦 SW ready:', readyReg.scope);

                    // ♻️ Reload if new service worker activates + handle push messages
navigator.serviceWorker.addEventListener('message', (event) => {
  // 🔁 Handle SW update
  if (event.data?.type === 'NEW_SW_ACTIVE') {
    console.log('♻️ New service worker active — reloading...');
    window.location.reload();
  }

  // 🔗 Handle navigation from notification click
  if (event.data?.type === 'OPEN_URL' && event.data.url) {
    console.log('🔗 Redirecting to:', event.data.url);
    window.location.href = event.data.url;
  }

  // 🔔 Fallback alert if notification arrives while app is open
  if (event.data?.type === 'IN_APP_NOTIFICATION') {
    alert(event.data.text || 'New message received');
  }
});


                    // 🕒 Ask permission slightly later (iOS-friendly)
                    setTimeout(async () => {
                      if (!('Notification' in window)) return;
                      const permission = await Notification.requestPermission();
                      if (permission !== 'granted') {
                        console.warn('🚫 Notifications not granted');
                        return;
                      }

                      const vapidKey = "${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}";
                      const apiBaseUrl = "${
                        process.env.NEXT_PUBLIC_API_BASE_URL ||
                        "https://your-api-domain.com"
                      }";

                      const existingSub = await readyReg.pushManager.getSubscription();
                      if (existingSub) {
                        console.log('ℹ️ Existing push subscription found');
                        return;
                      }

                      function urlBase64ToUint8Array(base64String) {
                        const padding = '='.repeat((4 - base64String.length % 4) % 4);
                        const base64 = (base64String + padding)
                          .replace(/-/g, '+')
                          .replace(/_/g, '/');
                        const rawData = atob(base64);
                        return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
                      }

                      const sub = await readyReg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidKey),
                      });

                      localStorage.setItem('pushSub', JSON.stringify(sub.toJSON()));

                      await fetch(\`\${apiBaseUrl}/api/push/subscribe\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomId: 'global', subscription: sub }),
                      });

                      console.log('✅ Global push subscription registered');
                    }, 2500);
                  } catch (err) {
                    console.error('❌ SW or Push setup failed:', err);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
