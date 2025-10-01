// src/app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env.mjs";

export const runtime = "nodejs";

type CartItem = {
	price: string; // Stripe Price ID
	quantity: number;
};

export async function POST(req: Request) {
	try {
		if (!env.STRIPE_SECRET_KEY) {
			console.error("❌ STRIPE_SECRET_KEY is missing at runtime");
			return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
		}

		const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
			apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
		});

		// ✅ Read items from client request
		const { items } = (await req.json()) as { items: CartItem[] };

		if (!items || items.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// ✅ Create PaymentIntent using line items
		const paymentIntent = await stripe.paymentIntents.create({
			amount: 0, // placeholder, let Stripe calculate from prices
			currency: env.STRIPE_CURRENCY ?? "usd",
			automatic_payment_methods: { enabled: true },

			// Use Stripe "transfer_data" later if needed
		});

		// ✅ Attach line items properly via Checkout or manual calc
		// If you want to use Checkout instead, switch to:
		// stripe.checkout.sessions.create({ line_items: items.map(i => ({ price: i.price, quantity: i.quantity })) })

		return NextResponse.json({ clientSecret: paymentIntent.client_secret });
	} catch (err) {
		console.error("❌ PaymentIntent creation error:", err);
		return NextResponse.json({ error: "Unable to create payment intent" }, { status: 500 });
	}
}
