// next.config.ts
import MDX from "@next/mdx";
import type { NextConfig } from "next/types";

const withMDX = MDX();

export default withMDX((phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
	// Webflow Cloud injects COSMIC_MOUNT_PATH (e.g. "/store")
	const base = (process.env.COSMIC_MOUNT_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

	// Merge images safely (don’t assign on defaultConfig)
	const mergedImages: NonNullable<NextConfig["images"]> = {
		...(defaultConfig.images || {}),
		remotePatterns: [
			...(defaultConfig.images?.remotePatterns ?? []),
			{ protocol: "https", hostname: "files.stripe.com" },
			{ protocol: "https", hostname: "d1wqzb5bdbcre6.cloudfront.net" },
			{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
			{ protocol: "https", hostname: "files.cdn.printful.com" },
			{ protocol: "https", hostname: "files.printful.com" },
			{ protocol: "https", hostname: "images.printful.com" },
			// Webflow assets
			{ protocol: "https", hostname: "uploads-ssl.webflow.com" },
			{ protocol: "https", hostname: "assets.website-files.com" },
			{ protocol: "https", hostname: "**.webflow.io" },
		],
		formats: ["image/avif", "image/webp"],
	};

	// If you kept a custom webpack, wrap it so we don’t lose it
	const userWebpack = defaultConfig.webpack;

	return {
		...defaultConfig,

		reactStrictMode: true,

		// Mount awareness (noop on Vercel, active on Webflow Cloud)
		basePath: base || undefined,
		assetPrefix: base || undefined,

		eslint: { ignoreDuringBuilds: true },

		// only enable standalone output inside Docker images
		output: process.env.DOCKER ? "standalone" : undefined,

		logging: { fetches: { fullUrl: true } },

		images: mergedImages,

		transpilePackages: ["next-mdx-remote", "commerce-kit"],

		experimental: {
			...(defaultConfig.experimental || {}),
			esmExternals: true,
			scrollRestoration: true,
		},

		webpack: (config, ctx) => {
			const nextCfg = {
				...config,
				resolve: {
					...config.resolve,
					extensionAlias: {
						".js": [".js", ".ts"],
						".jsx": [".jsx", ".tsx"],
					},
				},
			};
			return userWebpack ? userWebpack(nextCfg, ctx) : nextCfg;
		},

		async rewrites() {
			// Merge with any existing rewrites if present
			const existing =
				typeof defaultConfig.rewrites === "function"
					? await defaultConfig.rewrites()
					: defaultConfig.rewrites || [];

			// If existing is the object form {beforeFiles/afterFiles/fallback}, keep it;
			// otherwise, treat as array and append ours.
			if (!Array.isArray(existing)) return existing;
			return [...existing, { source: "/stats/:match*", destination: "https://eu.umami.is/:match*" }];
		},
	} satisfies NextConfig;
});
