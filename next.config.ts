// next.config.ts
import MDX from "@next/mdx";
import type { NextConfig } from "next/types";

// MDX enhancer type
type Enhance = (config: NextConfig) => NextConfig;
const withMDXEnhancer = MDX() as unknown as Enhance;

export default function nextConfigFactory(): NextConfig {
	const isCloud = Boolean(process.env.COSMIC_MOUNT_PATH);

	// Normalize base path for Cloud mounts like "/store"
	const base = (process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

	const baseConfig: NextConfig = {
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

	// Disable MDX on Webflow Cloud to avoid the frozen-config mutation crash
	return isCloud ? baseConfig : withMDXEnhancer(baseConfig);
}
