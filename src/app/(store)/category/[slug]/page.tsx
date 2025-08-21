// src/app/(store)/category/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { deslugify } from "@/lib/utils";
import { ProductList } from "@/ui/products/product-list";

export const runtime = "nodejs"; // server-only libs
export const dynamic = "force-dynamic"; // don’t prerender
export const revalidate = 0;

// Infer item type from commerce-kit's productBrowse without importing at build time
type ProductFromBrowse = Awaited<
	ReturnType<typeof import("commerce-kit")["productBrowse"]>
> extends (infer T)[]
	? T
	: never;

export const generateMetadata = async (props: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
	const { slug } = await props.params;
	const t = await getTranslations("/category.metadata");

	// If Stripe isn’t configured, just return basic metadata
	if (!env.STRIPE_SECRET_KEY) {
		return {
			title: t("title", { categoryName: deslugify(slug) }),
			alternates: { canonical: `${publicUrl}/category/${slug}` },
		};
	}

	// Stripe exists: check if the category has any products
	try {
		const { productBrowse } = await import("commerce-kit");
		const products = await productBrowse({ first: 1, filter: { category: slug } });
		if (products.length === 0) {
			return notFound();
		}
	} catch {
		// On fetch error, still return basic metadata (don’t 500 the head)
	}

	return {
		title: t("title", { categoryName: deslugify(slug) }),
		alternates: { canonical: `${publicUrl}/category/${slug}` },
	};
};

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
	const { slug } = await props.params;
	const t = await getTranslations("/category.page");

	// No Stripe: render safe preview (no product list)
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

	// Stripe exists: load products dynamically
	let products: ProductFromBrowse[] = [];
	try {
		const { productBrowse } = await import("commerce-kit");
		products = await productBrowse({ first: 100, filter: { category: slug } });
	} catch (e) {
		console.warn("CategoryPage: productBrowse failed; treating as empty category.", e);
	}

	if (products.length === 0) {
		return notFound();
	}

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
