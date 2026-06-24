import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverComponentsHmrCache: true,
  },
};

export default nextConfig;
