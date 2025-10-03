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
type PrintfulCandidate = {
	payload: PrintfulItem;
	priceId?: string;
	priceMetadata?: Record<string, string>;
	productId?: string;
	description: string;
};

function toStringRecord(input: Record<string, unknown>): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(input)) {
		if (typeof v === "string") out[k] = v;
	}
	return out;
}

/**
 * Parse boolean-like values commonly found in metadata fields.
 * Accepts strings like "true", "1", "yes", numbers 1/0, etc.
 */
function parseBooleanish(value: unknown): boolean | undefined {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value === 1;
	if (typeof value !== "string") return undefined;

	const s = value.trim().toLowerCase();
	if (s === "true" || s === "1" || s === "yes" || s === "y" || s === "on") return true;
	if (s === "false" || s === "0" || s === "no" || s === "n" || s === "off") return false;
	return undefined;
}

// Simple in-memory cache for Printful variant lookups to reduce API calls.
const variantCache = new Map<number, { variant: Record<string, unknown> | null; expires: number }>();

function now() {
	return Date.now();
}

function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

/**
 * Fetch with timeout using AbortController. Returns the fetch Response or throws an error on abort.
 */
async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 5000) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(input, { ...init, signal: controller.signal } as RequestInit);
		return res;
	} finally {
		clearTimeout(id);
	}
}

/**
 * Like hasIgnoreOrDiscontinuedFlag but returns a short reason string when a matching flag is found.
 */
function findIgnoreOrDiscontinuedReason(meta: Record<string, unknown> | undefined): string | undefined {
	if (!meta || typeof meta !== "object") return undefined;

	const checkKeys = [
		"printful_ignored",
		"printful_ignore",
		"ignore_printful",
		"skip_printful",
		"printful_discontinued",
		"discontinued",
		"is_discontinued",
		"status",
		"archived",
		"is_archived",
		"deleted",
		"is_deleted",
		"hidden",
		"is_hidden",
		"unavailable",
		"is_unavailable",
		"discontinued_at",
	];

	const statusValuesToMatch = new Set(["discontinued", "archived", "hidden", "deleted", "unavailable"]);

	const maxDepth = 3;

	function walk(obj: unknown, depth: number): string | undefined {
		if (depth > maxDepth || obj == null) return undefined;
		if (typeof obj !== "object") return undefined;

		for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
			const key = k.toLowerCase();

			if (checkKeys.includes(key)) {
				if (typeof v === "string" && statusValuesToMatch.has(v.trim().toLowerCase())) return `${key}=${v}`;
				const parsed = parseBooleanish(v);
				if (parsed === true) return `${key}=${String(v)}`;
				if (key === "discontinued_at" && typeof v === "string" && v.trim() !== "") return `${key}=${v}`;
				if (
					(key === "archived" || key === "hidden" || key === "deleted" || key === "unavailable") &&
					typeof v === "number" &&
					v === 1
				)
					return `${key}=1`;
			}

			// If value is an object/array, recurse
			if (typeof v === "object" && v !== null) {
				const found = walk(v, depth + 1);
				if (found) return found;
			}
		}

		return undefined;
	}

	return walk(meta, 0);
}

/**
 * Check a product/price metadata object for flags that indicate Printful should be ignored
 * or that the variant/product has been discontinued. Returns true if the item should be skipped.
 */
