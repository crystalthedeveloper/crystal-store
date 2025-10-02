// src/app/(store)/category/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Stripe from "stripe";

import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { deslugify } from "@/lib/utils";
import type { NormalizedProduct } from "@/ui/json-ld";
import { ProductList } from "@/ui/products/product-list";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Build SEO metadata for a category page
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const t = await getTranslations("/category.metadata");

	const baseMeta: Metadata = {
		title: t("title", { categoryName: deslugify(slug) }),
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

		return hasProducts ? baseMeta : baseMeta;
	} catch (err) {
		console.warn("generateMetadata: Stripe request failed", err);
		return baseMeta;
	}
}

/**
 * Category Page
 */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const t = await getTranslations("/category.page");

	// Early return if Stripe not configured
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<main className="pb-8">
				<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
					{deslugify(slug)}
					<div className="text-lg font-semibold text-muted-foreground">
						{t("title", { categoryName: deslugify(slug) })}
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

	if (products.length === 0) notFound();

	return (
		<main className="pb-8">
			<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
				{deslugify(slug)}
				<div className="text-lg font-semibold text-muted-foreground">
					{t("title", { categoryName: deslugify(slug) })}
				</div>
			</h1>
			<ProductList products={products} />
		</main>
	);
}
