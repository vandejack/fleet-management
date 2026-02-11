import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["fms.aicrone.id", "192.168.1.101", "localhost:3000"],
    },
  },
};

export default nextConfig;
