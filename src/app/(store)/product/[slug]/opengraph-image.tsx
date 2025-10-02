// src/app/(store)/product/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { env } from "@/env.mjs";
import { getLocale } from "@/i18n/server";
import { getStripeClient } from "@/lib/stripe/client";
import { productGet } from "@/lib/stripe/commerce";
import { formatMoney } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const contentType = "image/png";
export const alt = "";
export const size = { width: 1200, height: 630 };

type ProductLike = {
	name: string;
	description?: string | null;
	images: string[];
	default_price: { unit_amount?: number | null; currency: string };
};

export default async function Image(props: { params: Promise<{ slug: string }> }) {
	const { slug } = await props.params;
	const locale = await getLocale();

	const geistRegular = fetch(new URL("./Geist-Regular.ttf", import.meta.url)).then((r) => r.arrayBuffer());

	let accountName = "Your Next Store";
	let product: ProductLike | null = null;

	if (env.STRIPE_SECRET_KEY) {
		try {
			const stripe = getStripeClient();
			const [accountResult, productArray] = await Promise.all([
				stripe.accounts.retrieve(),
				productGet({ slug }),
			]);
			accountName = accountResult?.business_profile?.name ?? accountName;
			const candidate = productArray?.[0];
			if (candidate) {
				product = {
					name: candidate.name,
					description: candidate.description,
					images: Array.isArray(candidate.images) ? candidate.images : [],
					default_price: {
						unit_amount: candidate.default_price?.unit_amount ?? null,
						currency: candidate.default_price?.currency?.toUpperCase() ?? env.STRIPE_CURRENCY,
					},
				};
			}
		} catch (e) {
			console.warn("opengraph-image: failed to load commerce data, falling back.", e);
		}
	} else {
		console.warn("opengraph-image: STRIPE_SECRET_KEY missing; rendering fallback image.");
	}

	const fallbackProduct: ProductLike = {
		name: "Product preview",
		description: "This is a preview image. Configure Stripe to show live product info.",
		images: ["/crystalthedeveloper-logo.png"],
		default_price: { unit_amount: 0, currency: env.STRIPE_CURRENCY },
	};

	const p = product ?? fallbackProduct;
	const mainImg = p.images?.[0] ?? "/crystalthedeveloper-logo.png";

	return new ImageResponse(
		<div
			style={{ fontFamily: "Geist" }}
			tw="bg-neutral-100 w-full h-full flex flex-row items-stretch justify-center"
		>
			<div tw="flex-1 flex justify-center items-center">
				<div
					style={{
						backgroundImage: `url(${mainImg})`,
						backgroundSize: "600px 630px",
						backgroundPosition: "center center",
						width: "600px",
						height: "630px",
						display: "flex",
					}}
				/>
			</div>
			<div tw="flex-1 flex flex-col items-center justify-center border-l border-neutral-200">
				<div tw="w-full mt-8 text-left px-16 font-normal text-4xl">{accountName}</div>
				<div tw="flex-1 -mt-8 flex flex-col items-start justify-center px-16">
					<p tw="font-black text-5xl mb-0">{p.name}</p>
					<p tw="font-normal text-neutral-800 mt-0 text-3xl">
						{formatMoney({
							amount: p.default_price.unit_amount ?? 0,
							currency: p.default_price.currency,
							locale,
						})}
					</p>
					{p.description && <p tw="font-normal text-xl max-h-[7rem]">{p.description}</p>}
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Geist",
					data: await geistRegular,
					style: "normal",
					weight: 400,
				},
			],
		},
	);
}
