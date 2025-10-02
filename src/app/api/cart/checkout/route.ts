// src/app/api/cart/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

// ✅ Prevent static optimization / pre-rendering
export const dynamic = "force-dynamic";

function requireEnv(value: string | undefined, name: string): string {
	if (!value) throw new Error(`❌ Missing required env variable: ${name}`);
	return value;
}

type CartItem = {
	name: string;
	price: number; // already in cents
	quantity: number;
	image?: string;
};

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as { cart?: CartItem[] };
		const { cart } = body;

		const baseUrl = requireEnv(process.env.NEXT_PUBLIC_URL, "NEXT_PUBLIC_URL"); // e.g. https://www.crystalthedeveloper.ca
		const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. /store
		const stripeSecret = requireEnv(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");

		if (!cart || cart.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// ✅ Safe Stripe init
		const stripe = new Stripe(stripeSecret);

		// ✅ Build Stripe line items
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

		// ✅ Create checkout session
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items,
			billing_address_collection: "required",
			shipping_address_collection: { allowed_countries: ["CA", "US"] },
			automatic_tax: { enabled: true },
			success_url: `${baseUrl}${basePath}/order/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}${basePath}/cart`,
		});

		if (!session.url) {
			return NextResponse.json({ error: "❌ Stripe did not return a URL" }, { status: 500 });
		}

		return NextResponse.json({ url: session.url });
	} catch (err) {
		console.error("❌ Stripe checkout error:", err);
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Unknown error creating checkout session" },
			{ status: 500 },
		);
	}
}
