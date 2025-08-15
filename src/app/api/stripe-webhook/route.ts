// app/api/stripe-webhook/route.ts
import * as Commerce from "commerce-kit";
import { cartMetadataSchema } from "commerce-kit/internal";
import { revalidateTag } from "next/cache";
import { env } from "@/env.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("STRIPE_WEBHOOK_SECRET is not configured", { status: 500 });
  }

  // Stripe sends "Stripe-Signature" (case-insensitive)
  const signature =
    req.headers.get("stripe-signature") || req.headers.get("Stripe-Signature");
  if (!signature) return new Response("No signature", { status: 400 });

  // Raw body is required for signature verification
  const rawBody = await req.text();

  // Use your real Stripe secret because we call Stripe APIs later
  const stripe = Commerce.provider({
    secretKey: env.STRIPE_SECRET_KEY,
    cache: "no-store",
    tagPrefix: undefined,
  });

  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      // ✅ Auto-fulfill apparel via Printful when Checkout completes
      case "checkout.session.completed": {
        if (!env.PRINTFUL_API_KEY) break; // skip quietly if Printful isn't configured

        const session = event.data.object as any;

        // Get the line items with expanded product metadata
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price.product"],
        });

        // Build Printful items ONLY for apparel with a numeric sync_variant_id
        const candidates = await Promise.all(
          lineItems.data.map(async (item: any) => {
            const category = String(item.price?.product?.metadata?.category || "").toLowerCase();
            if (category !== "apparel") return null;

            const syncId =
              item.price?.metadata?.sync_variant_id ??
              item.price?.product?.metadata?.sync_variant_id;

            if (!syncId || Number.isNaN(Number(syncId))) return null;

            // Optional: verify variant exists in Printful
            const ok = await fetch(`https://api.printful.com/store/variants/${syncId}`, {
              headers: { Authorization: `Bearer ${env.PRINTFUL_API_KEY}` },
            })
              .then((r) => r.ok)
              .catch(() => false);
            if (!ok) return null;

            return { sync_variant_id: Number(syncId), quantity: item.quantity ?? 1 };
          })
        );

        const items = (candidates.filter(Boolean) as Array<{
          sync_variant_id: number;
          quantity: number;
        }>) ?? [];

        if (items.length > 0) {
          const ship = session.shipping_details;
          const order = {
            recipient: {
              name: ship?.name || "Customer",
              address1: ship?.address?.line1 || "",
              address2: ship?.address?.line2 || "",
              city: ship?.address?.city || "",
              state_code: ship?.address?.state || "",
              country_code: ship?.address?.country || "CA",
              zip: ship?.address?.postal_code || "",
              email: session.customer_details?.email || "no-reply@example.com",
            },
            items,
            // confirm: true → start fulfillment immediately
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
            const text = await pfRes.text();
            console.error("Printful order creation failed:", text);
            // If you want Stripe to retry, return 500 here. Otherwise swallow:
            // return new Response("Printful error", { status: 500 });
          } else {
            console.log("✅ Printful order created for session:", session.id);
          }
        } else {
          console.warn("No apparel Printful items found on session:", session.id);
        }
        break;
      }

      // 🧾 Your existing tax + stock logic
      case "payment_intent.succeeded": {
        const pi = event.data.object as any;
        const metadata = cartMetadataSchema.parse(pi.metadata ?? {});

        if (metadata.taxCalculationId) {
          await stripe.tax.transactions.createFromCalculation({
            calculation: metadata.taxCalculationId,
            reference: pi.id.slice(3), // keep your existing reference scheme
          });
        }

        const products = await Commerce.getProductsFromMetadata(metadata);
        for (const { product } of products) {
          if (product && product.metadata?.stock !== Infinity) {
            const current = Number(product.metadata?.stock ?? 0);
            await stripe.products.update(product.id, {
              metadata: { stock: String(current - 1) },
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
