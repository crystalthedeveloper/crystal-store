// src/lib/products/getVariantSelections.ts
import type { KitPrice } from "./getProductWithPrices";

export function getVariantSelections(prices: KitPrice[], searchParams: { color?: string; size?: string }) {
	const allColors = Array.from(
		new Set(prices.map((p) => p.metadata?.color?.toLowerCase()).filter(Boolean) as string[]),
	);

	const selectedColor = searchParams.color?.toLowerCase() ?? allColors[0];

	const sizesForColor = Array.from(
		new Set(
			prices
				.filter((p) => p.metadata?.color?.toLowerCase() === selectedColor)
				.map((p) => p.metadata?.size?.toLowerCase())
				.filter(Boolean) as string[],
		),
	);

	const selectedSize = searchParams.size?.toLowerCase() ?? sizesForColor[0];

	const selectedPrice =
		prices.find(
			(p) =>
				p.metadata?.color?.toLowerCase() === selectedColor &&
				p.metadata?.size?.toLowerCase() === selectedSize,
		) ??
		prices.find((p) => p.metadata?.color?.toLowerCase() === selectedColor) ??
		prices[0];

	return { allColors, selectedColor, sizesForColor, selectedSize, selectedPrice };
}
