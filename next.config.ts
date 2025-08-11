// next.config.ts
import MDX from "@next/mdx";
import type { NextConfig } from "next/types";

const withMDX = MDX();

// Webflow Cloud injects COSMIC_MOUNT_PATH (e.g. "/store").
// Fallback to NEXT_PUBLIC_BASE_PATH if you ever set it locally.
const base = (process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, ""); // normalize: no trailing slash

const nextConfig: NextConfig = {
	reactStrictMode: true,

	basePath: base || undefined,
	assetPrefix: base || undefined,

	eslint: {
		ignoreDuringBuilds: true,
	},

	output: process.env.DOCKER ? "standalone" : undefined,

	logging: { fetches: { fullUrl: true } },

	// Clone images object to avoid modifying frozen config
	images: {
		...{},
		remotePatterns: [
			{ protocol: "https", hostname: "files.stripe.com" },
			{ protocol: "https", hostname: "d1wqzb5bdbcre6.cloudfront.net" },
			{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
			{ protocol: "https", hostname: "files.cdn.printful.com" },
			{ protocol: "https", hostname: "files.printful.com" },
			{ protocol: "https", hostname: "images.printful.com" },
			{ protocol: "https", hostname: "uploads-ssl.webflow.com" },
			{ protocol: "https", hostname: "assets.website-files.com" },
			{ protocol: "https", hostname: "**.webflow.io" },
		],
		formats: ["image/avif", "image/webp"],
	},

	transpilePackages: ["next-mdx-remote", "commerce-kit"],

	experimental: {
		esmExternals: true,
		scrollRestoration: true,
	},

	webpack: (config) => ({
		...config,
		resolve: {
			...config.resolve,
			extensionAlias: {
				".js": [".js", ".ts"],
				".jsx": [".jsx", ".tsx"],
			},
		},
	}),

	async rewrites() {
		return [{ source: "/stats/:match*", destination: "https://eu.umami.is/:match*" }];
	},
};

export default withMDX(nextConfig);
