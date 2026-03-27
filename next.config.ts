import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Handle production environment
  experimental: {
    serverActions: {
      allowedOrigins: ['etuk.soretiinternational.com', '*.soretiinternational.com'],
    },
  },
  // Ensure images work properly
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
