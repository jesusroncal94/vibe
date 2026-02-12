import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@vibe/shared', '@vibe/db', '@vibe/claude'],
  serverExternalPackages: ['better-sqlite3', 'sharp', 'tesseract.js', 'puppeteer'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'better-sqlite3',
        'sharp',
        'puppeteer',
      ];
    }
    return config;
  },
};

export default nextConfig;
