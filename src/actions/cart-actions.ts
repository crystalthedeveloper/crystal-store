// src/actions/cart-actions.ts
"use server";

import Stripe from "stripe";
import { env } from "@/env.mjs";

// ✅ Ensure Stripe secret key exists
if (!env.STRIPE_SECRET_KEY) {
	throw new Error("❌ Missing STRIPE_SECRET_KEY in environment variables");
}

// ✅ Use a valid Stripe API version (update when Stripe releases new versions)
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: "2025-07-30.basil",
});

// Strong type for supported currencies
type SupportedCurrency = "cad";

/**
 * Create a PaymentIntent for the embedded PaymentElement
 */
export async function createPaymentIntentAction(amount: number, currency: SupportedCurrency = "cad") {
	if (!amount || amount <= 0) {
		throw new Error("❌ Invalid payment amount");
	}

	try {
		const intent = await stripe.paymentIntents.create({
			amount,
			currency,
			automatic_payment_methods: { enabled: true },
			payment_method_options: {
				card: { request_three_d_secure: "automatic" },
			},
		});

		return { clientSecret: intent.client_secret };
	} catch (err) {
		console.error("❌ Stripe PaymentIntent error:", err);
		throw new Error("Unable to create PaymentIntent");
	}
}

/**
 * Create a Checkout Session for hosted Stripe Checkout
 * (Always collects full billing address)
 */
export async function createCheckoutSessionAction(amount: number, currency: SupportedCurrency = "cad") {
	if (!amount || amount <= 0) {
		throw new Error("❌ Invalid checkout amount");
	}

	// ✅ Ensure NEXT_PUBLIC_URL exists
	const baseUrl = process.env.NEXT_PUBLIC_URL;
	if (!baseUrl) {
		throw new Error("❌ Missing NEXT_PUBLIC_URL in environment variables");
	}

	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency,
						product_data: {
							name: "Cart Purchase", // 👉 Replace with actual cart summary later
						},
						unit_amount: amount, // amount in cents
					},
					quantity: 1,
				},
			],
			billing_address_collection: "required", // 👈 Force full billing address
			success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/checkout/cancel`,
		});

		return { sessionId: session.id };
	} catch (err) {
		console.error("❌ Stripe Checkout Session error:", err);
		throw new Error("Unable to create Checkout Session");
	}
}
