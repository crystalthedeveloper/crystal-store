// src/app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe/client";

// ✅ Prevent static optimization / pre-rendering
export const dynamic = "force-dynamic";

// ✅ Env loader
function requireEnv(name: string): string {
	const val = process.env[name];
	if (!val) throw new Error(`❌ Missing required env variable: ${name}`);
	return val;
}

type CartItem = {
	name: string;
	price: number; // already in cents
	quantity: number;
	image?: string;
	priceId?: string;
	metadata?: Record<string, string | undefined>;
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

function buildStoreUrl(baseUrl: string, basePath: string, subPath: string, params: Record<string, string> = {}) {
	const url = new URL(baseUrl);
	const split = (value: string) => value.split("/").filter(Boolean);
	const baseSegments = split(url.pathname);
	const configuredSegments = split(basePath ?? "");
	const combined = [...baseSegments];
	if (configuredSegments.length > 0 && baseSegments.join("/") !== configuredSegments.join("/")) {
		combined.push(...configuredSegments);
	}
	combined.push(...split(subPath));
	url.pathname = combined.length > 0 ? `/${combined.join("/")}` : "/";
	const rawSearch = new URLSearchParams(params).toString();
	url.search = rawSearch.replace(/%7B/gi, "{").replace(/%7D/gi, "}");
	return url.toString();
}

export async function POST(req: Request) {
	try {
		console.log("📩 Incoming checkout request...");

		const body = (await req.json()) as { cart?: CartItem[] };
		const { cart } = body;
		console.log("🛒 Cart body:", JSON.stringify(cart, null, 2));

		const baseUrl = requireEnv("NEXT_PUBLIC_URL"); // e.g. https://www.crystalthedeveloper.ca
		const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. /store
		const stripeSecret = requireEnv("STRIPE_SECRET_KEY");

		console.log("🌐 Base URL:", baseUrl);
		console.log("📂 Base Path:", basePath);

		if (!cart || cart.length === 0) {
			console.warn("⚠️ Cart is empty!");
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// ✅ Lock to Stripe’s pinned API version (Cloudflare-safe client)
		const stripe = createStripeClient(stripeSecret);
		console.log("✅ Stripe client initialized for checkout");

		// ✅ Build Stripe line items
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

		const subscriptionItems = detailedItems.filter((entry) => entry.isSubscription);
		const oneTimeItems = detailedItems.filter((entry) => !entry.isSubscription);

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
					currency: "cad",
					product_data: {
						name: item.name,
						...(item.image && { images: [item.image] }),
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
				success_url: buildStoreUrl(baseUrl, basePath, "order/success", {
					session_id: "{CHECKOUT_SESSION_ID}",
				}),
				// If the subscription checkout is cancelled, send the shopper back to the completed payment receipt.
				cancel_url: buildStoreUrl(baseUrl, basePath, "order/success", {
					session_id: "{CHECKOUT_SESSION_ID}",
					subscription_cancelled: "1",
				}),
			});

			const paymentSession = await stripe.checkout.sessions.create({
				mode: "payment",
				line_items: oneTimeLineItems,
				billing_address_collection: "required",
				shipping_address_collection: shippingAddressCollection,
				automatic_tax: { enabled: true },
				success_url: buildStoreUrl(baseUrl, basePath, "order/success", {
					session_id: "{CHECKOUT_SESSION_ID}",
					subscription_session_id: subscriptionSession.id,
				}),
				// Route payment cancellations directly to the cart so shoppers can review or adjust items.
				cancel_url: buildStoreUrl(baseUrl, basePath, "cart"),
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

		const line_items = subscriptionLineItems.length > 0 ? subscriptionLineItems : oneTimeLineItems;
		const mode = subscriptionLineItems.length > 0 ? "subscription" : "payment";
		const session = await stripe.checkout.sessions.create({
			mode,
			line_items,
			billing_address_collection: "required",
			shipping_address_collection: shippingAddressCollection,
			automatic_tax: { enabled: true },
			success_url: buildStoreUrl(baseUrl, basePath, "order/success", {
				session_id: "{CHECKOUT_SESSION_ID}",
			}),
			cancel_url: buildStoreUrl(baseUrl, basePath, "cart"),
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
		return NextResponse.json({ error: "Unknown error creating checkout session" }, { status: 500 });
	}
}
