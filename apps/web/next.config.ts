import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep trailing slashes on proxied API paths — FastAPI list routes use `/clients/` etc.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8001"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
