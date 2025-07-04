import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
};

export default nextConfig;
