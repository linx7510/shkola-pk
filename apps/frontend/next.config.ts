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
    optimizePackageImports: [
      'react',
      'react-dom',
    ],
    optimizeCss: true,

  },
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: false,
  crossOrigin: 'anonymous',
  turbopack: {
    root: '/var/www/shkola-pk',
  },
  // === HTTP/2 caching headers for static assets ===
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
};

export default nextConfig;
