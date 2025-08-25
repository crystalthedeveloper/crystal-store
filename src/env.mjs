// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const zBool = z
	.string()
	.optional()
	.transform((v) => v === "true" || v === "1");
const zBasePath = z
	.string()
	.optional()
	.transform((v) => {
		if (!v) return undefined;
		let s = v.trim();
		if (!s.startsWith("/")) s = `/${s}`;
		if (s !== "/" && s.endsWith("/")) s = s.slice(0, -1);
		return s;
	});

export const env = createEnv({
	server: {
		// Stripe (required in production, optional locally)
		STRIPE_SECRET_KEY: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
		STRIPE_WEBHOOK_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
		STRIPE_CURRENCY: z.string().default("cad"),

		ENABLE_STRIPE_TAX: zBool,

		// Printful
		PRINTFUL_API_KEY: z.string().optional(),
		PRINTFUL_STORE_ID: z.string().optional(),
	},

	client: {
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_BASE_PATH: zBasePath,
	},

	runtimeEnv: {
		// server
		STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
		STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		STRIPE_CURRENCY: process.env.STRIPE_CURRENCY,

		ENABLE_STRIPE_TAX: process.env.ENABLE_STRIPE_TAX,

		PRINTFUL_API_KEY: process.env.PRINTFUL_API_KEY,
		PRINTFUL_STORE_ID: process.env.PRINTFUL_STORE_ID,

		// client
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
	},
});

// Public URL fallback
const vercelHost =
	process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
		? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
		: process.env.NEXT_PUBLIC_VERCEL_URL;

const vercelUrl = vercelHost ? `https://${vercelHost}` : undefined;

export const publicUrl = env.NEXT_PUBLIC_URL ?? vercelUrl ?? "http://localhost:3000";
