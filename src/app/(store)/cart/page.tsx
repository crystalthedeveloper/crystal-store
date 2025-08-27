// src/app/(store)/cart/page.tsx
import type { Metadata } from "next/types";
import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { getTranslations } from "@/i18n/server";
import { CartEmpty } from "@/ui/checkout/cart-empty";
import { CheckoutCard } from "@/ui/checkout/checkout-card";

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("/cart.metadata");
	return { title: t("title") };
};

export default async function CartPage() {
	const cart = await getCartFromCookiesAction();

	// 🚨 Guard against missing or empty cart
	if (!cart || !cart.lines?.length || !cart.cart?.client_secret) {
		return <CartEmpty />;
	}

	return <CheckoutCard cart={structuredClone(cart)} />;
}
