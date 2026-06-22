import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Ensure Payload plugin client components are properly bundled
  // This fixes the "PayloadComponent not found in importMap" error
  // for @payloadcms/storage-s3/client#S3ClientUploadHandler
  transpilePackages: [
    '@payloadcms/storage-s3',
    '@payloadcms/richtext-lexical',
    '@payloadcms/plugin-seo',
    'payload',
    '@payloadcms/next',
  ],
};

export default withPayload(nextConfig);
