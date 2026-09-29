import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.29.241",
    "192.168.29.241:3000",
    "192.168.29.73",
    "192.168.29.73:3000",
    "localhost:3000",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
