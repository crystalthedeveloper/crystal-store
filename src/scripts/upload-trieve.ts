import NextEnv from "@next/env";

import { type ChunkReqPayload, TrieveSDK } from "trieve-ts-sdk";
import { getStripeClient } from "@/lib/stripe/client";
import { mapProducts } from "@/lib/stripe/commerce";

NextEnv.loadEnvConfig(".");

const { env } = await import("@/env.mjs");

const datasetId = env.TRIEVE_DATASET_ID;
const apiKey = env.TRIEVE_API_KEY;

if (!datasetId || !apiKey) {
	console.error("Missing TRIEVE_API_KEY or TRIEVE_DATASET_ID");
	process.exit(1);
}

export const trieve = new TrieveSDK({ apiKey, datasetId });

const stripe = getStripeClient();

const data = await stripe.products.list({
	limit: 100,
	active: true,
	expand: ["data.default_price"],
});
const chunks = mapProducts(data).flatMap((product): ChunkReqPayload | ChunkReqPayload[] => {
	const slug = product.metadata.slug;
	if (!product.default_price.unit_amount || !slug) {
		return [];
	}
	const link = product.metadata.variant
		? `/product/${slug}?variant=${product.metadata.variant}`
		: `/product/${slug}`;
	return {
		chunk_html: `
Product Name: ${product.name}

Description: ${product.description}
`.trim(),
		image_urls: product.images,
		tracking_id: product.id,
		upsert_by_tracking_id: true,
		link,
		metadata: {
			name: product.name,
			description: product.description,
			slug,
			image_url: product.images[0],
			amount: product.default_price.unit_amount,
			currency: product.default_price.currency,
		} satisfies TrieveProductMetadata,
	};
});

const r = await trieve.createChunk(chunks);

console.log("Done", r);

export type TrieveProductMetadata = {
	name: string;
	description: string | null;
	slug: string;
	image_url: string | undefined;
	amount: number;
	currency: string;
};
