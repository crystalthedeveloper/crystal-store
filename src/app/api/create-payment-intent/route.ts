// src/app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { env } from "@/env.mjs";

export async function POST() {
	try {
		// Defensive: ensure secret exists at runtime
		if (!env.STRIPE_SECRET_KEY) {
			console.error("❌ STRIPE_SECRET_KEY is missing at runtime");
			return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
		}

		// Initialize Stripe client at runtime
		const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
			apiVersion: "2023-10-16" as Stripe.LatestApiVersion, // ✅ safe cast
		});

		const cart = await getCartFromCookiesAction();
		if (!cart || cart.lines.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// Calculate total amount
		const amount = cart.lines.reduce((total, line) => {
			const unit = line.product.default_price.unit_amount ?? 0;
			return total + unit * line.quantity;
		}, 0);

		if (amount <= 0) {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

		// Create PaymentIntent
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: env.STRIPE_CURRENCY ?? "usd",
			automatic_payment_methods: { enabled: true },
		});

		return NextResponse.json({ clientSecret: paymentIntent.client_secret });
	} catch (err) {
		console.error("PaymentIntent creation error:", err);
		return NextResponse.json({ error: "Unable to create payment intent" }, { status: 500 });
	}
}
