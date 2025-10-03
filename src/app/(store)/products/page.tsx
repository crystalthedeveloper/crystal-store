// src/app/(store)/products/page.tsx
import type { Metadata } from "next";
import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { type MappedProduct, productBrowse } from "@/lib/stripe/commerce";
import { ProductList } from "@/ui/products/product-list";

export const runtime = "nodejs"; // server-only libs
export const dynamic = "force-dynamic"; // don’t prerender
export const revalidate = 0;

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("/products.metadata");
	return {
		title: t("title"),
		alternates: { canonical: `${publicUrl}/products` },
	};
};

type ProductFromBrowse = MappedProduct;

export default async function AllProductsPage() {
	const t = await getTranslations("/products.page");

	// If Stripe isn’t configured (e.g. Webflow Cloud build), render a safe preview
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<main className="pb-8">
				<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">{t("title")}</h1>
				<p className="mt-4 text-sm text-muted-foreground">
					Store preview is disabled in this environment (Stripe is not configured).
				</p>
			</main>
		);
	}

	// Stripe exists: load product catalog directly from Stripe
	let products: ProductFromBrowse[] = [];
	try {
		products = await productBrowse({ first: 100 });
	} catch (e) {
		console.warn("AllProductsPage: productBrowse failed; rendering without products.", e);
	}

	return (
		<main className="pb-8">
			<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">{t("title")}</h1>
			{products.length > 0 ? (
				<ProductList products={products} />
			) : (
				<p className="mt-4 text-sm text-muted-foreground">No products to display right now.</p>
			)}
		</main>
	);
}
