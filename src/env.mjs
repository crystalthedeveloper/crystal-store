// @ts-check
// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** Helper: parse "true"/"false"/"1"/"0" to boolean */
const zBool = z
	.string()
	.optional()
	.transform((v) => v === "true" || v === "1");

/** Helper: ensure basePath starts with a single leading slash and no trailing slash */
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
		// Stripe: keep optional so builds don’t fail when the secret isn’t present
		STRIPE_SECRET_KEY: z.string().optional(),
		STRIPE_WEBHOOK_SECRET: z.string().optional(),
		// Currency: default to "cad" based on your setup; change if needed
		STRIPE_CURRENCY: z.string().default("cad"),

		// Feature flags / booleans
		ENABLE_STRIPE_TAX: zBool,

		// Search (Trieve)
		TRIEVE_DATASET_ID: z.string().optional(),
		TRIEVE_API_KEY: z.string().optional(),

		// Printful
		PRINTFUL_API_KEY: z.string().optional(),
		PRINTFUL_STORE_ID: z.string().optional(),
	},

	client: {
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_BASE_PATH: zBasePath,

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

		TRIEVE_DATASET_ID: process.env.TRIEVE_DATASET_ID,
		TRIEVE_API_KEY: process.env.TRIEVE_API_KEY,

		PRINTFUL_API_KEY: process.env.PRINTFUL_API_KEY,
		PRINTFUL_STORE_ID: process.env.PRINTFUL_STORE_ID,

		// client
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
		NEXT_PUBLIC_NEWSLETTER_ENDPOINT: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT,
		NEXT_PUBLIC_LANGUAGE: process.env.NEXT_PUBLIC_LANGUAGE,
	},
});

// ---- Public URL fallback (Vercel-style), but don’t crash builds ----
const vercelHost =
	process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
		? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
		: process.env.NEXT_PUBLIC_VERCEL_URL;

const vercelUrl = vercelHost ? `https://${vercelHost}` : undefined;

/**
 * Prefer explicit NEXT_PUBLIC_URL; otherwise fall back to Vercel computed host.
 * As a last resort (any env), use localhost so it's never undefined.
 */
const computedPublicUrl = env.NEXT_PUBLIC_URL ?? vercelUrl ?? "http://localhost:3000";

// Optional visibility in prod when falling back
if (!env.NEXT_PUBLIC_URL && process.env.NODE_ENV === "production") {
	// eslint-disable-next-line no-console
	console.warn(
		'WARN: No NEXT_PUBLIC_URL provided; defaulting to "http://localhost:3000". ' +
			"Set NEXT_PUBLIC_URL in your environment for correct absolute metadata URLs.",
	);
}

// Always export a string so `new URL(publicUrl)` is safe
export const publicUrl /**: string */ = computedPublicUrl;
