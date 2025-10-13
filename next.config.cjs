// next.config.cjs
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  // ✅ Prevent "Partial response (206)" errors — skip media caching
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(?:mp4|webm|mp3|ogg|wav|mov|avi|mkv)$/,
      handler: "NetworkOnly", // Don't try to cache partial/streamed media
      options: {
        cacheName: "no-cache-media",
      },
    },
    {
      // Default: cache pages, images, scripts, etc.
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "default-cache",
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 1 week
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,

  webpack: (config) => {
    // Prevent build errors from missing scanner-beep.mp3 in @yudiel/react-qr-scanner
    config.module.rules.push({
      test: /\.mp3$/,
      use: "null-loader",
    });

    // Fix certain Node modules (optional fallback)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
});


