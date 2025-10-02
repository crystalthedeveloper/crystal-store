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
					price = await stripe.prices.retrieve(item.priceId);
				}
				const isSubscription = price?.type === "recurring";
				return { item, price, isSubscription };
			}),
		);

		const makeLineItem = (entry: (typeof detailedItems)[number]) => {
			const { item } = entry;
			const baseName = item.name || "Item";
			const variantLabel = item.variantLabel?.trim() || "";
			const displayName = item.displayName || (variantLabel ? `${baseName} (${variantLabel})` : baseName);
			const currency = (item.currency || "cad").toLowerCase();

			const productMetadata = {
				...(item.metadata ?? {}),
				base_name: baseName,
				...(variantLabel ? { variant_label: variantLabel } : {}),
			};

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

		const subscriptionItems = detailedItems.filter((e) => e.isSubscription).map(makeLineItem);
		const oneTimeItems = detailedItems.filter((e) => !e.isSubscription).map(makeLineItem);

		const line_items = subscriptionItems.length > 0 ? subscriptionItems : oneTimeItems;
		const mode = subscriptionItems.length > 0 ? "subscription" : "payment";

		const session = await stripe.checkout.sessions.create({
			mode,
			line_items,
			billing_address_collection: "required",
			shipping_address_collection: mode === "payment" ? { allowed_countries: ["CA", "US"] } : undefined,
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
