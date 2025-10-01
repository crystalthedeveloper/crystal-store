// src/app/(store)/cart/layout.tsx
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "@/i18n/server";
import { CartSummaryTable } from "@/ui/checkout/cart-summary-table";
import CheckoutForm from "@/ui/checkout/checkout-form"; // ✅ use CheckoutForm directly

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CartLayout({ children }: { children: ReactNode }) {
	const t = await getTranslations("/cart.page");
	const locale = (await getLocale()) ?? "en";

	return (
		<div className="min-h-[calc(100dvh-7rem)] xl:grid xl:grid-cols-12 xl:gap-x-8">
			{/* Cart summary (left) */}
			<div className="my-8 xl:col-span-7">
				<div className="sticky top-1">
					<h1 className="mb-4 text-3xl font-bold leading-none tracking-tight">{t("title")}</h1>
					<CartSummaryTable locale={locale} />
				</div>
			</div>

			{/* Checkout (right) */}
			<div className="my-8 max-w-[65ch] xl:col-span-5">
				<CheckoutForm locale={locale} title={t("checkoutTitle")} description={t("checkoutDescription")} />
				{children}
			</div>
		</div>
	);
}
