// src/app/(store)/cart/layout.tsx
import type { ReactNode } from "react";
import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { env } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";

import { CartEmpty } from "@/ui/checkout/cart-empty";
import { CartSummaryTable } from "@/ui/checkout/cart-summary-table";
import { StripeElementsContainer } from "@/ui/checkout/stripe-elements-container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Type safely infer the result of commerce-kit/contextGet without a static import
type ContextGetResult = Awaited<ReturnType<typeof import("commerce-kit")["contextGet"]>>;

export default async function CartLayout({ children }: { children: ReactNode }) {
	const cart = await getCartFromCookiesAction();

	// If there’s no cart or client secret, show the empty state as before
	if (!cart?.cart.client_secret || cart.lines.length === 0) {
		return <CartEmpty />;
	}

	const t = await getTranslations("/cart.page");
	// ✅ Always fallback to "en" so it's never undefined
	const locale = (await getLocale()) ?? "en";

	// If Stripe is NOT configured in this environment, show the cart summary but omit payment UI
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<div className="min-h-[calc(100dvh-7rem)] xl:grid xl:grid-cols-12 xl:gap-x-8">
				<div className="my-8 xl:col-span-7">
					<div className="sticky top-1">
						<h1 className="mb-4 text-3xl font-bold leading-none tracking-tight">{t("title")}</h1>
						<div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
							Checkout is disabled in this environment (Stripe is not configured).
						</div>
						<CartSummaryTable cart={structuredClone(cart)} locale={locale} />
					</div>
				</div>
				<div className="my-8 max-w-[65ch] xl:col-span-5" />
			</div>
		);
	}

	// Stripe exists: load commerce-kit at runtime (no static import)
	let context: ContextGetResult | null = null;
	try {
		const { contextGet } = await import("commerce-kit");
		context = await contextGet();
	} catch (e) {
		console.warn("CartLayout: commerce-kit contextGet failed; rendering without payment form.", e);
		return (
			<div className="min-h-[calc(100dvh-7rem)] xl:grid xl:grid-cols-12 xl:gap-x-8">
				<div className="my-8 xl:col-span-7">
					<div className="sticky top-1">
						<h1 className="mb-4 text-3xl font-bold leading-none tracking-tight">{t("title")}</h1>
						<div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
							We couldn’t load the payment form right now. Please try again later.
						</div>
						<CartSummaryTable cart={structuredClone(cart)} locale={locale} />
					</div>
				</div>
				<div className="my-8 max-w-[65ch] xl:col-span-5" />
			</div>
		);
	}

	// Fallback to env if context has no publishableKey
	const publishableKey = context?.publishableKey || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
	const stripeAccount = context?.stripeAccount;

	if (!publishableKey) {
		return (
			<div className="min-h-[calc(100dvh-7rem)] xl:grid xl:grid-cols-12 xl:gap-x-8">
				<div className="my-8 xl:col-span-7">
					<div className="sticky top-1">
						<h1 className="mb-4 text-3xl font-bold leading-none tracking-tight">{t("title")}</h1>
						<div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
							Payment configuration is incomplete. Please try again later.
						</div>
						<CartSummaryTable cart={structuredClone(cart)} locale={locale} />
					</div>
				</div>
				<div className="my-8 max-w-[65ch] xl:col-span-5" />
			</div>
		);
	}

	// Normal path: wrap with Stripe Elements
	return (
		<StripeElementsContainer
			clientSecret={cart.cart.client_secret}
			publishableKey={publishableKey}
			stripeAccount={stripeAccount}
			locale={locale}
		>
			<div className="min-h-[calc(100dvh-7rem)] xl:grid xl:grid-cols-12 xl:gap-x-8">
				<div className="my-8 xl:col-span-7">
					<div className="sticky top-1">
						<h1 className="mb-4 text-3xl font-bold leading-none tracking-tight">{t("title")}</h1>
						<CartSummaryTable cart={structuredClone(cart)} locale={locale} />
					</div>
				</div>
				<div className="my-8 max-w-[65ch] xl:col-span-5">{children}</div>
			</div>
		</StripeElementsContainer>
	);
}
