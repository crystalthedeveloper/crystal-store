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

// ✅ Stripe supported locales
const STRIPE_SUPPORTED_LOCALES = [
	"auto",
	"bg",
	"cs",
	"da",
	"de",
	"el",
	"en",
	"en-GB",
	"es",
	"es-419",
	"et",
	"fi",
	"fil",
	"fr",
	"fr-CA",
	"hr",
	"hu",
	"id",
	"it",
	"ja",
	"ko",
	"lt",
	"lv",
	"ms",
	"mt",
	"nb",
	"nl",
	"pl",
	"pt",
	"pt-BR",
	"ro",
	"ru",
	"sk",
	"sl",
	"sv",
	"th",
	"tr",
	"vi",
	"zh",
	"zh-HK",
	"zh-TW",
] as const;

type StripeLocale = (typeof STRIPE_SUPPORTED_LOCALES)[number];

function normalizeLocale(locale: string | undefined): StripeLocale {
	if (!locale) return "en";
	return STRIPE_SUPPORTED_LOCALES.includes(locale as StripeLocale) ? (locale as StripeLocale) : "en";
}

export default async function CartLayout({ children }: { children: ReactNode }) {
	const cart = await getCartFromCookiesAction();

	if (!cart?.cart.client_secret || cart.lines.length === 0) {
		return <CartEmpty />;
	}

	const t = await getTranslations("/cart.page");

	// ✅ Normalize locale into a Stripe-supported one
	const locale = normalizeLocale(await getLocale());

	// If Stripe is NOT configured
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

	// Stripe exists
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

	// Normal path
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
