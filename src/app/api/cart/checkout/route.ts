// src/app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

// ✅ Prevent static optimization / pre-rendering
export const dynamic = "force-dynamic";

// ✅ Env loader with fallback for Webflow Cloud
function requireEnv(name: string): string {
	const val =
		process.env[name] ||
		(name === "STRIPE_SECRET_KEY" ? process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY : undefined);

	if (!val) throw new Error(`❌ Missing required env variable: ${name}`);
	return val;
}

type CartItem = {
	name: string;
	price: number; // already in cents
	quantity: number;
	image?: string;
};

export async function POST(req: Request) {
	try {
		console.log("📩 Incoming checkout request...");

		const body = (await req.json()) as { cart?: CartItem[] };
		const { cart } = body;
		console.log("🛒 Cart body:", JSON.stringify(cart, null, 2));

		const baseUrl = requireEnv("NEXT_PUBLIC_URL");
		const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
		const stripeSecret = requireEnv("STRIPE_SECRET_KEY");

		console.log("🌐 Base URL:", baseUrl);
		console.log("📂 Base Path:", basePath);
		console.log("🔑 Stripe Secret present?", !!stripeSecret);

		if (!cart || cart.length === 0) {
			console.warn("⚠️ Cart is empty!");
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const stripe = new Stripe(stripeSecret);
		console.log("✅ Stripe initialized");

		const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((item) => ({
			price_data: {
				currency: "cad",
				product_data: {
					name: item.name,
					...(item.image && { images: [item.image] }),
				},
				unit_amount: Math.round(item.price),
			},
			quantity: item.quantity,
		}));

		console.log("🧾 Stripe line items:", JSON.stringify(line_items, null, 2));

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items,
			billing_address_collection: "required",
			shipping_address_collection: { allowed_countries: ["CA", "US"] },
			automatic_tax: { enabled: true },
			success_url: `${baseUrl}${basePath}/order/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}${basePath}/cart`,
		});

		console.log("✅ Stripe session created:", session.id);

		if (!session.url) {
			console.error("❌ Stripe did not return a URL");
			return NextResponse.json({ error: "❌ Stripe did not return a URL" }, { status: 500 });
		}

		console.log("🔗 Checkout redirect URL:", session.url);
		return NextResponse.json({ url: session.url });
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("❌ Stripe checkout error:", err.message);
			return NextResponse.json({ error: err.message }, { status: 500 });
		}

		// handle non-Error values
		console.error("❌ Stripe checkout unknown error:", err);
		return NextResponse.json({ error: "Unknown error creating checkout session" }, { status: 500 });
	}
}
