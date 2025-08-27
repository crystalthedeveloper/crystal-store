// src/app/api/create-payment-intent/route.ts

import * as Commerce from "commerce-kit";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/env.mjs";
import { getCartCookieJson } from "@/lib/cart"; // safe, not a server action

export async function POST() {
	try {
		if (!env.STRIPE_SECRET_KEY) {
			console.error("❌ STRIPE_SECRET_KEY is missing at runtime");
			return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
		}

		const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
			apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
		});

		// ✅ read cart from cookie instead of server action
		const cartJson = await getCartCookieJson();
		if (!cartJson?.id) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const cart = await Commerce.cartGet(cartJson.id);
		if (!cart || !cart.lines?.length) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// ✅ safer unit price lookup
		const amount = cart.lines.reduce((total, line) => {
			const unit =
				(typeof line.product.default_price === "object" ? line.product.default_price?.unit_amount : 0) ?? 0;
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
