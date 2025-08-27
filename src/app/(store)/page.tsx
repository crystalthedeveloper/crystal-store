// src/app/(store)/page.tsx
import type { Metadata } from "next";
import getConfig from "next/config";
import Image from "next/image";
import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import StoreConfig from "@/store.config";
import { CategoryBox } from "@/ui/category-box";
import { ProductList } from "@/ui/products/product-list";
import { YnsLink } from "@/ui/yns-link";

export const runtime = "nodejs"; // server-only libs
export const dynamic = "force-dynamic"; // don’t prerender
export const revalidate = 0;

export const metadata: Metadata = {
	alternates: { canonical: publicUrl },
};

// 🔧 Infer the element type returned by commerce-kit’s productBrowse
type ProductFromBrowse = Awaited<
	ReturnType<typeof import("commerce-kit")["productBrowse"]>
> extends (infer T)[]
	? T
	: never;

// pull runtime config
const { publicRuntimeConfig } = getConfig();

export default async function Home() {
	const t = await getTranslations("/");

	// Safe preview if Stripe isn’t configured
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<main>
				<section className="rounded bg-neutral-100 py-8 sm:py-12">
					<div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8 px-8 sm:px-16 md:grid-cols-2">
						<div className="max-w-md space-y-4">
							<h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
								Shop, Style, Create — and Support the Dev
							</h2>
							<p className="text-pretty text-neutral-600">
								Store preview is disabled in this environment (Stripe is not configured).
							</p>

							<div className="flex gap-4">
								<YnsLink
									href={t("hero.link")}
									aria-label={t("hero.aria")}
									className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-6 font-medium text-neutral-50 transition-colors hover:bg-neutral-900/90 focus:outline-hidden focus:ring-1 focus:ring-neutral-950"
								>
									{t("hero.action")}
								</YnsLink>

								<YnsLink
									href={t("support.link")}
									aria-label={t("support.aria")}
									className="inline-flex h-10 items-center justify-center rounded-full px-6 font-medium text-black transition-colors hover:opacity-90 focus:outline-hidden focus:ring-1 focus:ring-yellow-600"
									style={{ backgroundColor: "#ffe600" }}
								>
									{t("support.action")}
								</YnsLink>
							</div>
						</div>

						<Image
							alt="crystal The Developer logo"
							loading="eager"
							priority
							className="rounded"
							height={450}
							width={450}
							src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/crystalthedeveloper-logo.png`}
							style={{ objectFit: "cover" }}
							sizes="(max-width: 640px) 70vw, 450px"
						/>
					</div>
				</section>

				{/* Categories don’t require Stripe */}
				<section className="w-full py-8">
					<div className="grid gap-8 lg:grid-cols-2">
						{StoreConfig.categories.map(({ slug, image: src }) => (
							<CategoryBox key={slug} categorySlug={slug} src={src} />
						))}
					</div>
				</section>
			</main>
		);
	}

	// Stripe exists: load commerce-kit dynamically
	let products: ProductFromBrowse[] = [];
	try {
		const { productBrowse } = await import("commerce-kit");
		products = await productBrowse({ first: 6 });
	} catch (e) {
		console.warn("Home: productBrowse failed; rendering without products.", e);
	}

	return (
		<main>
			<section className="rounded bg-neutral-100 py-8 sm:py-12">
				<div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8 px-8 sm:px-16 md:grid-cols-2">
					<div className="max-w-md space-y-4">
						<h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
							Shop, Style, Create — and Support the Dev
						</h2>
						<p className="text-pretty text-neutral-600">
							Explore everything from sleek Webflow templates and innovative apps to premium eCommerce designs
							and everyday hoodies. Your support — whether by shopping or chipping in — directly helps keep
							the projects, creativity, and code flowing.
						</p>

						<div className="flex gap-4">
							<YnsLink
								href={t("hero.link")}
								aria-label={t("hero.aria")}
								className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-6 font-medium text-neutral-50 transition-colors hover:bg-neutral-900/90 focus:outline-hidden focus:ring-1 focus:ring-neutral-950"
							>
								{t("hero.action")}
							</YnsLink>

							<YnsLink
								href={t("support.link")}
								aria-label={t("support.aria")}
								className="inline-flex h-10 items-center justify-center rounded-full px-6 font-medium text-black transition-colors hover:opacity-90 focus:outline-hidden focus:ring-1 focus:ring-yellow-600"
								style={{ backgroundColor: "#ffe600" }}
							>
								{t("support.action")}
							</YnsLink>
						</div>
					</div>

					<Image
						alt="crystal The Developer logo"
						loading="eager"
						priority
						className="rounded"
						height={450}
						width={450}
						src={`${publicRuntimeConfig.basePath || ""}/crystalthedeveloper-logo.png`}
						style={{ objectFit: "cover" }}
						sizes="(max-width: 640px) 70vw, 450px"
					/>
				</div>
			</section>

			{/* Render products if we have them */}
			{products.length > 0 && <ProductList products={products} />}

			<section className="w-full py-8">
				<div className="grid gap-8 lg:grid-cols-2">
					{StoreConfig.categories.map(({ slug, image: src }) => (
						<CategoryBox key={slug} categorySlug={slug} src={src} />
					))}
				</div>
			</section>
		</main>
	);
}
