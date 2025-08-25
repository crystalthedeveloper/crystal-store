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
		// Stripe: required in production, optional in dev so local builds don’t break
		STRIPE_SECRET_KEY: z.string().optional(),
		STRIPE_WEBHOOK_SECRET: z.string().optional(),
		STRIPE_CURRENCY: z.string().default("cad"),

		ENABLE_STRIPE_TAX: zBool,

		PRINTFUL_API_KEY: z.string().optional(),
		PRINTFUL_STORE_ID: z.string().optional(),

		// Trieve (search) – optional
		TRIEVE_DATASET_ID: z.string().optional(),
		TRIEVE_API_KEY: z.string().optional(),
	},

	client: {
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_BASE_PATH: zBasePath,
		NEXT_PUBLIC_LANGUAGE: z.string().default("en-US").optional(),
	},

	runtimeEnv: process.env,
});

// Public URL fallback
const vercelHost =
	process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
		? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
		: process.env.NEXT_PUBLIC_VERCEL_URL;

const vercelUrl = vercelHost ? `https://${vercelHost}` : undefined;

export const publicUrl = env.NEXT_PUBLIC_URL ?? vercelUrl ?? "http://localhost:3000";
