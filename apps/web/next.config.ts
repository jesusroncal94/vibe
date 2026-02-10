import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@vibe/shared', '@vibe/db', '@vibe/claude'],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
