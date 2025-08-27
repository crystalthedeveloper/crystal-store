// src/app/api/cart/add/route.ts
import * as Commerce from "commerce-kit";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getCartCookieJson, setCartCookieJson } from "@/lib/cart";

// Request body
type AddToCartBody = {
	productId: string;
	priceId?: string;
};

// Shape of what Commerce.cartAdd actually returns
type CommerceCart = {
	id: string;
	metadata: Record<string, string | undefined>; // can contain undefined
	[key: string]: unknown;
};

type CartAddResponse = { cart: CommerceCart };

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as AddToCartBody;
		const { productId, priceId } = body;

		if (!productId) {
			return NextResponse.json({ error: "Missing productId" }, { status: 400 });
		}

		// Fetch existing cart from cookie
		const cartJson = await getCartCookieJson();
		const cart = cartJson?.id ? await Commerce.cartGet(cartJson.id) : null;

		// 👇 explicitly cast through unknown so TS stops complaining
		const updated = (await Commerce.cartAdd({
			productId,
			cartId: cart?.cart?.id,
			...(priceId ? { priceId } : {}),
		})) as unknown as CartAddResponse;

		if (!updated?.cart) {
			return NextResponse.json({ error: "Failed to add" }, { status: 500 });
		}

		const updatedCart = updated.cart;

		// ✅ filter out undefined values and ensure correct typing
		const safeMetadata = Object.fromEntries(
			Object.entries(updatedCart.metadata).filter(
				(entry): entry is [string, string] => typeof entry[1] === "string",
			),
		);

		// Update cookies with safe metadata
		await setCartCookieJson({
			id: updatedCart.id,
			linesCount: Commerce.cartCount(safeMetadata),
		});

		// Revalidate cache
		revalidateTag(`cart-${updatedCart.id}`);

		return NextResponse.json({ cart: updatedCart });
	} catch (err) {
		console.error("❌ add-to-cart API error", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
