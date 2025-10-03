// src/app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

function requireEnv(name: string): string {
	const val = process.env[name];
	if (!val) throw new Error(`❌ Missing required env variable: ${name}`);
	return val;
}

type CartItem = {
	name: string;
	displayName?: string;
	variantLabel?: string;
	price: number; // cents
	quantity: number;
	image?: string;
	priceId?: string;
	metadata?: Record<string, string | undefined>;
	currency?: string;
};

const toStringRecord = (input?: Stripe.Metadata | null): Record<string, string> => {
	const out: Record<string, string> = {};
	if (!input) return out;
	for (const [key, value] of Object.entries(input)) {
		if (typeof value === "string" && value.trim() !== "") {
			out[key] = value;
		}
	}
	return out;
};

const mergeMetadata = (
	...sources: Array<Record<string, string | undefined> | undefined>
): Record<string, string> => {
	const merged: Record<string, string> = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			if (typeof value === "string" && value.trim() !== "") {
				merged[key] = value;
			}
		}
	}
	return merged;
};

const toStringRecord = (input?: Stripe.Metadata | null): Record<string, string> => {
	const out: Record<string, string> = {};
	if (!input) return out;
	for (const [key, value] of Object.entries(input)) {
		if (typeof value === "string" && value.trim() !== "") {
			out[key] = value;
		}
	}
	return out;
};

const mergeMetadata = (
	...sources: Array<Record<string, string | undefined> | undefined>
): Record<string, string> => {
	const merged: Record<string, string> = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			if (typeof value === "string" && value.trim() !== "") {
				merged[key] = value;
			}
		}
	}
	return merged;
};

const toStringRecord = (input?: Stripe.Metadata | null): Record<string, string> => {
	const out: Record<string, string> = {};
	if (!input) return out;
	for (const [key, value] of Object.entries(input)) {
		if (typeof value === "string" && value.trim() !== "") {
			out[key] = value;
		}
	}
	return out;
};

const mergeMetadata = (
	...sources: Array<Record<string, string | undefined> | undefined>
): Record<string, string> => {
	const merged: Record<string, string> = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			if (typeof value === "string" && value.trim() !== "") {
				merged[key] = value;
			}
		}
	}
	return merged;
};

const toStringRecord = (input?: Stripe.Metadata | null): Record<string, string> => {
	const out: Record<string, string> = {};
	if (!input) return out;
	for (const [key, value] of Object.entries(input)) {
		if (typeof value === "string" && value.trim() !== "") {
			out[key] = value;
		}
	}
	return out;
};

