import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@vibe/shared', '@vibe/db', '@vibe/claude'],
};

export default nextConfig;
