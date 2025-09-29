// src/app/api/cart/add/route.ts
import * as Commerce from "commerce-kit";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getCartCookieJson, setCartCookieJson } from "@/lib/cart";

export const runtime = "nodejs";

type AddToCartBody = {
	productId: string;
	priceId: string;
	quantity?: number;
	color?: string;
	size?: string;
	variant?: string;
};

interface Cart {
	id: string;
	lines?: unknown[];
	metadata?: Record<string, unknown>;
	[key: string]: unknown;
}

export async function POST(req: Request) {
	try {
		const { productId, priceId, quantity = 1, color, size, variant } = (await req.json()) as AddToCartBody;

		if (!productId || !priceId) {
			return NextResponse.json({ error: "Missing productId or priceId" }, { status: 400 });
		}

		// ✅ Normalize metadata values
		const normalizedColor = color?.toLowerCase().trim() ?? "";
		const normalizedSize = size?.toLowerCase().trim() ?? "";
		const normalizedVariant = variant?.trim() ?? "";

		// ✅ Ensure cartId
		let cartId = (await getCartCookieJson())?.id;
		if (!cartId) {
			const created = (await Commerce.cartCreate()) as unknown as Cart;
			cartId = created.id;
			await setCartCookieJson({ id: cartId, linesCount: 0 });
		}

		// Helper to add to cart
		const tryAddToCart = async (id: string) =>
			(
				Commerce.cartAdd as unknown as (args: {
					cartId: string;
					productId: string;
					lines: {
						price: string;
						quantity: number;
						metadata?: Record<string, string>;
					}[];
				}) => Promise<Cart>
			)({
				cartId: id,
				productId,
				lines: [
					{
						price: priceId,
						quantity,
						metadata: {
							color: normalizedColor,
							size: normalizedSize,
							variant: normalizedVariant,
						},
					},
				],
			});

		// ✅ Try adding; recover if "Cart not found"
		let cart: Cart | null = null;
		try {
			cart = await tryAddToCart(cartId);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : JSON.stringify(err);

			if (message.includes("Cart not found")) {
				console.warn("⚠️ Cart not found, creating a new one…");
				const created = (await Commerce.cartCreate()) as unknown as Cart;
				cartId = created.id;
				await setCartCookieJson({ id: cartId, linesCount: 0 });
				cart = await tryAddToCart(cartId);
			} else {
				throw err; // rethrow other errors
			}
		}

		if (!cart?.id) {
			return NextResponse.json({ error: "cartAdd returned no cart" }, { status: 500 });
		}

		// ✅ Cache revalidation (Next.js ISR)
		revalidateTag(`cart-${cart.id}`);

		return NextResponse.json({ cart });
	} catch (err: unknown) {
		console.error("❌ /api/cart/add fatal", err);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		);
	}
}
