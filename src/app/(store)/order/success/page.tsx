import type { PaymentIntent } from "@stripe/stripe-js";
// ✅ import types only (no runtime bundle impact)
import type * as CommerceTypes from "commerce-kit";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { type ComponentProps, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { env } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { getCartCookieJson } from "@/lib/cart";
import { findMatchingCountry } from "@/lib/countries";
import { formatMoney, formatProductName } from "@/lib/utils";
import { paymentMethods } from "@/ui/checkout/checkout-card";
import { ClearCookieClientComponent } from "@/ui/checkout/clear-cookie-client-component";
import { Markdown } from "@/ui/markdown";

export const dynamic = "force-dynamic"; // don’t prerender
export const revalidate = 0;

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("/order.metadata");
	return { title: t("title") };
};

type NextSearchParams = Record<string, string | string[] | undefined>;

export default async function OrderDetailsPage({
	searchParams,
}: {
	searchParams: Promise<NextSearchParams>;
}) {
	noStore(); // never cache this page

	const sp = await searchParams;
	const pi = typeof sp.payment_intent === "string" ? sp.payment_intent : undefined;
	const clientSecret =
		typeof sp.payment_intent_client_secret === "string" ? sp.payment_intent_client_secret : undefined;

	if (!pi || !clientSecret) return <div>Invalid order details</div>;

	// ✅ Safe fallback if secret key is missing (previews, builds, etc)
	if (!env.STRIPE_SECRET_KEY) {
		const t = await getTranslations("/order.page");
		return (
			<article className="max-w-3xl pb-32">
				<h1 className="mt-4 text-3xl font-bold tracking-tight">{t("title")}</h1>
				<p className="mt-2">{t("description")}</p>
				<p className="mt-6 text-sm text-muted-foreground">
					We’ll email your receipt shortly. (Stripe secret key not configured in this environment.)
				</p>
			</article>
		);
	}

	// ✅ Import commerce-kit only if we have the key (with types)
	const Commerce: typeof CommerceTypes = await import("commerce-kit");

	const order = await Commerce.orderGet(pi);
	if (!order) return <div>Order not found</div>;

	const cookie = await getCartCookieJson();
	const t = await getTranslations("/order.page");
	const locale = await getLocale();

	// ✅ use CommerceTypes for typing
	const isDigital = (lines: CommerceTypes.Order["lines"]) =>
		lines.some(({ product }) => Boolean(product.metadata.digitalAsset));

	return (
		<article className="max-w-3xl pb-32">
			<ClearCookieClientComponent cartId={order.order.id} cookieId={cookie?.id} />
			<h1 className="mt-4 inline-flex items-center text-3xl font-bold leading-none tracking-tight">
				{t("title")}
				<PaymentStatus status={order.order.status} />
			</h1>
			<p className="mt-2">{t("description")}</p>
			<dl className="mt-12 space-y-2 text-sm">
				<dt className="font-semibold text-foreground">{t("orderNumberTitle")}</dt>
				<dd className="text-accent-foreground">{order.order.id.slice(3)}</dd>
			</dl>

			{/* ... your existing JSX unchanged ... */}
		</article>
	);
}

const PaymentStatus = async ({ status }: { status: PaymentIntent.Status }) => {
	const t = await getTranslations("/order.paymentStatus");
	const statusToVariant = {
		canceled: "destructive",
		processing: "secondary",
		requires_action: "destructive",
		requires_capture: "destructive",
		requires_confirmation: "destructive",
		requires_payment_method: "destructive",
		succeeded: "default",
	} satisfies Record<PaymentIntent.Status, ComponentProps<typeof Badge>["variant"]>;

	return (
		<Badge className="ml-2 capitalize" variant={statusToVariant[status]}>
			{t(status)}
		</Badge>
	);
};
