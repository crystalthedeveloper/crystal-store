import "dotenv/config";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(key, { apiVersion: "2025-09-30.clover" });

(async () => {
  const prices = await stripe.prices.list({ limit: 100, active: true });
  const apparel = prices.data.filter((price) => (price.metadata?.category ?? "").toLowerCase() === "apparel");

  const missing = apparel.filter((price) => !price.metadata?.printful_sync_variant_id);
  console.log("Total apparel prices:", apparel.length);
  console.log("Missing printful_sync_variant_id:", missing.length);
  console.log(
    missing.map((price) => ({
      id: price.id,
      product: price.product,
      metadata: price.metadata,
    })),
  );
})();
