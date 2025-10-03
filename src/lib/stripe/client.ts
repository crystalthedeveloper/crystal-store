// src/lib/stripe/client.ts
import Stripe from "stripe";

import { env } from "@/env.mjs";

const API_VERSION: Stripe.StripeConfig["apiVersion"] = "2025-09-30.clover";

function isCloudflareWorker() {
	try {
		return typeof navigator !== "undefined" && Boolean(navigator.userAgent?.includes("Cloudflare-Workers"));
	} catch {
		return false;
	}
}

function buildConfig(): Stripe.StripeConfig {
	const config: Stripe.StripeConfig = { apiVersion: API_VERSION };
	if (isCloudflareWorker() && typeof Stripe.createFetchHttpClient === "function") {
		config.httpClient = Stripe.createFetchHttpClient(fetch);
	}
	return config;
}

let stripeSingleton: Stripe | null = null;

export function getStripeClient(): Stripe {
	if (!env.STRIPE_SECRET_KEY) {
		throw new Error("Stripe secret key is not configured");
	}

	if (!stripeSingleton) {
		stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY, buildConfig());
	}

	return stripeSingleton;
}

export function createStripeClient(secretKey: string): Stripe {
	return new Stripe(secretKey, buildConfig());
}

export const stripeApiVersion = API_VERSION;
