// src/app/(store)/category/[slug]/page.tsx
import type { Metadata } from "next";
import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { type MappedProduct, productBrowse } from "@/lib/stripe/commerce";
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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const categoryName = deslugify(slug);
	const t = await getTranslations("/category.metadata");

	const baseMeta: Metadata = {
		title: t("title", { categoryName }),
		alternates: { canonical: `${publicUrl}/store/category/${slug}` },
	};

	if (!env.STRIPE_SECRET_KEY) return baseMeta;

	try {
		const products = await productBrowse({ first: 1, filter: { category: slug } });

		return products.length > 0
			? baseMeta
			: {
					...baseMeta,
					robots: { index: false, follow: false },
				};
	} catch (err) {
		console.warn("[category][metadata] Stripe browse failed", err);
		return baseMeta;
	}
}

const mapProductToNormalized = (product: MappedProduct, slug: string): NormalizedProduct => {
	return {
		id: product.id,
		name: product.name,
		description: product.description,
		images: product.images ?? [],
		metadata: {
			...product.metadata,
			category: product.metadata.category ?? slug,
		},
		default_price: {
			unit_amount: product.default_price.unit_amount ?? null,
			currency: product.default_price.currency ?? env.STRIPE_CURRENCY ?? "usd",
		},
	};
};

/**
 * Category Page
 */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const categoryName = deslugify(slug);
	const t = await getTranslations("/category.page");

	// Early return if Stripe not configured
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<main className="pb-8">
				<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
					{categoryName}
					<div className="text-lg font-semibold text-muted-foreground">{t("title", { categoryName })}</div>
				</h1>
				<p className="mt-4 text-sm text-muted-foreground">
					Store preview is disabled in this environment (Stripe is not configured).
				</p>
			</main>
		);
	}

	let products: NormalizedProduct[] = [];
	try {
		const results = await productBrowse({ filter: { category: slug }, first: 100 });
		const ordered = results.sort((a, b) => {
			const aOrder = Number(a.metadata.order ?? Infinity);
			const bOrder = Number(b.metadata.order ?? Infinity);
			return aOrder - bOrder;
		});
		products = ordered.map((product) => mapProductToNormalized(product, slug));
		console.log("[category] products loaded", {
			slug,
			found: results.length,
			ordered: products.length,
			ids: products.map((p) => p.id),
		});
	} catch (err) {
		console.warn("[category] Stripe browse failed; treating as empty category.", err);
	}

	const hasProducts = products.length > 0;

	return (
		<main className="pb-8">
			<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
				{categoryName}
				<div className="text-lg font-semibold text-muted-foreground">{t("title", { categoryName })}</div>
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
