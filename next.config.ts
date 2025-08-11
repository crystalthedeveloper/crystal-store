// next.config.ts
import type { NextConfig } from "next";

const base = (process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const config: NextConfig = {
	reactStrictMode: true,

	// Webflow Cloud mount awareness
	basePath: base || undefined,
	assetPrefix: base || undefined,

	eslint: { ignoreDuringBuilds: true },
	output: process.env.DOCKER ? "standalone" : undefined,
	logging: { fetches: { fullUrl: true } },

	// Define images here so it's already writable and includes Stripe
	images: {
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

	experimental: { esmExternals: true, scrollRestoration: true },

	webpack: (cfg) => ({
		...cfg,
		resolve: {
			...cfg.resolve,
			extensionAlias: { ".js": [".js", ".ts"], ".jsx": [".jsx", ".tsx"] },
		},
	}),

	async rewrites() {
		return [{ source: "/stats/:match*", destination: "https://eu.umami.is/:match*" }];
	},
};

export default config;
