// src/app/(store)/product/[slug]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal"; // ✅ add back
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { publicUrl } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { getProductWithPrices, type KitPrice, type KitProduct } from "@/lib/products/getProductWithPrices";
import { getVariantSelections } from "@/lib/products/getVariantSelections";
import { getRecommendedProducts } from "@/lib/search/trieve";
import { cn, deslugify, formatMoney, formatProductName } from "@/lib/utils";
import type { TrieveProductMetadata } from "@/scripts/upload-trieve";
import { AddToCartButton } from "@/ui/add-to-cart-button";
import { JsonLd, mappedProductToJsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { MainProductImage } from "@/ui/products/main-product-image";
import { StickyBottom } from "@/ui/sticky-bottom";
import { YnsLink } from "@/ui/yns-link";

/* ---------------- helpers ---------------- */
function isUrl(v?: string): v is string {
	return typeof v === "string" && /^https?:\/\//i.test(v);
}

/** Parse "Title - Text - Title - Text ..." into [{title, text}] */
function parseFeaturePairs(raw?: string): Array<{ title: string; text: string }> {
	if (!raw) return [];
	const parts = raw
		.split(" - ")
		.map((s) => s.trim())
		.filter(Boolean);
	const items: Array<{ title: string; text: string }> = [];
	for (let i = 0; i < parts.length; i += 2) {
		const title = parts[i] ?? "";
		const text = parts[i + 1] ?? "";
		if (title || text) items.push({ title, text });
	}
	return items;
}

/* ------------------ Metadata (Apparel-aware) ------------------ */
export const generateMetadata = async (props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string; size?: string }>;
}): Promise<Metadata> => {
	const { slug } = await props.params;
	const { color, size } = await props.searchParams;

	let base: KitProduct;
	try {
		({ product: base } = await getProductWithPrices(slug));
	} catch {
		return notFound();
	}

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
};

