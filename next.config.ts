// Cloud-safe: plain, mutable object with no `images`
import type { NextConfig } from "next";

const base = (process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const cfg: NextConfig = {
  reactStrictMode: true,
  basePath: base || undefined,
  assetPrefix: base || undefined,
  eslint: { ignoreDuringBuilds: true },
  output: process.env.DOCKER ? "standalone" : undefined,
  logging: { fetches: { fullUrl: true } },
  transpilePackages: ["next-mdx-remote", "commerce-kit"],
  experimental: { esmExternals: true, scrollRestoration: true },
  webpack: (cfg) => ({
    ...cfg,
    resolve: { ...cfg.resolve, extensionAlias: { ".js": [".js", ".ts"], ".jsx": [".jsx", ".tsx"] } },
  }),
  async rewrites() {
    return [{ source: "/stats/:match*", destination: "https://eu.umami.is/:match*" }];
  },
};

const config = { ...cfg }; 
export default config;
try { /* @ts-ignore */ module.exports = config; } catch {}