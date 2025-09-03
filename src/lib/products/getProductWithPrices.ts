// src/lib/products/getProductWithPrices.ts
import * as Commerce from "commerce-kit";

export type KitProduct = Awaited<ReturnType<typeof Commerce.productGet>>[number];
export type KitPrice = {
	id: string;
	unit_amount: number | null;
	currency: string;
	metadata: {
		color?: string;
		size?: string;
		image_url?: string;
		[key: string]: string | undefined;
	};
};

export async function getProductWithPrices(
	slug: string,
): Promise<{ product: KitProduct; prices: KitPrice[] }> {
	const items = await Commerce.productGet({
		slug,
		...({ expand: ["data.prices", "data.default_price"] } as Record<string, unknown>),
	});

	if (!items.length) throw new Error("Not found");

	const product = items[0] as KitProduct;
	const isApparel = (product.metadata?.category ?? "").toLowerCase() === "apparel";

	let prices: KitPrice[] = Array.isArray((product as unknown as { prices: KitPrice[] }).prices)
		? (product as unknown as { prices: KitPrice[] }).prices
		: [];

	// 🔑 Always fetch fresh Stripe prices for apparel if missing
	if (isApparel && prices.length === 0) {
		const { env } = await import("@/env.mjs");
		const stripe = Commerce.provider({ secretKey: env.STRIPE_SECRET_KEY, tagPrefix: undefined });
		const listed = await stripe.prices.list({ product: product.id, active: true, limit: 100 });

		prices = listed.data.map((p) => ({
			id: p.id,
			unit_amount: p.unit_amount,
			currency: p.currency,
			metadata: {
				color: p.metadata?.color ?? "",
				size: p.metadata?.size ?? "",
				image_url: p.metadata?.image_url ?? "",
				...p.metadata,
			},
		}));
	} else {
		// 🔑 Normalize metadata for any prices that came back from Commerce
		prices = prices.map((p) => ({
			...p,
			metadata: {
				color: p.metadata?.color ?? "",
				size: p.metadata?.size ?? "",
				image_url: p.metadata?.image_url ?? "",
				...(p.metadata ?? {}),
			},
		}));
	}

	return { product, prices };
}
