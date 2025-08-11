// next.config.ts
import MDX from "@next/mdx";
import type { NextConfig } from "next/types";

// Keep types strict, avoid `any`
type Enhance = (config: NextConfig) => NextConfig;
const withMDX: Enhance = MDX() as unknown as Enhance;

const isCloud = Boolean(process.env.COSMIC_MOUNT_PATH);
const base = (process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

const config: NextConfig = {
	reactStrictMode: true,

	// Active on Cloud, noop on Vercel (when base is empty)
	basePath: base || undefined,
	assetPrefix: base || undefined,

	eslint: { ignoreDuringBuilds: true },

	// only enable standalone output inside Docker images
	output: process.env.DOCKER ? "standalone" : undefined,

	logging: { fetches: { fullUrl: true } },

	// Fresh object so nobody mutates a frozen one
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

	experimental: {
		esmExternals: true,
		scrollRestoration: true,
	},

	webpack: (cfg) => ({
		...cfg,
		resolve: {
			...cfg.resolve,
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

// Export a plain, mutable object. On Cloud, skip MDX to avoid the freeze/mutation crash.
const finalConfig: NextConfig = isCloud ? config : withMDX(config);
export default finalConfig;
