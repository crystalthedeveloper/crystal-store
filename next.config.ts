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
			// 👇 stub out Neon so Webflow build doesn’t fail
			fallback: {
				...(config.resolve?.fallback || {}),
				"@neondatabase/serverless": false,
			},
		};
		return config;
	},

	// Always include images config unless explicitly disabled
	images: isWebflow
		? undefined
		: {
				remotePatterns: [
					// Stripe
					{ protocol: "https", hostname: "files.stripe.com" },
					// Printful
					{ protocol: "https", hostname: "files.cdn.printful.com" },
					{ protocol: "https", hostname: "files.printful.com" },
					{ protocol: "https", hostname: "images.printful.com" },
					{ protocol: "https", hostname: "img.printful.com" },
					// Video thumbs
					{ protocol: "https", hostname: "img.youtube.com" },
					{ protocol: "https", hostname: "vumbnail.com" },
					// Webflow-related
					{ protocol: "https", hostname: "uploads-ssl.webflow.com" },
					{ protocol: "https", hostname: "assets.website-files.com" },
					{ protocol: "https", hostname: "**.webflow.io" },
					// Vercel storage (keep if you still use it)
					{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
					// Your domain
					{ protocol: "https", hostname: "www.crystalthedeveloper.ca" },
				],
				formats: ["image/avif", "image/webp"],
			},

	async rewrites() {
		return [
			{
				source: "/stats/:match*",
				destination: "https://eu.umami.is/:match*",
			},
		];
	},
};

// Export both ESM + CJS so Webflow doesn’t break
const config = { ...cfg };
export default config;
try {
	// @ts-ignore
	module.exports = config;
} catch {}
