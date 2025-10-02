// src/lib/products/getProductWithPrices.ts
import {
	getProductWithPrices as fetchProductWithPrices,
	type KitPrice,
	type KitProduct,
} from "@/lib/stripe/commerce";

export type { KitPrice, KitProduct };

export async function getProductWithPrices(
	slug: string,
): Promise<{ product: KitProduct; prices: KitPrice[] }> {
	return fetchProductWithPrices(slug);
}
