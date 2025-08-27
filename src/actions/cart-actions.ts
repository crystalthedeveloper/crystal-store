// src/actions/cart-actions.ts
"use server";

import * as Commerce from "commerce-kit";
import { revalidateTag } from "next/cache";
import { clearCartCookie, getCartCookieJson, setCartCookieJson } from "@/lib/cart";

type CartAddInput = {
	productId: string;
	cartId?: string;
	priceId?: string; // ✅ allow optional priceId without any
};

export async function getCartFromCookiesAction() {
	const cartJson = await getCartCookieJson();
	if (!cartJson) {
		return null;
	}

	const cart = await Commerce.cartGet(cartJson.id);
	if (cart) {
		return structuredClone(cart);
	}
	return null;
}

export async function setInitialCartCookiesAction(cartId: string, linesCount: number) {
	await setCartCookieJson({
		id: cartId,
		linesCount,
	});
	revalidateTag(`cart-${cartId}`);
}

export async function findOrCreateCartIdFromCookiesAction() {
	const cart = await getCartFromCookiesAction();
	if (cart) {
		return structuredClone(cart);
	}

	const newCart = await Commerce.cartCreate();
	await setCartCookieJson({
		id: newCart.id,
		linesCount: 0,
	});
	revalidateTag(`cart-${newCart.id}`);

	return newCart.id;
}

export async function clearCartCookieAction() {
	const cookie = await getCartCookieJson();
	if (!cookie) {
		return;
	}

	await clearCartCookie();
	revalidateTag(`cart-${cookie.id}`);
	// FIXME not ideal, revalidate per domain instead (multi-tenant)
	revalidateTag(`admin-orders`);
}

export async function addToCartAction(formData: FormData) {
	const productId = formData.get("productId");
	const priceId = formData.get("priceId");

	if (!productId || typeof productId !== "string") {
		throw new Error("Invalid product ID");
	}

	console.log("[cart-actions] addToCartAction →", { productId, priceId });

	const cart = await getCartFromCookiesAction();
	console.log("[cart-actions] existing cart:", cart?.cart?.id);

	const input: CartAddInput = {
		productId,
		cartId: cart?.cart?.id,
		...(typeof priceId === "string" ? { priceId } : {}),
	};

	const updatedCart = await Commerce.cartAdd(input);

	console.log("[cart-actions] updated cart:", updatedCart);

	if (updatedCart) {
		await setCartCookieJson({
			id: updatedCart.id,
			linesCount: Commerce.cartCount(updatedCart.metadata),
		});

		revalidateTag(`cart-${updatedCart.id}`);
		return structuredClone(updatedCart);
	}
}

export async function increaseQuantity(productId: string) {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		throw new Error("Cart not found");
	}
	await Commerce.cartChangeQuantity({
		productId,
		cartId: cart.cart.id,
		operation: "INCREASE",
	});
}

export async function decreaseQuantity(productId: string) {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		throw new Error("Cart not found");
	}
	await Commerce.cartChangeQuantity({
		productId,
		cartId: cart.cart.id,
		operation: "DECREASE",
	});
}

export async function setQuantity({
	productId,
	cartId,
	quantity,
}: {
	productId: string;
	cartId: string;
	quantity: number;
}) {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		throw new Error("Cart not found");
	}
	await Commerce.cartSetQuantity({ productId, cartId, quantity });
}

export async function commerceGPTRevalidateAction() {
	const cart = await getCartCookieJson();
	if (cart) {
		revalidateTag(`cart-${cart.id}`);
	}
}
