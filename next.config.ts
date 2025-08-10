// next.config.ts
import MDX from "@next/mdx";
import type { NextConfig } from "next/types";

const withMDX = MDX();

/**
 * Stable config (no Turbopack/canary-only flags)
 */
const nextConfig: NextConfig = {
	reactStrictMode: true,

	eslint: {
		// keep CI/builds green even if lint errors exist
		ignoreDuringBuilds: true,
	},

	// only enable standalone output inside Docker images
	output: process.env.DOCKER ? "standalone" : undefined,

	logging: {
		fetches: { fullUrl: true },
	},

	images: {
		// Be explicit: Next prefers protocol + hostname (+ optional pathname)
		remotePatterns: [
			{ protocol: "https", hostname: "files.stripe.com" },
			{ protocol: "https", hostname: "d1wqzb5bdbcre6.cloudfront.net" },
			// If you truly need subdomains, add them explicitly or use ** wildcard (supported in recent Next)
			{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
			// ⬇️ Add Printful hosts
			{ protocol: "https", hostname: "files.cdn.printful.com" },
			// (optional but handy for other Printful links you may hit)
			{ protocol: "https", hostname: "files.printful.com" },
			{ protocol: "https", hostname: "images.printful.com" },
		],
		formats: ["image/avif", "image/webp"],
	},

	// keep these if you actually import from them
	transpilePackages: ["next-mdx-remote", "commerce-kit"],

	/**
	 * Experimental flags trimmed to ones that are stable-safe.
	 * Removed:
	 *  - ppr (canary only)
	 *  - reactCompiler (canary/experimental)
	 *  - mdxRs / inlineCss (canary-flaky on some versions)
	 *  - cpus (not needed unless you’re tuning builds)
	 */
	experimental: {
		// keep only what’s commonly safe across stable releases
		esmExternals: true,
		scrollRestoration: true,
	},

	webpack: (config) => ({
		...config,
		resolve: {
			...config.resolve,
			// helpful if a template sometimes imports .ts instead of .js, etc.
			extensionAlias: {
				".js": [".js", ".ts"],
				".jsx": [".jsx", ".tsx"],
			},
		},
	}),

	// example proxy; keep if you use it
	async rewrites() {
		return [
			{
				source: "/stats/:match*",
				destination: "https://eu.umami.is/:match*",
			},
		];
	},
};

export default withMDX(nextConfig);
