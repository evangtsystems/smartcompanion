// next.config.cjs
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
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

