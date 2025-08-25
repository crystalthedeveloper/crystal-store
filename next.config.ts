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

	...(isWebflow
		? {}
		: {
				images: {
					remotePatterns: [
						{ protocol: "https", hostname: "files.stripe.com" },
						{ protocol: "https", hostname: "img.youtube.com" },
						{ protocol: "https", hostname: "vumbnail.com" },
						{ protocol: "https", hostname: "files.cdn.printful.com" },
						{ protocol: "https", hostname: "img.printful.com" },
						{ protocol: "https", hostname: "www.crystalthedeveloper.ca" }, // ✅ allow your logo
					],
				},
			}),

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
