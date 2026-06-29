import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  // API proxy handled at runtime by src/app/api/v1/[...path]/route.ts
  // (next.config rewrites bake localhost at build time on Vercel — avoid that)
};

export default nextConfig;
