// src/app/api/cart/add/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AddToCartBody = {
	productId: string;
	priceId: string; // Stripe Price ID
	quantity?: number;
	color?: string;
	size?: string;
	variant?: string;
};

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as AddToCartBody;

		const { productId, priceId, quantity = 1, color, size, variant } = body;

		if (!productId || !priceId) {
			return NextResponse.json({ error: "Missing productId or priceId" }, { status: 400 });
		}

		// ✅ Normalize metadata for consistency
		const normalizedMetadata = {
			color: color?.toLowerCase().trim() || "",
			size: size?.toLowerCase().trim() || "",
			variant: variant?.trim() || "",
		};

		// ✅ Echo back the cart line item
		const lineItem = {
			productId,
			priceId,
			quantity,
			metadata: normalizedMetadata,
		};

		return NextResponse.json({ lineItem });
	} catch (err: unknown) {
		console.error("❌ /api/cart/add fatal:", err);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		);
	}
}
