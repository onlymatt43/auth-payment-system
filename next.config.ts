import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'onlymatt-media.b-cdn.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
