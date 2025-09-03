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

		// ✅ Ensure cart exists
		let cartId = (await getCartCookieJson())?.id;
		if (!cartId) {
			const created = (await Commerce.cartCreate()) as unknown as Cart;
			cartId = created.id;
			await setCartCookieJson({ id: cartId, linesCount: 0 });
		}

		// ✅ Always add as a new line (no composite key merging)
		const cart = await (
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
			cartId,
			productId,
			lines: [
				{
					price: priceId,
					quantity,
					metadata: {
						color: normalizedColor,
						size: normalizedSize,
						variant: normalizedVariant,
						// ❌ removed compositeKey so lines never merge
					},
				},
			],
		});

		if (!cart?.id) {
			return NextResponse.json({ error: "cartAdd returned no cart" }, { status: 500 });
		}

		// ✅ Cache revalidation (Next.js ISR)
		revalidateTag(`cart-${cart.id}`);

		return NextResponse.json({ cart });
	} catch (err) {
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
