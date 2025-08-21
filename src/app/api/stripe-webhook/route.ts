// app/api/stripe-webhook/route.ts
import { revalidateTag } from "next/cache";
import type Stripe from "stripe"; // type-only ✅
import { env } from "@/env.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PrintfulItem = { sync_variant_id: number; quantity: number };

/** Narrow arbitrary metadata to Record<string, string> */
function toStringRecord(input: Record<string, unknown>): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(input)) {
		if (typeof v === "string") out[k] = v;
	}
	return out;
}

export async function POST(req: Request) {
	const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
	const stripeSecret = env.STRIPE_SECRET_KEY;

	if (!webhookSecret) {
		return new Response("STRIPE_WEBHOOK_SECRET is not configured", { status: 500 });
	}
	if (!stripeSecret) {
		return new Response("STRIPE_SECRET_KEY is not configured", { status: 500 });
	}

	const signature = req.headers.get("stripe-signature") || req.headers.get("Stripe-Signature");
	if (!signature) return new Response("No signature", { status: 400 });

	const rawBody = await req.text();

	// ✅ Load commerce-kit only when we know secrets exist
	const Commerce = await import("commerce-kit");

	const stripe = Commerce.provider({
		secretKey: stripeSecret,
		cache: "no-store",
		tagPrefix: undefined,
	});

	let event: Stripe.Event;
	try {
		event = (await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)) as Stripe.Event;
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error("Webhook signature verification failed:", msg);
		return new Response("Invalid signature", { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				if (!env.PRINTFUL_API_KEY) break;

				const session = event.data.object as Stripe.Checkout.Session;

				// Expand line items → price.product
				const lineItems = (await stripe.checkout.sessions.listLineItems(session.id, {
					expand: ["data.price.product"],
				})) as Stripe.ApiList<Stripe.LineItem>;

				const candidates = await Promise.all(
					(lineItems.data ?? []).map(async (item: Stripe.LineItem) => {
						const price = item.price ?? undefined;
						const productExpanded = price?.product as Stripe.Product | string | undefined;
						const productObj =
							productExpanded && typeof productExpanded === "object"
								? (productExpanded as Stripe.Product)
								: undefined;

						const category = String(productObj?.metadata?.category ?? "").toLowerCase();
						if (category !== "apparel") return null;

						const syncIdRaw = price?.metadata?.sync_variant_id ?? productObj?.metadata?.sync_variant_id;
						const syncIdNum = Number(syncIdRaw);
						if (!Number.isFinite(syncIdNum)) return null;

						// Optional: verify the Printful variant exists
						try {
							const ok = await fetch(`https://api.printful.com/store/variants/${syncIdNum}`, {
								headers: { Authorization: `Bearer ${env.PRINTFUL_API_KEY}` },
							}).then((r) => r.ok);
							if (!ok) return null;
						} catch {
							return null;
						}

						return { sync_variant_id: syncIdNum, quantity: item.quantity ?? 1 } as PrintfulItem;
					}),
				);

				const items: PrintfulItem[] = (candidates.filter(Boolean) as PrintfulItem[]) ?? [];

				if (items.length > 0) {
					// Checkout.Session doesn’t expose shipping; get it from PaymentIntent
					const piId =
						typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

					let shipping: Stripe.PaymentIntent["shipping"] = null;
					if (piId) {
						const pi = (await stripe.paymentIntents.retrieve(piId)) as Stripe.PaymentIntent;
						shipping = pi.shipping ?? null;
					}

					const recipient = {
						name: shipping?.name ?? session.customer_details?.name ?? "Customer",
						address1: shipping?.address?.line1 ?? session.customer_details?.address?.line1 ?? "",
						address2: shipping?.address?.line2 ?? session.customer_details?.address?.line2 ?? "",
						city: shipping?.address?.city ?? session.customer_details?.address?.city ?? "",
						state_code: shipping?.address?.state ?? session.customer_details?.address?.state ?? "",
						country_code: shipping?.address?.country ?? session.customer_details?.address?.country ?? "CA",
						zip: shipping?.address?.postal_code ?? session.customer_details?.address?.postal_code ?? "",
						email: session.customer_details?.email ?? "no-reply@example.com",
					};

					const order = {
						external_id: session.id, // idempotent on retries
						recipient,
						items,
						confirm: true,
					};

					const pfRes = await fetch("https://api.printful.com/orders", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(order),
					});

					if (!pfRes.ok) {
						if (pfRes.status === 409) {
							console.log("ℹ️ Printful order already exists for session:", session.id);
						} else {
							const text = await pfRes.text();
							console.error("Printful order creation failed:", text);
							// To have Stripe retry: return new Response("Printful error", { status: 500 });
						}
					} else {
						console.log("✅ Printful order created for session:", session.id);
					}
				} else {
					console.warn("No apparel Printful items found on session:", session.id);
				}
				break;
			}

			case "payment_intent.succeeded": {
				const pi = event.data.object as Stripe.PaymentIntent;

				// Sanitize metadata → strings only (fixes typing error)
				const metaRaw = (pi.metadata ?? {}) as Record<string, unknown>;
				const meta = toStringRecord(metaRaw);

				const taxCalculationId = meta.taxCalculationId;
				if (taxCalculationId) {
					await stripe.tax.transactions.createFromCalculation({
						calculation: taxCalculationId,
						reference: pi.id.slice(3),
					});
				}

				// Safe to use meta now; it's Record<string, string>
				const products = await Commerce.getProductsFromMetadata(meta as unknown as Record<string, string>);
				for (const { product } of products) {
					if (product && product.metadata?.stock !== Infinity) {
						const current = Number(product.metadata?.stock ?? 0);
						await stripe.products.update(product.id, {
							metadata: { stock: String(Math.max(0, current - 1)) },
						});
						revalidateTag(`product-${product.id}`);
					}
				}
				revalidateTag(`cart-${pi.id}`);
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}
	} catch (err: unknown) {
		console.error("Webhook handler error:", err);
		return new Response("Webhook handler error", { status: 500 });
	}

	return Response.json({ received: true });
}
