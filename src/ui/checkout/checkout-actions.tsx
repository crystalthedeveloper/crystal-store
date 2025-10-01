// src/ui/checkout/checkout-actions.tsx
"use server";

import Stripe from "stripe";
import { env } from "@/env.mjs";

if (!env.STRIPE_SECRET_KEY) {
	throw new Error("❌ Missing STRIPE_SECRET_KEY in environment variables");
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: "2025-07-30.basil", // ✅ stable API version
});

/**
 * ✅ Create a Stripe Checkout Session
 * @param items Array of cart items [{ price, quantity }]
 * @returns session.url to redirect the user
 */
export async function createCheckoutSessionAction(items: { price: string; quantity: number }[]) {
	if (!items || items.length === 0) {
		throw new Error("Cart is empty");
	}

	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items: items.map((i) => ({
				price: i.price, // Stripe Price ID
				quantity: i.quantity,
			})),
			success_url: `${env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${env.NEXT_PUBLIC_URL}/checkout/cancel`,

			// ✅ Collect both billing & shipping
			billing_address_collection: "required",
			shipping_address_collection: {
				allowed_countries: ["US", "CA"], // adjust to your markets
			},

			// ✅ Enable Stripe tax calculation
			automatic_tax: { enabled: true },
		});

		return { url: session.url };
	} catch (err) {
		console.error("❌ Stripe Checkout Session error:", err);
		throw new Error("Unable to create checkout session");
	}
}
