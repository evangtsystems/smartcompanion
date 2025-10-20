const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // Prevent build errors from missing scanner-beep.mp3
    config.module.rules.push({
      test: /\.mp3$/,
      use: "null-loader",
    });

    // Fix for server modules that use fs
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

export default nextConfig;


