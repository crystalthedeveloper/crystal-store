// src/app/(store)/product/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { env, publicUrl } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { getProductWithPrices, type KitPrice, type KitProduct } from "@/lib/products/getProductWithPrices";
import { getVariantSelections } from "@/lib/products/getVariantSelections";
import { getWebflowSelections } from "@/lib/products/getWebflowProductData";
import { deslugify, formatProductName } from "@/lib/utils";
import { AddToCartButton } from "@/ui/add-to-cart-button";
import { JsonLd, mappedProductToJsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { MainProductImage } from "@/ui/products/main-product-image";
import { PriceLabel } from "@/ui/products/PriceLabel";
import { SimilarProducts } from "@/ui/products/SimilarProducts";
import { TextPairsSection } from "@/ui/products/TextPairsSection";
import { VariantPickers } from "@/ui/products/VariantPickers";
import { WebflowLinks } from "@/ui/products/WebflowLinks";
import { StickyBottom } from "@/ui/sticky-bottom";
import { YnsLink } from "@/ui/yns-link";

/* --------------------------------
   Build-safety: never prerender
--------------------------------- */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* -------------- Metadata (safe when Stripe is missing) -------------- */
export const generateMetadata = async (props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string; size?: string }>;
}): Promise<Metadata> => {
	const { slug } = await props.params;
	const { color, size } = await props.searchParams;

	// ⚡ If Stripe is missing (eg. Webflow Cloud), don't fetch from API
	if (!env.STRIPE_SECRET_KEY) {
		const canonical = new URL(`${publicUrl}/product/${slug}`);
		if (color) canonical.searchParams.set("color", color);
		if (size) canonical.searchParams.set("size", size);

		return {
			title: deslugify(slug),
			alternates: { canonical },
		};
	}

	try {
		const { product: base } = await getProductWithPrices(slug);
		const t = await getTranslations("/product.metadata");
		const canonical = new URL(`${publicUrl}/product/${base.metadata.slug}`);
		return {
			title: t("title", { productName: formatProductName(base.name, base.metadata.variant) }),
			description: base.description ?? undefined,
			alternates: { canonical },
		};
	} catch {
		return notFound();
	}
};

/* ------------------------------ Page ------------------------------ */
export default async function SingleProductPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string; size?: string; image?: string; debug?: string }>;
}) {
	const { slug } = await props.params;
	const { color, size, image, debug } = await props.searchParams;
	const t = await getTranslations("/product.page");
	const locale = await getLocale();

	/* ✅ Webflow-safe fallback: no Stripe calls */
	if (!env.STRIPE_SECRET_KEY) {
		const title = deslugify(slug);
		return (
			<article className="pb-12">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<YnsLink href="/products">{t("allProducts", { default: "All Products" })}</YnsLink>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{title}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="mt-6 grid gap-6 lg:grid-cols-12">
					<div className="lg:col-span-7">
						<div className="aspect-square w-full rounded-lg bg-neutral-100 flex items-center justify-center">
							<span className="text-neutral-400">No Image (Stripe disabled)</span>
						</div>
					</div>
					<div className="lg:col-span-5">
						<h1 className="text-3xl font-bold leading-none tracking-tight">{title}</h1>
						<p className="mt-2 text-neutral-600">
							Store preview is disabled in this environment. Checkout is unavailable.
						</p>
					</div>
				</div>
			</article>
		);
	}

	/* ✅ Normal path (Stripe present) */
	let product: KitProduct;
	let prices: KitPrice[];
	try {
		({ product, prices } = await getProductWithPrices(slug));
	} catch {
		return notFound();
	}

	const isApparel = (product.metadata?.category ?? "").toLowerCase() === "apparel";

	const { allColors, sizesForColor, selectedColor, selectedSize, selectedPrice } = isApparel
		? getVariantSelections(prices, { color, size })
		: {
				allColors: [] as string[],
				sizesForColor: [] as string[],
				selectedColor: undefined,
				selectedSize: undefined,
				selectedPrice: (product.default_price as unknown as KitPrice) ?? undefined,
			};

	const baseImages = Array.isArray(product.images) ? product.images : [];
	const selectedPriceImage = isApparel ? (selectedPrice?.metadata?.image_url ?? "") : "";
	const images = selectedPriceImage
		? [selectedPriceImage, ...baseImages.filter((i) => i !== selectedPriceImage)]
		: baseImages;

	const imageIndex = typeof image === "string" ? Number(image) : 0;
	const mainImage = images[imageIndex] ?? images[0];

	const webflow = await getWebflowSelections(product, selectedPrice);
	const { isWebflow, links, featurePairs, license } = webflow;

	const displayAmount = selectedPrice?.unit_amount ?? product.default_price?.unit_amount ?? null;
	const displayCurrency = selectedPrice?.currency ?? product.default_price?.currency ?? undefined;

	return (
		<article className="pb-12">
			{process.env.NODE_ENV === "development" && debug === "meta" && (
				<pre className="mb-4 overflow-auto rounded border bg-neutral-50 p-3 text-xs text-neutral-700">
					{JSON.stringify({ product, prices }, null, 2)}
				</pre>
			)}

			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<YnsLink href="/products">{t("allProducts")}</YnsLink>
						</BreadcrumbLink>
					</BreadcrumbItem>
					{product.metadata?.category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<YnsLink href={`/category/${product.metadata.category}`}>
										{deslugify(product.metadata.category)}
									</YnsLink>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{product.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<StickyBottom product={product} locale={locale}>
				<div className="mt-4 grid gap-4 lg:grid-cols-12">
					<div className="lg:col-span-5 lg:col-start-8">
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<PriceLabel amount={displayAmount} currency={displayCurrency} locale={locale} />
					</div>

					<div className="lg:col-span-7">
						{mainImage && (
							<MainProductImage
								className="w-full rounded-lg bg-neutral-100 object-cover"
								src={mainImage}
								loading="eager"
								priority
								alt={product.name}
							/>
						)}
					</div>

					<div className="grid gap-8 lg:col-span-5">
						<section>
							<div className="prose">
								<Markdown source={product.description || ""} />
							</div>
						</section>

						{isWebflow && (links.length > 0 || featurePairs.length > 0 || !!license) && (
							<>
								<WebflowLinks links={links} />
								{featurePairs.length > 0 && <TextPairsSection heading="Features" items={featurePairs} />}
								{license && <TextPairsSection heading="License" raw={license} />}
							</>
						)}

						<VariantPickers
							isApparel={isApparel}
							allColors={allColors}
							sizesForColor={sizesForColor}
							selectedColor={selectedColor}
							selectedSize={selectedSize}
						/>

						<AddToCartButton productId={product.id} disabled={product.metadata.stock <= 0} />
					</div>
				</div>
			</StickyBottom>

			<Suspense>
				<SimilarProducts id={product.id} />
			</Suspense>
			<Suspense>
				<ProductImageModal images={images} />
			</Suspense>

			<JsonLd jsonLd={mappedProductToJsonLd(product)} />
		</article>
	);
}
