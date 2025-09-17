import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🚀 skip ESLint errors when building
  },
};

export default nextConfig;
