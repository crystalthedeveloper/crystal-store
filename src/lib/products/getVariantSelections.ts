// src/lib/products/getVariantSelections.ts
import type { KitPrice } from "./getProductWithPrices";

type SearchParams = { color?: string; size?: string };

export function getVariantSelections(prices: KitPrice[], searchParams: SearchParams) {
	// 🔑 Collect unique colors (preserve original casing for UI)
	const allColors = Array.from(
		new Map(
			prices
				.map((p) => {
					const raw = p.metadata?.color?.trim();
					return raw ? [raw.toLowerCase(), raw] : null;
				})
				.filter((entry): entry is [string, string] => Boolean(entry)),
		).values(),
	);

	// 🔑 Pick current color (normalize for matching, but display with original casing)
	const selectedColor =
		allColors.find((c) => c.toLowerCase() === searchParams.color?.toLowerCase().trim()) ?? allColors[0];

	// 🔑 Collect unique sizes for this color (preserve casing)
	const sizesForColor = Array.from(
		new Map(
			prices
				.filter((p) => p.metadata?.color?.toLowerCase().trim() === selectedColor?.toLowerCase())
				.map((p) => {
					const raw = p.metadata?.size?.trim();
					return raw ? [raw.toLowerCase(), raw] : null;
				})
				.filter((entry): entry is [string, string] => Boolean(entry)),
		).values(),
	);

	// 🔑 Pick current size
	const selectedSize =
		sizesForColor.find((s) => s.toLowerCase() === searchParams.size?.toLowerCase().trim()) ??
		sizesForColor[0];

	// 🔑 Find exact matching price (color + size)
	const selectedPrice =
		prices.find(
			(p) =>
				p.metadata?.color?.toLowerCase().trim() === selectedColor?.toLowerCase() &&
				p.metadata?.size?.toLowerCase().trim() === selectedSize?.toLowerCase(),
		) ??
		// fallback: color only
		prices.find((p) => p.metadata?.color?.toLowerCase().trim() === selectedColor?.toLowerCase()) ??
		// fallback: any
		prices[0];

	return {
		allColors, // e.g. ["Black", "Green", "Blue"]
		selectedColor, // UI-safe string
		sizesForColor, // e.g. ["XS", "S", "M", "L"]
		selectedSize, // UI-safe string
		selectedPrice, // Stripe price object
		variantMetadata: selectedPrice?.metadata ?? {}, // includes printful_sync_variant_id, image_url, etc.
	};
}
