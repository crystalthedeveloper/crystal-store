// @ts-check
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

		// ✅ Trieve (optional, for upload-trieve.ts)
		TRIEVE_DATASET_ID: z.string().optional(),
		TRIEVE_API_KEY: z.string().optional(),
	},

	client: {
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_BASE_PATH: zBasePath,

		// analytics / misc
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: z.string().optional(),
		NEXT_PUBLIC_LANGUAGE: z.string().optional().default("en-US"),
	},

	runtimeEnv: {
		// server
		STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
		STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		STRIPE_CURRENCY: process.env.STRIPE_CURRENCY,

		ENABLE_STRIPE_TAX: process.env.ENABLE_STRIPE_TAX,

		PRINTFUL_API_KEY: process.env.PRINTFUL_API_KEY,
		PRINTFUL_STORE_ID: process.env.PRINTFUL_STORE_ID,

		// ✅ include Trieve
		TRIEVE_DATASET_ID: process.env.TRIEVE_DATASET_ID,
		TRIEVE_API_KEY: process.env.TRIEVE_API_KEY,

		// client
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT,
		NEXT_PUBLIC_LANGUAGE: process.env.NEXT_PUBLIC_LANGUAGE,
	},
});

// ---- Public URL fallback ----
const vercelHost =
	process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
		? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
		: process.env.NEXT_PUBLIC_VERCEL_URL;

const vercelUrl = vercelHost ? `https://${vercelHost}` : undefined;

export const publicUrl = env.NEXT_PUBLIC_URL ?? vercelUrl ?? "http://localhost:3000";
