import type { NextConfig } from "next";
import redirects from "./redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return redirects.redirects;
  },
  // === Performance optimizations ===
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  reactStrictMode: false,
  crossOrigin: 'anonymous',
};

export default nextConfig;
