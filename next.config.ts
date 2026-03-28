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
  // Include these packages in the standalone output (Next.js 15+)
  serverExternalPackages: ['bcryptjs', '@prisma/client', 'prisma'],
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
