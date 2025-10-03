// src/lib/products/getWebflowProductData.ts
import type Stripe from "stripe";

import { env } from "@/env.mjs";
import { type KitPrice, type KitProduct, provider } from "@/lib/stripe/commerce";

type ProductMetadata = {
	category?: string;
	demo_url?: string;
	website_url?: string;
	preview_url?: string;
	github_url?: string;
	features?: string;
	license?: string;
} & Record<string, unknown>;

export type WebflowLinkKind = "demo" | "preview" | "website" | "github";
export type WebflowSelections = {
	isWebflow: boolean;
	links: Array<{ kind: WebflowLinkKind; href: string; label: string }>;
	featurePairs: Array<{ title: string; text: string }>;
	license?: string;
};

const clean = (v?: unknown) => (typeof v === "string" ? v.trim() : undefined);
const norm = (v?: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const isLikelyUrl = (s?: string): s is string =>
	!!s && (/^https?:\/\//i.test(s) || /^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(s));
const withProto = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`);

function parseFeaturePairs(raw?: string): Array<{ title: string; text: string }> {
	if (!raw) return [];
	const parts = raw
		.split(" - ")
		.map((s) => s.trim())
		.filter(Boolean);
	const items: Array<{ title: string; text: string }> = [];
	for (let i = 0; i < parts.length; i += 2) items.push({ title: parts[i] ?? "", text: parts[i + 1] ?? "" });
	return items;
}

function hasAnyOptional(meta?: ProductMetadata) {
	if (!meta) return false;
	return Boolean(
		meta.demo_url || meta.website_url || meta.preview_url || meta.github_url || meta.features || meta.license,
	);
}

function hasStringRecordMetadata(v: unknown): v is { metadata?: Record<string, string> } {
	if (!v || typeof v !== "object") return false;
	const md = (v as { metadata?: unknown }).metadata;
	if (md == null) return true;
	if (typeof md !== "object") return false;
	for (const [k, val] of Object.entries(md as Record<string, unknown>)) {
		if (typeof k !== "string" || (val != null && typeof val !== "string")) return false;
	}
	return true;
}

function sanitizeMetadata(metadata: unknown): ProductMetadata {
	const result: ProductMetadata = {};
	if (!metadata || typeof metadata !== "object") return result;
	for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
		if (typeof value === "string") {
			result[key] = value;
		}
	}
	return result;
}

export async function getWebflowSelections(
	product: KitProduct,
	selectedPrice?: KitPrice,
): Promise<WebflowSelections> {
	let productMeta = sanitizeMetadata(product.metadata);
	let priceMetaRaw = sanitizeMetadata(selectedPrice?.metadata);

	const isWebflow =
		norm(productMeta.category) === "webflow" ||
		(!productMeta.category && norm(priceMetaRaw.category) === "webflow");

	if (isWebflow && !hasAnyOptional(productMeta) && !hasAnyOptional(priceMetaRaw) && env.STRIPE_SECRET_KEY) {
		try {
			const stripe = provider({ secretKey: env.STRIPE_SECRET_KEY, tagPrefix: undefined });
			const raw = await stripe.products.retrieve(product.id, { expand: ["default_price"] });

			productMeta = sanitizeMetadata(raw.metadata);

			if (!selectedPrice && raw.default_price && hasStringRecordMetadata(raw.default_price)) {
				priceMetaRaw = sanitizeMetadata(raw.default_price.metadata ?? {});
			}
		} catch (error) {
			if (process.env.NODE_ENV !== "production") {
				console.warn("Webflow fallback fetch failed:", error);
			}
		}
	}

	const { category: _ignore, ...priceMeta } = priceMetaRaw;
	const merged: ProductMetadata = { ...productMeta, ...priceMeta };

	const demo_url = clean(merged.demo_url);
	const website_url = clean(merged.website_url);
	const preview_url = clean(merged.preview_url);
	const github_url = clean(merged.github_url);
	const features = clean(merged.features);
	const license = clean(merged.license);

	const links: WebflowSelections["links"] = [];
	if (isLikelyUrl(demo_url)) links.push({ kind: "demo", href: withProto(demo_url), label: "View Live Demo" });
	if (isLikelyUrl(preview_url))
		links.push({ kind: "preview", href: withProto(preview_url), label: "Preview in Webflow" });
	if (isLikelyUrl(website_url))
		links.push({ kind: "website", href: withProto(website_url), label: "Visit Website" });
	if (isLikelyUrl(github_url))
		links.push({ kind: "github", href: withProto(github_url), label: "View on GitHub" });

	let featurePairs = parseFeaturePairs(features);
	if (!featurePairs.length && features) featurePairs = [{ title: "Features", text: features }];

	return { isWebflow, links, featurePairs, license };
}