function hasIgnoreOrDiscontinuedFlag(meta: Record<string, unknown> | undefined): boolean {
	if (!meta || typeof meta !== "object") return false;

	// Keys and status values that commonly indicate discontinued/archived/hidden
	const checkKeys = [
		"printful_ignored",
		"printful_ignore",
		"ignore_printful",
		"skip_printful",
		"printful_discontinued",
		"discontinued",
		"is_discontinued",
		"status",
		"archived",
		"is_archived",
		"deleted",
		"is_deleted",
		"hidden",
		"is_hidden",
		"unavailable",
		"is_unavailable",
		"discontinued_at",
	];

	const statusValuesToMatch = new Set(["discontinued", "archived", "hidden", "deleted", "unavailable"]);

	const maxDepth = 3;

	function walk(obj: unknown, depth: number): boolean {
		if (depth > maxDepth || obj == null) return false;
		if (typeof obj !== "object") return false;

		for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
			const key = k.toLowerCase();

			if (checkKeys.includes(key)) {
				if (typeof v === "string" && statusValuesToMatch.has(v.trim().toLowerCase())) return true;
				const parsed = parseBooleanish(v);
				if (parsed === true) return true;
				// If the value is a timestamp or non-empty string for discontinued_at, treat as discontinued
				if (key === "discontinued_at" && typeof v === "string" && v.trim() !== "") return true;
				if (
					(key === "archived" || key === "hidden" || key === "deleted" || key === "unavailable") &&
					typeof v === "number" &&
					v === 1
				)
					return true;
			}

			// If value is an object/array, recurse
			if (typeof v === "object" && v !== null) {
				if (walk(v, depth + 1)) return true;
			}
		}

		return false;
	}

	return walk(meta, 0);
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

							// Skip if price or product metadata explicitly mark this item to be ignored
							if (
								hasIgnoreOrDiscontinuedFlag(price?.metadata) ||
								hasIgnoreOrDiscontinuedFlag(productObj?.metadata)
							) {
								console.warn(
									"⚠️ Skipping Printful item because metadata indicates ignore/discontinued:",
									item.description,
								);
								return null;
							}

							// Find Printful variant ID (first check price.metadata, then product.metadata)
							const syncIdRaw =
								(price?.metadata?.printful_sync_variant_id as unknown) ??
								(price?.metadata?.sync_variant_id as unknown) ??
								(productObj?.metadata?.printful_sync_variant_id as unknown) ??
								(productObj?.metadata?.printful_sync_product_id as unknown) ??
								(productObj?.metadata?.sync_variant_id as unknown) ??
								null;

							const syncIdNum = Number(syncIdRaw);
							if (!Number.isFinite(syncIdNum)) {
								console.warn("⚠️ No valid Printful variant ID found for", item.description);
								return null;
							}

							// Retrieve variant details from Printful and inspect for discontinuation/archived flags.
							try {
								const cacheTtl = 1000 * 60 * 5; // 5 minutes
								const cached = variantCache.get(syncIdNum);
								let variant: Record<string, unknown> | undefined | null = undefined;

								if (cached && cached.expires > now()) {
									variant = cached.variant ?? undefined;
								} else {
									// fetch with a timeout and modest retry for transient errors
									try {
										const r = await fetchWithTimeout(
											`https://api.printful.com/store/variants/${syncIdNum}`,
											{
												headers: { Authorization: `Bearer ${env.PRINTFUL_API_KEY}` },
											},
											5000,
										);

										if (!r.ok) {
											console.warn(`⚠️ Printful variant ${syncIdNum} not found (status ${r.status})`);
											variantCache.set(syncIdNum, { variant: null, expires: now() + cacheTtl });
											return null;
										}

										const json = (await r.json().catch(() => null)) as Record<string, unknown> | null;
										variant = (json && (json.result ?? json)) as Record<string, unknown> | undefined;
										variantCache.set(syncIdNum, { variant: variant ?? null, expires: now() + cacheTtl });
									} catch (err) {
										console.warn(`⚠️ Error fetching Printful variant ${syncIdNum}:`, err);
										// don't include the item on transient fetch failure
										return null;
									}
								}

								// Inspect variant-level flags that indicate the variant is discontinued/archived
								if (variant) {
									const reason = findIgnoreOrDiscontinuedReason(variant);
									if (reason) {
										console.warn(
											`⚠️ Printful variant ${syncIdNum} is marked discontinued/ignored by Printful; skipping — ${reason}`,
										);
										return null;
									}

									// Also check nested product/status fields
									const productInfo = (variant.product ?? variant) as Record<string, unknown> | undefined;
									if (productInfo) {
										const pReason = findIgnoreOrDiscontinuedReason(productInfo);
										if (pReason) {
											console.warn(
												`⚠️ Printful variant ${syncIdNum} product marked discontinued/ignored; skipping — ${pReason}`,
											);
											return null;
										}
									}
								}
							} catch (err) {
								console.warn(`⚠️ Error inspecting Printful variant ${syncIdNum}:`, err);
								return null;
							}

						return {
							payload: {
								sync_variant_id: syncIdNum,
								quantity: item.quantity ?? 1,
							},
							priceId: price?.id,
							priceMetadata: price?.metadata ? toStringRecord(price.metadata) : undefined,
							productId: typeof productObj?.id === "string" ? productObj.id : undefined,
							description: item.description ?? productObj?.name ?? `variant ${syncIdNum}`,
						} satisfies PrintfulCandidate;
					}),
				);

				const confirmedCandidates = candidates.filter(Boolean) as PrintfulCandidate[];
				const items = confirmedCandidates.map((c) => c.payload);
				console.log(
					"[printful] eligible apparel items",
					items.map((entry) => ({ ...entry })),
				);

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

						// Create Printful order, but be tolerant of per-item discontinuation errors.
						// If Printful returns an error like "Item 1: This item is discontinued.",
						// remove that item and retry the order (up to a small number of attempts).

						const maxAttempts = 3;
						let attempt = 0;
						let attemptCandidates = confirmedCandidates.slice();
						let attemptItems = attemptCandidates.map((c) => c.payload);
						let created = false;
						const removedCandidates: PrintfulCandidate[] = [];

						// Helper to parse discontinued item indexes from Printful error text/JSON
						const extractDiscontinuedIndexes = (input: string | null): number[] => {
							if (!input) return [];
							try {
								// JSON responses sometimes include a `result` string with the message
								const parsed = JSON.parse(input) as Record<string, unknown> | null;
								if (
									parsed &&
									"result" in parsed &&
									typeof (parsed as Record<string, unknown>).result === "string"
								) {
									input = String((parsed as Record<string, unknown>).result);
								}
							} catch (e) {
								// not JSON, continue with raw text
							}

							const matches = Array.from((input || "").matchAll(/Item\s*(\d+):[^\n]*discontinued/gi));
							return matches.map((m) => Number(m[1]));
						};

						while (attempt < maxAttempts && attemptItems.length > 0 && !created) {
							attempt++;
							const res = await fetch("https://api.printful.com/orders", {
								method: "POST",
								headers: {
									Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									external_id: externalId,
									recipient,
									items: attemptItems,
									confirm: false,
								}),
							});

							if (res.ok) {
								const body = await res.json().catch(() => null);
								console.log("✅ Printful order created (draft)", { items: attemptItems, response: body });
								created = true;
								break;
							}

							// Read text body for diagnostics and attempt to parse discontinued item indexes
							const text = await res.text().catch(() => null);
							console.error("❌ Printful error:", res.status, text);

							const discontinuedIdx = extractDiscontinuedIndexes(text);
							if (discontinuedIdx.length === 0) {
								// nothing we can do — break and bail out
								break;
							}

							// Remove the discontinued items by index. Printful indexes items in the order sent (0-based in messages).
							const toRemove = new Set(discontinuedIdx);
							const prevCount = attemptItems.length;
							const removed = attemptCandidates.filter((_, idx) => toRemove.has(idx));
							removedCandidates.push(...removed);
							attemptCandidates = attemptCandidates.filter((_, idx) => !toRemove.has(idx));
							attemptItems = attemptCandidates.map((c) => c.payload);
							console.warn(
								`⚠️ Removed ${prevCount - attemptItems.length} discontinued Printful item(s) and retrying (attempt ${attempt}/${maxAttempts})`,
							);
						}

						if (!created && attemptItems.length === 0) {
							console.warn("⚠️ All Printful items were discontinued/removed; not creating a Printful order.");
						}

						if (removedCandidates.length > 0) {
							const updates: Array<Promise<Stripe.Price>> = [];
							const seen = new Set<string>();
							for (const candidate of removedCandidates) {
								if (!candidate.priceId) continue;
								if (seen.has(candidate.priceId)) continue;
								seen.add(candidate.priceId);
								const metadata = {
									...(candidate.priceMetadata ?? {}),
									printful_discontinued: "true",
								};

								updates.push(
									stripe.prices
										.update(candidate.priceId, { metadata })
										.catch((err) => {
											console.error(
												`⚠️ Failed to flag price ${candidate.priceId} as Printful discontinued`,
												err,
											);
											throw err;
										}),
								);
							}

							if (updates.length > 0) {
								await Promise.allSettled(updates);
							}
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
