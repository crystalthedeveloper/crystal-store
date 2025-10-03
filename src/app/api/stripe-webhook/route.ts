// app/api/stripe-webhook/route.ts
import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { env } from "@/env.mjs";
import { getStripeClient } from "@/lib/stripe/client";
import { getProductsFromMetadata } from "@/lib/stripe/commerce";

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
	const stripe = getStripeClient();

	let event: Stripe.Event;
	try {
		event = (await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)) as Stripe.Event;
	} catch (err) {
		console.error("❌ Webhook signature verification failed:", err);
		return new Response("Invalid signature", { status: 400 });
	}

	try {
		switch (event.type) {
			/* ---------------- Checkout Completed ---------------- */
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;

				// Expand line items with product metadata
				const lineItems = (await stripe.checkout.sessions.listLineItems(session.id, {
					expand: ["data.price.product"],
				})) as Stripe.ApiList<Stripe.LineItem>;

				// Save summary into PaymentIntent metadata
				if (session.payment_intent) {
					const summary = lineItems.data
						.map((li) => {
							const product = li.price?.product as Stripe.Product;
							const slug = product?.metadata?.slug || product?.name || li.description || "unknown";
							return `${li.quantity}x ${slug}`;
						})
						.join(", ");

					await stripe.paymentIntents.update(session.payment_intent as string, {
						metadata: {
							items: summary,
							customerEmail: session.customer_details?.email || "",
							customerName: session.customer_details?.name || "",
						},
					});
				}

				/* ---------------- Sync Printful Order ---------------- */
				if (env.PRINTFUL_API_KEY) {
					const candidates = await Promise.all(
						lineItems.data.map(async (item) => {
							const price = item.price;
							const productObj =
								typeof price?.product === "object" ? (price.product as Stripe.Product) : undefined;

							const category = (productObj?.metadata?.category ?? "").toLowerCase();

							// Skip if not apparel
							if (category !== "apparel") return null;

							// Find Printful variant ID (first check price.metadata, then product.metadata)
							const syncIdRaw =
								price?.metadata?.printful_sync_variant_id ??
								price?.metadata?.sync_variant_id ??
								productObj?.metadata?.printful_sync_variant_id ??
								productObj?.metadata?.printful_sync_product_id ??
								productObj?.metadata?.sync_variant_id ??
								null;

							const syncIdNum = Number(syncIdRaw);
							if (!Number.isFinite(syncIdNum)) {
								console.warn("⚠️ No valid Printful variant ID found for", item.description);
								return null;
							}

							// Verify variant exists in Printful
							const variantRes = await fetch(`https://api.printful.com/store/variants/${syncIdNum}`, {
								headers: {
									Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
								},
							});

							if (!variantRes.ok) {
								console.warn(`⚠️ Printful variant ${syncIdNum} not found`);
								return null;
							}

							const variantPayload = (await variantRes.json().catch(() => null)) as {
								result?: {
									sync_variant?: { is_discontinued?: boolean };
									variant?: { is_discontinued?: boolean };
								};
							} | null;

							const isDiscontinued = Boolean(
								variantPayload?.result?.sync_variant?.is_discontinued ||
									variantPayload?.result?.variant?.is_discontinued,
							);

							if (isDiscontinued) {
								console.warn(`⚠️ Printful variant ${syncIdNum} is discontinued (skipping)`);
								return null;
							}

							return {
								sync_variant_id: syncIdNum,
								quantity: item.quantity ?? 1,
							} as PrintfulItem;
						}),
					);

					const items = candidates.filter(Boolean) as PrintfulItem[];
					console.log("[printful] eligible apparel items", items);

					if (items.length > 0) {
						// Retrieve shipping info
						const piId =
							typeof session.payment_intent === "string"
								? session.payment_intent
								: session.payment_intent?.id;

						let shipping: Stripe.PaymentIntent["shipping"] | null = null;
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

						// Send order to Printful in DRAFT mode (set confirm:true for live)
						const externalIdRaw =
							typeof session.payment_intent === "string"
								? session.payment_intent
								: (session.payment_intent?.id ?? session.id);
						const externalId = externalIdRaw.slice(0, 64);

						const res = await fetch("https://api.printful.com/orders", {
							method: "POST",
							headers: {
								Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								external_id: externalId,
								recipient,
								items,
								confirm: false,
							}),
						});

						if (!res.ok) {
							const text = await res.text();
							console.error("❌ Printful error:", res.status, text);
						} else {
							const body = await res.json().catch(() => null);
							console.log("✅ Printful order created (draft)", { items, response: body });
						}
					}
				}
				break;
			}

			/* ---------------- PaymentIntent Success ---------------- */
			case "payment_intent.succeeded": {
				const pi = event.data.object as Stripe.PaymentIntent;
				const meta = toStringRecord(pi.metadata ?? {});

				if (meta.taxCalculationId) {
					await stripe.tax.transactions.createFromCalculation({
						calculation: meta.taxCalculationId,
						reference: pi.id.slice(3),
					});
				}

				const products = await getProductsFromMetadata(meta as Record<string, string>);
				console.log("[webhook] updating product stock", products);
				for (const { product } of products) {
					const rawStock = product?.metadata?.stock;
					const hasFiniteStock = typeof rawStock === "string" && rawStock.toLowerCase() !== "infinity";
					if (product && hasFiniteStock) {
						const current = Number(rawStock ?? 0);
						const quantity = Number(meta[`prod_${product.id}`] ?? 1);

						await stripe.products.update(product.id, {
							metadata: { stock: String(Math.max(0, current - quantity)) },
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
		console.error("❌ Webhook handler error:", err);
		return new Response("Webhook handler error", { status: 500 });
	}

	return Response.json({ received: true });
}
