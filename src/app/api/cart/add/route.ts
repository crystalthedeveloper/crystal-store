// src/app/api/cart/add/route.ts
import * as Commerce from "commerce-kit";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getCartCookieJson, setCartCookieJson } from "@/lib/cart";

export const runtime = "nodejs";

type AddToCartBody = { productId: string; priceId?: string };

// Minimal cart type we care about
interface Cart {
	id: string;
	metadata?: Record<string, unknown>;
	[key: string]: unknown;
}

// ✅ helper for filtering string-only metadata
function isStringEntry(entry: [string, unknown]): entry is [string, string] {
	return typeof entry[1] === "string";
}

export async function POST(req: Request) {
	try {
		const { productId, priceId } = (await req.json()) as AddToCartBody;
		if (!productId) {
			return NextResponse.json({ error: "Missing productId" }, { status: 400 });
		}

		// Ensure we have a cartId (cookie → or create)
		let cartId = (await getCartCookieJson())?.id;
		if (!cartId) {
			const created = (await Commerce.cartCreate()) as unknown as Cart;
			cartId = created.id;
			await setCartCookieJson({ id: cartId, linesCount: 0 });
		}

		// Add to cart (Commerce SDK returns wrapped response → cast via unknown)
		const cart = (await Commerce.cartAdd({
			cartId,
			productId,
			...(priceId ? { priceId } : {}),
		})) as unknown as Cart;

		if (!cart?.id) {
			return NextResponse.json({ error: "cartAdd returned no cart" }, { status: 500 });
		}

		// ✅ Safe metadata → strings only
		const safeMeta = Object.fromEntries(Object.entries(cart.metadata ?? {}).filter(isStringEntry)) as Record<
			string,
			string
		>;

		await setCartCookieJson({
			id: cart.id,
			linesCount: Commerce.cartCount(safeMeta),
		});

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