const mergeMetadata = (
	...sources: Array<Record<string, string | undefined> | undefined>
): Record<string, string> => {
	const merged: Record<string, string> = {};
	for (const source of sources) {
		if (!source) continue;
		for (const [key, value] of Object.entries(source)) {
			if (typeof value === "string" && value.trim() !== "") {
				merged[key] = value;
			}
		}
	}
	return merged;
};

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as { cart?: CartItem[] };
		const { cart } = body;

		if (!cart || cart.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const baseUrl = requireEnv("NEXT_PUBLIC_URL");
		const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
		const stripeSecret = requireEnv("STRIPE_SECRET_KEY");

		const stripe = createStripeClient(stripeSecret);

		const detailedItems = await Promise.all(
			cart.map(async (item) => {
				let price: Stripe.Price | null = null;
				if (item.priceId) {
					price = await stripe.prices.retrieve(item.priceId, { expand: ["product"] });
				}
				const isSubscription = price?.type === "recurring";
				return { item, price, isSubscription };
			}),
		);

		const makeLineItem = (entry: (typeof detailedItems)[number]) => {
			const { item, price } = entry;

			const expandedPrice = price ?? null;
			const product =
				expandedPrice && typeof expandedPrice.product === "object"
					? (expandedPrice.product as Stripe.Product)
					: null;

			const priceMetadata = expandedPrice ? toStringRecord(expandedPrice.metadata) : {};
			const productMetadata = product ? toStringRecord(product.metadata) : {};
			const itemMetadata = mergeMetadata(item.metadata);
			const combinedMetadata = mergeMetadata(productMetadata, priceMetadata, itemMetadata);

			const category = combinedMetadata.category?.toLowerCase().trim();
			const hasVariantSelection = Boolean(item.metadata?.color || item.metadata?.size);
			const shouldInlinePrice =
				!entry.isSubscription && expandedPrice && (category === "apparel" || hasVariantSelection);

			if (shouldInlinePrice) {
				const images = item.image
					? [item.image]
					: product?.images && product.images.length > 0
						? product.images
						: undefined;

				const unitAmount =
					typeof expandedPrice.unit_amount === "number" ? expandedPrice.unit_amount : Math.round(item.price);

				const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
					name: item.name,
					...(images ? { images } : {}),
					...(Object.keys(combinedMetadata).length > 0 ? { metadata: combinedMetadata } : {}),
				};

				const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
					currency: expandedPrice.currency,
					unit_amount: unitAmount,
					product_data: productData,
				};

				if (expandedPrice.tax_behavior) {
					priceData.tax_behavior = expandedPrice.tax_behavior;
				}

				return {
					price_data: priceData,
					quantity: item.quantity,
				};
			}

			if (item.priceId) {
				return {
					price: item.priceId,
					quantity: item.quantity,
				};
			}

			return {
				price_data: {
					currency,
					product_data: {
						name: displayName,
						...(item.image && { images: [item.image] }),
						metadata: productMetadata,
					},
					unit_amount: Math.round(item.price),
				},
				quantity: item.quantity,
			};
		};

		const subscriptionLineItems = subscriptionItems.map(makeLineItem);
		const oneTimeLineItems = oneTimeItems.map(makeLineItem);

		if (subscriptionLineItems.length > 0 && subscriptionLineItems.some((li) => !("price" in li))) {
			return NextResponse.json(
				{ error: "Subscription items must reference a Stripe price" },
				{ status: 400 },
			);
		}

		const shippingAddressCollection: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection = {
			allowed_countries: ["CA", "US"],
		};

		if (subscriptionLineItems.length > 0 && oneTimeLineItems.length > 0) {
			const subscriptionSession = await stripe.checkout.sessions.create({
				mode: "subscription",
				line_items: subscriptionLineItems,
				billing_address_collection: "required",
				shipping_address_collection: shippingAddressCollection,
				automatic_tax: { enabled: true },
				success_url: `${baseUrl}${basePath}/order/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${baseUrl}${basePath}/cart`,
			});

			const paymentSession = await stripe.checkout.sessions.create({
				mode: "payment",
				line_items: oneTimeLineItems,
				billing_address_collection: "required",
				shipping_address_collection: shippingAddressCollection,
				automatic_tax: { enabled: true },
				success_url: `${baseUrl}${basePath}/order/success?session_id={CHECKOUT_SESSION_ID}&subscription_session_id=${subscriptionSession.id}`,
				cancel_url: `${baseUrl}${basePath}/cart`,
			});

			await stripe.checkout.sessions.update(subscriptionSession.id, {
				metadata: {
					...(subscriptionSession.metadata ?? {}),
					payment_session_id: paymentSession.id,
				},
			});

			if (!paymentSession.url) {
				return NextResponse.json({ error: "❌ Stripe did not return a URL" }, { status: 500 });
			}

			return NextResponse.json({ url: paymentSession.url });
		}

		const line_items = subscriptionItems.length > 0 ? subscriptionItems : oneTimeItems;
		const mode = subscriptionItems.length > 0 ? "subscription" : "payment";

		const session = await stripe.checkout.sessions.create({
			mode,
			line_items,
			billing_address_collection: "required",
			shipping_address_collection: shippingAddressCollection,
			automatic_tax: { enabled: true },
			success_url: `${baseUrl}${basePath}/order/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}${basePath}/cart`,
		});

		if (!session.url) {
			return NextResponse.json({ error: "❌ Stripe did not return a URL" }, { status: 500 });
		}

		return NextResponse.json({ url: session.url });
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("❌ Stripe checkout error:", err.message);
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		console.error("❌ Stripe checkout unknown error:", err);
		return NextResponse.json({ error: "Unknown error" }, { status: 500 });
	}
}
