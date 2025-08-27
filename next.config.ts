// next.config.ts
// next.config.ts
import type { NextConfig } from "next";

const base =
	(process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "") || "";

const isWebflow = process.env.WEBFLOW_CLOUD === "true";

const cfg: NextConfig = {
	reactStrictMode: true,
	basePath: base || undefined,
	assetPrefix: base || undefined,

	publicRuntimeConfig: {
		basePath: base || "",
	},

	eslint: { ignoreDuringBuilds: true },
	output: process.env.DOCKER ? "standalone" : undefined,
	logging: { fetches: { fullUrl: true } },

	transpilePackages: ["next-mdx-remote", "commerce-kit"],

	experimental: {
		esmExternals: true,
		scrollRestoration: true,
	},

	webpack: (config) => {
		config.resolve = {
			...(config.resolve || {}),
			extensionAlias: {
				".js": [".js", ".ts"],
				".jsx": [".jsx", ".tsx"],
			},
			fallback: {
				...(config.resolve?.fallback || {}),
				"@neondatabase/serverless": false,
			},
		};
		return config;
	},

	images: isWebflow
		? undefined
		: {
				remotePatterns: [
					{ protocol: "https", hostname: "files.stripe.com" },
					{ protocol: "https", hostname: "files.cdn.printful.com" },
					{ protocol: "https", hostname: "files.printful.com" },
					{ protocol: "https", hostname: "images.printful.com" },
					{ protocol: "https", hostname: "img.printful.com" },
					{ protocol: "https", hostname: "img.youtube.com" },
					{ protocol: "https", hostname: "vumbnail.com" },
					{ protocol: "https", hostname: "uploads-ssl.webflow.com" },
					{ protocol: "https", hostname: "assets.website-files.com" },
					{ protocol: "https", hostname: "**.webflow.io" },
					{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
					{ protocol: "https", hostname: "www.crystalthedeveloper.ca" },
					{ protocol: "https", hostname: "**.cosmic.webflow.services" },
				],
				formats: ["image/avif", "image/webp"],
			},

	async rewrites() {
		return [
			// ✅ Proxy both root (/api/*) and /store/api/* to your deployed backend
			{
				source: "/api/:path*",
				destination: "https://crystals-store.vercel.app/api/:path*",
			},
			{
				source: "/store/api/:path*",
				destination: "https://crystals-store.vercel.app/api/:path*",
			},
			{
				source: "/stats/:match*",
				destination: "https://eu.umami.is/:match*",
			},
		];
	},
};

const config = { ...cfg };
export default config;
try {
	// @ts-ignore
	module.exports = config;
} catch {}
