// src/lib/stripe/client.ts
import Stripe from "stripe";
import { env } from "@/env.mjs";

const API_VERSION: Stripe.StripeConfig["apiVersion"] = "2025-09-30.clover";

let stripeSingleton: Stripe | null = null;

export function getStripeClient(): Stripe {
	if (!env.STRIPE_SECRET_KEY) {
		throw new Error("Stripe secret key is not configured");
	}

	if (!stripeSingleton) {
		stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY, {
			apiVersion: API_VERSION,
		});
	}

	return stripeSingleton;
}

export function createStripeClient(secretKey: string): Stripe {
	return new Stripe(secretKey, {
		apiVersion: API_VERSION,
	});
}

export const stripeApiVersion = API_VERSION;
