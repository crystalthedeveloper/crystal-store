// src/app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { env } from "@/env.mjs";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-07-30.basil",
});

export async function POST() {
	try {
		const cart = await getCartFromCookiesAction();
		if (!cart || cart.lines.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const amount = cart.lines.reduce((total, line) => {
			const unit = line.product.default_price.unit_amount ?? 0;
			return total + unit * line.quantity;
		}, 0);

		if (amount <= 0) {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

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
