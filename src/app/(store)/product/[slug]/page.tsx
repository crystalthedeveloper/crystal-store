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
import { JsonLd, mappedProductToJsonLd, type NormalizedProduct } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { MainProductImage } from "@/ui/products/main-product-image";
import { PriceLabel } from "@/ui/products/PriceLabel";
import { SimilarProducts } from "@/ui/products/SimilarProducts";
import { TextPairsSection } from "@/ui/products/TextPairsSection";
import { VariantPickers } from "@/ui/products/VariantPickers";
import { WebflowLinks } from "@/ui/products/WebflowLinks";
import { StickyBottom } from "@/ui/sticky-bottom";
import { YnsLink } from "@/ui/yns-link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = async (props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string; size?: string }>;
}): Promise<Metadata> => {
	const { slug } = await props.params;
	const { color, size } = await props.searchParams;

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
		const isApparel = (base.metadata?.category ?? "").toLowerCase() === "apparel";
		if (isApparel) {
			if (color) canonical.searchParams.set("color", color);
			if (size) canonical.searchParams.set("size", size);
		}
		return {
			title: t("title", { productName: formatProductName(base.name, base.metadata.variant) }),
			description: base.description ?? undefined,
			alternates: { canonical },
		};
	} catch {
		return notFound();
	}
};

