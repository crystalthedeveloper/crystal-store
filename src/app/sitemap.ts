// src/app/sitemap.ts
import * as Commerce from "commerce-kit";
import type { MetadataRoute } from "next";
import { env, publicUrl } from "@/env.mjs";
import StoreConfig from "@/store.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Item = MetadataRoute.Sitemap[number];

type ProductLite = {
	updated?: number;
	metadata?: { slug?: string | null; [k: string]: unknown };
};

function hasSlug(p: ProductLite): p is ProductLite & { metadata: { slug: string } } {
	return typeof p?.metadata?.slug === "string" && p.metadata.slug.length > 0;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	let productUrls: Item[] = [];

	try {
		if (env.STRIPE_SECRET_KEY) {
			type BrowseArgs = Parameters<typeof Commerce.productBrowse>[0];

			// Build args and cast once; no @ts-expect-error, no `any`
			const args = {
				first: 100,
				...(env.STRIPE_SECRET_KEY ? { secretKey: env.STRIPE_SECRET_KEY } : {}),
			} as unknown as BrowseArgs;

			const products = (await Commerce.productBrowse(args)) as unknown as ProductLite[];

			productUrls = products.filter(hasSlug).map((product): Item => {
				const seconds = typeof product.updated === "number" ? product.updated : Math.floor(Date.now() / 1000);
				return {
					url: `${publicUrl}/product/${product.metadata.slug}`,
					lastModified: new Date(seconds * 1000),
					changeFrequency: "daily",
					priority: 0.8,
				};
			});
		} else {
			console.warn("sitemap: STRIPE_SECRET_KEY missing; skipping product URLs.");
		}
	} catch (e) {
		console.warn("sitemap: failed to fetch products; continuing with static URLs.", e);
	}

	const categoryUrls: Item[] = StoreConfig.categories.map(
		(category): Item => ({
			url: `${publicUrl}/category/${category.slug}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.5,
		}),
	);

	return [
		{
			url: publicUrl,
			lastModified: new Date(),
			changeFrequency: "always",
			priority: 1,
		},
		...productUrls,
		...categoryUrls,
	];
}
