// app/api/stripe-webhook/route.ts
import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { env } from "@/env.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PrintfulItem = { sync_variant_id: number; quantity: number };

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

	if (!webhookSecret || !stripeSecret) {
		return new Response("Missing Stripe secrets", { status: 500 });
	}

	const signature = req.headers.get("stripe-signature");
	if (!signature) return new Response("No signature", { status: 400 });

	const rawBody = await req.text();
	const Commerce = await import("commerce-kit");

	const stripe = Commerce.provider({
		secretKey: stripeSecret,
		cache: "no-store",
		tagPrefix: undefined, // ✅ required by type, even if not used
	});

	let event: Stripe.Event;
	try {
		event = (await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)) as Stripe.Event;
	} catch (err: unknown) {
		console.error("Webhook signature verification failed:", err);
		return new Response("Invalid signature", { status: 400 });
	}

	try {
		switch (event.type) {
			// ✅ Handle Checkout completion
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;

				// Expand line items → price.product
				const lineItems = (await stripe.checkout.sessions.listLineItems(session.id, {
					expand: ["data.price.product"],
				})) as Stripe.ApiList<Stripe.LineItem>;

				// 🔑 Save slug instead of productName
				const summary = lineItems.data
					.map((li) => {
						const product = li.price?.product as Stripe.Product;
						const slug = product?.metadata?.slug || product?.name || li.description || "unknown";
						return `${li.quantity}x ${slug}`;
					})
					.join(", ");

				if (session.payment_intent) {
					await stripe.paymentIntents.update(session.payment_intent as string, {
						metadata: {
							items: summary,
							customerEmail: session.customer_details?.email || "",
							customerName: session.customer_details?.name || "",
						},
					});
				}

				// ✅ Optional: sync Printful
				if (env.PRINTFUL_API_KEY) {
					const candidates = await Promise.all(
						(lineItems.data ?? []).map(async (item: Stripe.LineItem) => {
							const price = item.price ?? undefined;
							const productObj =
								typeof price?.product === "object" ? (price.product as Stripe.Product) : undefined;

							const category = String(productObj?.metadata?.category ?? "").toLowerCase();
							if (category !== "apparel") return null;

							const syncIdRaw = price?.metadata?.sync_variant_id ?? productObj?.metadata?.sync_variant_id;
							const syncIdNum = Number(syncIdRaw);
							if (!Number.isFinite(syncIdNum)) return null;

							// Verify variant exists
							const ok = await fetch(`https://api.printful.com/store/variants/${syncIdNum}`, {
								headers: { Authorization: `Bearer ${env.PRINTFUL_API_KEY}` },
							}).then((r) => r.ok);
							if (!ok) return null;

							return { sync_variant_id: syncIdNum, quantity: item.quantity ?? 1 } as PrintfulItem;
						}),
					);

					const items: PrintfulItem[] = candidates.filter(Boolean) as PrintfulItem[];

					if (items.length > 0) {
						const piId =
							typeof session.payment_intent === "string"
								? session.payment_intent
								: session.payment_intent?.id;
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

						await fetch("https://api.printful.com/orders", {
							method: "POST",
							headers: {
								Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								external_id: session.id,
								recipient,
								items,
								confirm: true,
							}),
						});
					}
				}
				break;
			}

			// ✅ PaymentIntent succeeded (stock decrement)
			case "payment_intent.succeeded": {
				const pi = event.data.object as Stripe.PaymentIntent;
				const meta = toStringRecord(pi.metadata ?? {});

				if (meta.taxCalculationId) {
					await stripe.tax.transactions.createFromCalculation({
						calculation: meta.taxCalculationId,
						reference: pi.id.slice(3),
					});
				}

				const products = await Commerce.getProductsFromMetadata(meta as Record<string, string>);
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
	} catch (err) {
		console.error("Webhook handler error:", err);
		return new Response("Webhook handler error", { status: 500 });
	}

	return Response.json({ received: true });
}
