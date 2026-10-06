import type { NextConfig } from "next";
import redirects from "./redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return redirects.redirects;
  },
  // === Performance optimizations ===
  compress: true,
  images: {
    // Аудит 06.10.2026: AVIF убран (GHSA-2xp9-vwfh-vxw4, RCE в AVIF-оптимизации Next <16.3.3),
    // remotePatterns убран целиком (CVE-2026-94483 SSRF + RCE-усиление) — next/image в проекте
    // не используется, все изображения локальные webp по стандарту проекта.
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
  },
  // Next 16: ключ верхнего уровня (раньше лежал в experimental — было предупреждение)
  serverExternalPackages: ["pdf-parse", "mammoth"],
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
