// src/app/(store)/category/[slug]/page.tsx
import type { Metadata } from "next";
import Stripe from "stripe";

import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { deslugify } from "@/lib/utils";
import type { NormalizedProduct } from "@/ui/json-ld";
import { ProductList } from "@/ui/products/product-list";
import { YnsLink } from "@/ui/yns-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Build SEO metadata for a category page
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const categoryName = deslugify(slug);
	const t = await getTranslations("/category.metadata");

	const baseMeta: Metadata = {
		title: t("title", { categoryName }),
		alternates: { canonical: `${publicUrl}/store/category/${slug}` },
	};

	if (!env.STRIPE_SECRET_KEY) return baseMeta;

	try {
		const stripe = new Stripe(env.STRIPE_SECRET_KEY);

		// Check if at least 1 product exists in this category
		const products = await stripe.products.list({
			active: true,
			limit: 10,
		});
		const hasProducts = products.data.some((p) => p.metadata?.category === slug);

		return hasProducts
			? baseMeta
			: {
				...baseMeta,
				robots: { index: false, follow: false },
			};
	} catch (err) {
		console.warn("generateMetadata: Stripe request failed", err);
		return baseMeta;
	}
}

/**
 * Category Page
 */
export default async function CategoryPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const categoryName = deslugify(slug);
	const t = await getTranslations("/category.page");

	// Early return if Stripe not configured
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<main className="pb-8">
				<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
					{categoryName}
					<div className="text-lg font-semibold text-muted-foreground">
						{t("title", { categoryName })}
					</div>
				</h1>
				<p className="mt-4 text-sm text-muted-foreground">
					Store preview is disabled in this environment (Stripe is not configured).
				</p>
			</main>
		);
	}

	let products: NormalizedProduct[] = [];
	try {
		const stripe = new Stripe(env.STRIPE_SECRET_KEY);

		// Fetch up to 100 products, expand price info
		const res = await stripe.products.list({
			active: true,
			limit: 100,
			expand: ["data.default_price"],
		});

		products = res.data
			.filter((p) => p.metadata?.category === slug)
			.map((p) => ({
				id: p.id,
				name: p.name,
				description: p.description,
				images: p.images ?? [],
				metadata: p.metadata ?? {},
				default_price: {
					unit_amount: (p.default_price as Stripe.Price | null)?.unit_amount ?? null,
					currency: (p.default_price as Stripe.Price | null)?.currency ?? "usd",
				},
			}));
	} catch (err) {
		console.warn("CategoryPage: Stripe fetch failed; treating as empty category.", err);
	}

	const hasProducts = products.length > 0;

	return (
		<main className="pb-8">
			<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
				{categoryName}
				<div className="text-lg font-semibold text-muted-foreground">
					{t("title", { categoryName })}
				</div>
			</h1>

			{hasProducts ? (
				<ProductList products={products} />
			) : (
				<section className="mt-8 space-y-4">
					<h2 className="text-xl font-semibold leading-tight text-foreground">
						{t("empty.title", { categoryName })}
					</h2>
					<p className="max-w-2xl text-sm text-muted-foreground">
						{t("empty.description", { categoryName })}
					</p>
					<YnsLink
						href="/products"
						className="inline-flex w-fit items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
					>
						{t("empty.cta")}
					</YnsLink>
				</section>
			)}
		</main>
	);
}