/* ------------------------------ Page ------------------------------ */
export default async function SingleProductPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string; size?: string; image?: string }>;
}) {
	const { slug } = await props.params;
	const { color, size, image } = await props.searchParams;

	let product: KitProduct;
	let prices: KitPrice[];
	try {
		({ product, prices } = await getProductWithPrices(slug));
	} catch {
		return notFound();
	}

	const isApparel = (product.metadata?.category ?? "").toLowerCase() === "apparel";
	const t = await getTranslations("/product.page");
	const locale = await getLocale();

	// Variants
	const { allColors, sizesForColor, selectedColor, selectedSize, selectedPrice } = isApparel
		? getVariantSelections(prices, { color, size })
		: {
				allColors: [] as string[],
				sizesForColor: [] as string[],
				selectedColor: undefined,
				selectedSize: undefined,
				selectedPrice: (product.default_price as unknown as KitPrice) ?? undefined,
			};

	// Images (prefer variant image_url)
	const baseImages = Array.isArray(product.images) ? product.images : [];
	const selectedPriceImage = isApparel ? (selectedPrice?.metadata?.image_url ?? "") : "";
	const images = selectedPriceImage
		? [selectedPriceImage, ...baseImages.filter((i) => i !== selectedPriceImage)]
		: baseImages;

	const imageIndex = typeof image === "string" ? Number(image) : 0;
	const mainImage = images[imageIndex] ?? images[0];

	const category = product.metadata.category;

	// ✅ Safely read only string metadata from Stripe (ignore unknown keys)
	const rawMeta = (product.metadata ?? {}) as Record<string, unknown>;

	const meta = {
		demo_url: typeof rawMeta.demo_url === "string" ? rawMeta.demo_url : undefined,
		website_url: typeof rawMeta.website_url === "string" ? rawMeta.website_url : undefined,
		features: typeof rawMeta.features === "string" ? rawMeta.features : undefined,
		license: typeof rawMeta.license === "string" ? rawMeta.license : undefined,
	};

	const featurePairs = parseFeaturePairs(meta.features);

	return (
		<article className="pb-12">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
							<YnsLink href="/products">{t("allProducts")}</YnsLink>
						</BreadcrumbLink>
					</BreadcrumbItem>

					{category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink className="inline-flex min-h-12 min-w-12 items-center justify-center" asChild>
									<YnsLink href={`/category/${category}`}>{deslugify(category)}</YnsLink>
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
								<BreadcrumbPage>
									{[selectedColor && deslugify(selectedColor), selectedSize && deslugify(selectedSize)]
										.filter(Boolean)
										.join(" / ")}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			<StickyBottom product={product} locale={locale}>
				<div className="mt-4 grid gap-4 lg:grid-cols-12">
					<div className="lg:col-span-5 lg:col-start-8">
						<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">{product.name}</h1>

						{selectedPrice?.unit_amount != null ? (
							<p className="mt-2 text-2xl font-medium leading-none tracking-tight text-foreground/70">
								{formatMoney({ amount: selectedPrice.unit_amount, currency: selectedPrice.currency, locale })}
							</p>
						) : product.default_price?.unit_amount ? (
							<p className="mt-2 text-2xl font-medium leading-none tracking-tight text-foreground/70">
								{formatMoney({
									amount: product.default_price.unit_amount,
									currency: product.default_price.currency,
									locale,
								})}
							</p>
						) : null}

						<div className="mt-2">
							{typeof product.metadata.stock === "number" && product.metadata.stock <= 0 && (
								<div>Out of stock</div>
							)}
						</div>
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
									alt=""
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
											loading="eager"
											priority
											alt=""
										/>
									</YnsLink>
								);
							})}
						</div>
					</div>

					<div className="grid gap-8 lg:col-span-5">
						<section>
							<h2 className="sr-only">{t("descriptionTitle")}</h2>
							<div className="prose text-secondary-foreground">
								<Markdown source={product.description || ""} />
							</div>
						</section>

						{(isUrl(meta.demo_url) || isUrl(meta.website_url)) && (
							<div className="mt-6 flex flex-wrap gap-3">
								{isUrl(meta.demo_url) && (
									<a
										href={meta.demo_url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-100"
									>
										View Live Demo
									</a>
								)}
								{isUrl(meta.website_url) && (
									<a
										href={meta.website_url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-100"
									>
										Visit Website
									</a>
								)}
							</div>
						)}

						{featurePairs.length > 0 && (
							<section className="mt-8">
								<h3 className="mb-3 text-lg font-semibold">Features</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									{featurePairs.map(({ title, text }, i) => (
										<div key={`${title}-${i}`} className="rounded-lg border bg-card p-4 shadow-sm">
											{title && (
												<p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
													Features
												</p>
											)}
											{title && <h4 className="mt-1 text-base font-medium">{title}</h4>}
											{text && <p className="mt-2 text-sm text-secondary-foreground">{text}</p>}
										</div>
									))}
								</div>
							</section>
						)}

						{meta.license && (
							<section className="mt-8">
								<h3 className="mb-3 text-lg font-semibold">License</h3>
								<p className="whitespace-pre-line text-sm text-secondary-foreground">{meta.license}</p>
							</section>
						)}

						{isApparel && allColors.length > 0 && (
							<div className="grid gap-2">
								<p className="text-base font-medium" id="color-label">
									Color
								</p>
								<ul role="list" className="grid grid-cols-4 gap-2" aria-labelledby="color-label">
									{allColors.map((c) => {
										const qp = new URLSearchParams();
										qp.set("color", c);
										if (selectedSize) qp.set("size", selectedSize);
										const isSelected = c === selectedColor;
										return (
											<li key={c}>
												<YnsLink
													scroll={false}
													prefetch
													href={`?${qp}`}
													className={cn(
														"flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 transition-colors hover:bg-neutral-100",
														isSelected && "border-black bg-neutral-50 font-medium",
													)}
													aria-selected={isSelected}
												>
													{deslugify(c)}
												</YnsLink>
											</li>
										);
									})}
								</ul>
							</div>
						)}

						{isApparel && sizesForColor.length > 0 && (
							<div className="grid gap-2">
								<p className="text-base font-medium" id="size-label">
									Size
								</p>
								<ul role="list" className="grid grid-cols-4 gap-2" aria-labelledby="size-label">
									{sizesForColor.map((s) => {
										const qp = new URLSearchParams();
										if (selectedColor) qp.set("color", selectedColor);
										qp.set("size", s);
										const isSelected = s === selectedSize;
										return (
											<li key={s}>
												<YnsLink
													scroll={false}
													prefetch
													href={`?${qp}`}
													className={cn(
														"flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 transition-colors hover:bg-neutral-100",
														isSelected && "border-black bg-neutral-50 font-medium",
													)}
													aria-selected={isSelected}
												>
													{deslugify(s)}
												</YnsLink>
											</li>
										);
									})}
								</ul>
							</div>
						)}

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

async function SimilarProducts({ id }: { id: string }) {
	const products = await getRecommendedProducts({ productId: id, limit: 4 });
	if (!products) return null;

	return (
		<section className="py-12">
			<div className="mb-8">
				<h2 className="text-2xl font-bold tracking-tight">You May Also Like</h2>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{products.map((p) => {
					const trieveMetadata = p.metadata as TrieveProductMetadata;
					return (
						<div key={p.tracking_id} className="overflow-hidden rounded bg-card shadow-sm">
							{trieveMetadata.image_url && (
								<YnsLink href={`${publicUrl}${p.link}`} className="block" prefetch={false}>
									<Image
										className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-80"
										src={trieveMetadata.image_url}
										width={300}
										height={300}
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
										alt=""
									/>
								</YnsLink>
							)}
							<div className="p-4">
								<h3 className="mb-2 text-lg font-semibold">
									<YnsLink href={p.link || "#"} className="hover:text-primary" prefetch={false}>
										{trieveMetadata.name}
									</YnsLink>
								</h3>
								<div className="flex items-center justify-between">
									<span>
										{formatMoney({ amount: trieveMetadata.amount, currency: trieveMetadata.currency })}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
