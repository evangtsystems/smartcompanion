
import Header from "../src/components/header";
import { Toaster } from "react-hot-toast";

export const metadata = { title: "Smart Companion" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ PWA manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f3b2e" />

        {/* Optional: iOS install support */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>

      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f8f8f8",
        }}
      >
        <Header />
        <main style={{ padding: "20px" }}>{children}</main>

        {/* ✅ Toast notification container */}
        <Toaster
          position="bottom-center"
          toastOptions={{ duration: 2500 }}
        />

        {/* ✅ Register Service Worker + Global Push Subscription */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const reg = await navigator.serviceWorker.register('/sw.js');
                    console.log('✅ Service Worker registered:', reg.scope);

                    // Wait until ready
                    const readyReg = await navigator.serviceWorker.ready;
                    console.log('📦 SW ready:', readyReg.scope);

                    // Request permission for notifications
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                      const vapidKey = "${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}";
                      const apiBaseUrl = "${process.env.NEXT_PUBLIC_API_BASE_URL || "https://your-api-domain.com"}";

                      // Helper to convert base64 VAPID key
                      function urlBase64ToUint8Array(base64String) {
                        const padding = '='.repeat((4 - base64String.length % 4) % 4);
                        const base64 = (base64String + padding)
                          .replace(/-/g, '+')
                          .replace(/_/g, '/');
                        const rawData = atob(base64);
                        return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
                      }

                      // Register push globally if not yet done
                      const existingSub = await readyReg.pushManager.getSubscription();
                      if (!existingSub) {
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
                      } else {
                        console.log('ℹ️ Push subscription already exists');
                      }
                    } else {
                      console.warn('🚫 Notifications not granted');
                    }
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



