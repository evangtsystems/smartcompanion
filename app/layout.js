
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
        <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />

        {/* ✅ Register Service Worker (for vibration, offline, notifications) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('✅ Service Worker registered:', reg.scope))
                    .catch(err => console.warn('❌ Service Worker failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}


