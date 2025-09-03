// src/lib/products/getVariantSelections.ts
import type { KitPrice } from "./getProductWithPrices";

export function getVariantSelections(prices: KitPrice[], searchParams: { color?: string; size?: string }) {
	// 🔑 Collect unique normalized colors
	const allColors = Array.from(
		new Set(prices.map((p) => p.metadata?.color?.toLowerCase().trim()).filter(Boolean) as string[]),
	);

	// 🔑 Pick current color (or default to first available)
	const selectedColor = searchParams.color?.toLowerCase().trim() ?? allColors[0];

	// 🔑 Collect unique sizes for this color
	const sizesForColor = Array.from(
		new Set(
			prices
				.filter((p) => p.metadata?.color?.toLowerCase().trim() === selectedColor)
				.map((p) => p.metadata?.size?.toLowerCase().trim())
				.filter(Boolean) as string[],
		),
	);

	// 🔑 Pick current size (or default to first available)
	const selectedSize = searchParams.size?.toLowerCase().trim() ?? sizesForColor[0];

	// 🔑 Find exact matching price (color + size)
	const selectedPrice =
		prices.find(
			(p) =>
				p.metadata?.color?.toLowerCase().trim() === selectedColor &&
				p.metadata?.size?.toLowerCase().trim() === selectedSize,
		) ??
		// fallback: color only
		prices.find((p) => p.metadata?.color?.toLowerCase().trim() === selectedColor) ??
		// fallback: any
		prices[0];

	return {
		allColors,
		selectedColor,
		sizesForColor,
		selectedSize,
		selectedPrice,
	};
}
