// src/app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env.mjs";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-07-30.basil",
});

function requireEnv(value: string | undefined, name: string): string {
	if (!value) throw new Error(`❌ Missing required env variable: ${name}`);
	return value;
}

// Define expected cart item type
type CartItem = {
	name: string;
	price: number; // in cents
	quantity: number;
	image?: string;
};

export async function POST(req: Request) {
	try {
		// ✅ Safely parse request body
		const body = (await req.json()) as { cart?: CartItem[] };
		const { cart } = body;

		const baseUrl = requireEnv(process.env.NEXT_PUBLIC_URL, "NEXT_PUBLIC_URL");

		if (!cart || cart.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// ✅ Map cart items → Stripe line_items
		const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((item) => ({
			price_data: {
				currency: "cad",
				product_data: {
					name: item.name,
					...(item.image && { images: [item.image] }),
				},
				unit_amount: item.price,
			},
			quantity: item.quantity,
		}));

		// ✅ Create checkout session with success + cancel routes
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items,
			billing_address_collection: "required",
			shipping_address_collection: {
				allowed_countries: ["CA", "US"],
			},
			automatic_tax: { enabled: true },
			success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/cart`,
		});

		if (!session.url) {
			return NextResponse.json({ error: "❌ Stripe did not return a URL" }, { status: 500 });
		}

		return NextResponse.json({ url: session.url });
	} catch (err) {
		console.error("❌ Stripe error:", err);

		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unknown error creating checkout session" },
			{ status: 500 },
		);
	}
}