export default async function SingleProductPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string; size?: string; image?: string; debug?: string; disable?: string }>;
}) {
	const { slug } = await props.params;
	const { color, size, image, debug, disable } = await props.searchParams;
	const t = await getTranslations("/product.page");
	const locale = await getLocale();

	if (!env.STRIPE_SECRET_KEY) {
		const title = deslugify(slug);
		return (
			<article className="pb-12">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
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
						<div className="aspect-square w-full rounded-lg bg-neutral-100" />
					</div>
					<div className="lg:col-span-5">
						<h1 className="text-3xl font-bold leading-none tracking-tight">{title}</h1>
						<p className="mt-2 text-neutral-600">
							Store preview is disabled in this environment (Stripe not configured).
						</p>
					</div>
				</div>
			</article>
		);
	}

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

	// ✅ Safer image index parsing
	const imageIndex = Number.isFinite(Number(image)) ? Number(image) : 0;
	const mainImage = images[imageIndex] ?? images[0];

	// ✅ Wrap Webflow fetch in try/catch with proper type
	let webflow: Awaited<ReturnType<typeof getWebflowSelections>> = {
		isWebflow: false,
		links: [],
		featurePairs: [],
		license: "",
	};
	try {
		webflow = await getWebflowSelections(product, selectedPrice);
	} catch (err) {
		console.warn("⚠️ Webflow data fetch failed:", err);
	}
	const { isWebflow, links, featurePairs, license } = webflow;

	const displayAmount = selectedPrice?.unit_amount ?? product.default_price?.unit_amount ?? null;
	const displayCurrency =
		selectedPrice?.currency ?? product.default_price?.currency ?? env.STRIPE_CURRENCY ?? "usd";

	// ✅ Fix disable flag logic
	const forceDisabled = disable === "true";

	// ✅ Parse stock safely from metadata
	const stock = Number(product.metadata?.stock ?? Infinity);

	const stickyProduct = {
		id: product.id,
		name: product.name,
		images,
		metadata: { ...(product.metadata ?? {}) },
		default_price: {
			id: selectedPrice?.id ?? product.default_price?.id ?? undefined,
			unit_amount: displayAmount,
			currency: displayCurrency.toString().toUpperCase(),
		},
	};

	const normalizedForJsonLd: NormalizedProduct = {
		id: product.id,
		name: product.name,
		description: product.description,
		images: Array.isArray(product.images) ? product.images : [],
		metadata: { ...(product.metadata ?? {}) },
		default_price: {
			unit_amount: displayAmount,
			currency: displayCurrency.toString().toUpperCase(),
		},
	};

	return (
		<article className="pb-12">
			{process.env.NODE_ENV === "development" && debug === "meta" && (
				<pre className="mb-4 overflow-auto rounded border bg-neutral-50 p-3 text-xs text-neutral-700">
					{JSON.stringify(
						{
							category: product.metadata?.category,
							isWebflow,
							hasSelectedPriceMeta: !!selectedPrice?.metadata,
							links,
							featurePairsCount: featurePairs.length,
							hasLicense: !!license,
						},
						null,
						2,
					)}
				</pre>
			)}

			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
							<YnsLink href="/products">{t("allProducts")}</YnsLink>
						</BreadcrumbLink>
					</BreadcrumbItem>

					{product.metadata?.category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
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

					{isApparel && (selectedColor || selectedSize) && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{[selectedColor, selectedSize].filter(Boolean).join(" / ")}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			<StickyBottom product={stickyProduct} locale={locale}>
				<div className="mt-4 grid gap-4 lg:grid-cols-12">
					<div className="lg:col-span-5 lg:col-start-8">
						<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">{product.name}</h1>
						<PriceLabel amount={displayAmount} currency={displayCurrency} locale={locale} />
						<div className="mt-2">{stock <= 0 && <div>Out of stock</div>}</div>
					</div>

					<div className="lg:col-span-7 lg:row-span-3 lg:row-start-1">
						<h2 className="sr-only">{t("imagesTitle")}</h2>

						<div className="grid gap-4 lg:grid-cols-3 [&>*:first-child]:col-span-3">
							{mainImage && (
								<MainProductImage
									className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
									src={mainImage}
									loading="eager"
									priority
									alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ""}${selectedSize ? ` / ${selectedSize}` : ""}`}
								/>
							)}

							{images.slice(1).map((img, idx) => {
								const qp = new URLSearchParams();
								if (isApparel && selectedColor) qp.set("color", selectedColor);
								if (isApparel && selectedSize) qp.set("size", selectedSize);
								qp.set("image", String(idx + 1));
								return (
									<YnsLink key={`${img}-${idx}`} href={`?${qp}`} scroll={false}>
										<Image
											className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
											src={img}
											width={700 / 3}
											height={700 / 3}
											sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 225px"
											loading="lazy"
											alt={`${product.name} thumbnail ${idx + 1}${selectedColor ? ` - ${selectedColor}` : ""}${selectedSize ? ` / ${selectedSize}` : ""}`}
										/>
									</YnsLink>
								);
							})}
						</div>
					</div>

					<div className="grid gap-8 lg:col-span-5">
						<div>
							<h2 className="sr-only">{t("descriptionTitle")}</h2>
							<div className="prose text-secondary-foreground [&>p]:m-0">
								<Markdown source={product.description || ""} />
							</div>
						</div>

						{isWebflow && (links.length > 0 || featurePairs.length > 0 || !!license) && (
							<>
								<WebflowLinks links={links} />
								{featurePairs.length > 0 && (
									<TextPairsSection heading="Features" items={featurePairs} defaultOpen />
								)}
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

						<AddToCartButton
							productId={product.id}
							priceId={selectedPrice?.id ?? ""}
							name={product.name}
							image={selectedPrice?.metadata?.image_url ?? product.images?.[0]}
							price={selectedPrice?.unit_amount ?? product.default_price?.unit_amount ?? 0}
							currency={selectedPrice?.currency ?? product.default_price?.currency ?? "cad"}
							variant={product.metadata?.variant}
							color={selectedPrice?.metadata?.color}
							size={selectedPrice?.metadata?.size}
							disabled={forceDisabled}
						/>
					</div>
				</div>
			</StickyBottom>

			<Suspense>
				<SimilarProducts id={product.id} />
			</Suspense>

			<Suspense>
				<ProductImageModal images={images} />
			</Suspense>

			<JsonLd jsonLd={mappedProductToJsonLd(normalizedForJsonLd)} />
		</article>
	);
}
