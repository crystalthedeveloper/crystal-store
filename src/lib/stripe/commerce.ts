// src/lib/stripe/commerce.ts
import type Stripe from "stripe";

import { env } from "@/env.mjs";

import { createStripeClient, getStripeClient } from "./client";

export type StripeMetadata = Record<string, string>;

export type KitPrice = Stripe.Price & {
	metadata: StripeMetadata;
};

export type KitProduct = Stripe.Product & {
	default_price: Stripe.Price | null;
	metadata: StripeMetadata;
};

export type MappedProduct = {
	id: string;
	name: string;
	description: string | null;
	images: string[];
	metadata: StripeMetadata;
	default_price: {
		id: string;
		unit_amount: number | null;
		currency: string;
	};
	updated: number;
};

type ProductBrowseParams = {
	first?: number;
	filter?: {
		category?: string;
	};
};

type ProductGetParams = {
	slug: string;
	expand?: string[];
};

type ProviderConfig = {
	secretKey?: string;
	cache?: RequestCache;
	tagPrefix?: string;
};

function ensureStripe(): Stripe {
	return getStripeClient();
}

function sanitizeMetadata(metadata?: Stripe.Metadata | null): StripeMetadata {
	const result: StripeMetadata = {};
	if (!metadata) return result;
	for (const [key, value] of Object.entries(metadata)) {
		if (typeof value === "string") {
			result[key] = value;
		}
	}
	return result;
}

async function ensureDefaultPrice(stripe: Stripe, product: Stripe.Product): Promise<Stripe.Price | null> {
	const raw = product.default_price;
	if (!raw) return null;
	if (typeof raw === "string") {
		return await stripe.prices.retrieve(raw);
	}
	return raw as Stripe.Price;
}

function toKitProduct(product: Stripe.Product, defaultPrice: Stripe.Price | null): KitProduct {
	return {
		...product,
		default_price: defaultPrice,
		metadata: sanitizeMetadata(product.metadata),
	};
}

function toKitPrice(price: Stripe.Price): KitPrice {
	return {
		...price,
		currency: price.currency.toUpperCase(),
		metadata: sanitizeMetadata(price.metadata),
	};
}

function toMappedProduct(product: KitProduct): MappedProduct {
	const defaultPrice = product.default_price;
	return {
		id: product.id,
		name: product.name,
		description: product.description,
		images: Array.isArray(product.images) ? product.images : [],
		metadata: product.metadata,
		default_price: {
			id: typeof defaultPrice?.id === "string" ? defaultPrice.id : (product.default_price?.id ?? ""),
			unit_amount: defaultPrice?.unit_amount ?? null,
			currency: defaultPrice?.currency?.toUpperCase() ?? env.STRIPE_CURRENCY ?? "USD",
		},
		updated: typeof product.updated === "number" ? product.updated : 0,
	};
}

function buildMetadataQuery(field: string, value: string): string {
	const escaped = value.replace(/['"\\]/g, "\\$&");
	return `metadata['${field}']:'${escaped}'`;
}

function buildCategoryQuery(category: string): string {
	return `active:'true' AND ${buildMetadataQuery("category", category)}`;
}

async function searchProducts(stripe: Stripe, query: string, limit: number): Promise<Stripe.Product[]> {
	const response = await stripe.products.search({
		query,
		limit: Math.min(Math.max(limit, 1), 100),
		expand: ["data.default_price"],
	});
	return response.data;
}

async function listProducts(stripe: Stripe, limit: number): Promise<Stripe.Product[]> {
	const response = await stripe.products.list({
		active: true,
		limit: Math.min(Math.max(limit, 1), 100),
		expand: ["data.default_price"],
	});
	return response.data;
}

async function findProductBySlug(stripe: Stripe, slug: string): Promise<Stripe.Product | null> {
	// Try direct retrieval first (works if slug is actually the Stripe product id)
	if (/^prod_[A-Za-z0-9]+$/.test(slug)) {
		try {
			const product = await stripe.products.retrieve(slug, { expand: ["default_price"] });
			return product;
		} catch (err) {
			// ignore and fall back to metadata search
		}
	}

	const query = `active:'true' AND ${buildMetadataQuery("slug", slug)}`;
	const results = await searchProducts(stripe, query, 1);
	return results[0] ?? null;
}

export async function productBrowse(params: ProductBrowseParams = {}): Promise<MappedProduct[]> {
	if (!env.STRIPE_SECRET_KEY) return [];
	const stripe = ensureStripe();
	const limit = (params.first ?? params.filter) ? 100 : 20;

	let products: Stripe.Product[] = [];
	if (params.filter?.category) {
		products = await searchProducts(stripe, buildCategoryQuery(params.filter.category), limit);
	} else {
		products = await listProducts(stripe, limit);
	}

	return Promise.all(
		products.map(async (product) => {
			const defaultPrice = await ensureDefaultPrice(stripe, product);
			return toMappedProduct(toKitProduct(product, defaultPrice));
		}),
	);
}

export async function productGet(params: ProductGetParams): Promise<KitProduct[]> {
	if (!env.STRIPE_SECRET_KEY) return [];
	const stripe = ensureStripe();
	const product = await findProductBySlug(stripe, params.slug);
	if (!product) return [];
	const defaultPrice = await ensureDefaultPrice(stripe, product);
	return [toKitProduct(product, defaultPrice)];
}

export async function getProductWithPrices(
	slug: string,
): Promise<{ product: KitProduct; prices: KitPrice[] }> {
	if (!env.STRIPE_SECRET_KEY) {
		throw new Error("Stripe secret key is not configured");
	}

	const stripe = ensureStripe();
	const product = await findProductBySlug(stripe, slug);
	if (!product) {
		throw new Error("Product not found");
	}

	const defaultPrice = await ensureDefaultPrice(stripe, product);
	const kitProduct = toKitProduct(product, defaultPrice);

	const priceList = await stripe.prices.list({
		product: product.id,
		active: true,
		limit: 100,
	});

	const prices = priceList.data.map(toKitPrice);

	return { product: kitProduct, prices };
}

export async function getProductsFromMetadata(
	metadata: Record<string, string>,
): Promise<Array<{ product: KitProduct | null }>> {
	if (!env.STRIPE_SECRET_KEY) return [];
	const stripe = ensureStripe();

	const entries = Object.entries(metadata).filter(([key]) => key.startsWith("prod_"));

	return Promise.all(
		entries.map(async ([key]) => {
			const productId = key.slice("prod_".length);
			try {
				const product = await stripe.products.retrieve(productId, { expand: ["default_price"] });
				const kit = toKitProduct(product, await ensureDefaultPrice(stripe, product));
				return { product: kit };
			} catch {
				return { product: null };
			}
		}),
	);
}

export function provider(config: ProviderConfig = {}): Stripe {
	const key = config.secretKey ?? env.STRIPE_SECRET_KEY;
	if (!key) {
		throw new Error("Stripe secret key is not configured");
	}
	return createStripeClient(key);
}

export function mapProducts(response: Stripe.ApiList<Stripe.Product>): MappedProduct[] {
	return response.data.map((product) =>
		toMappedProduct(
			toKitProduct(
				product,
				product.default_price && typeof product.default_price === "object"
					? (product.default_price as Stripe.Price)
					: null,
			),
		),
	);
}
