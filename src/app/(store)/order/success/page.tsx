// src/app/(store)/order/success/page.tsx
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import type Stripe from "stripe";
import { Badge } from "@/components/ui/badge";
import { env } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { createStripeClient } from "@/lib/stripe/client";
import { collectVariantDisplayParts, formatMoney, formatProductName } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("/order.metadata");
	return { title: t("title") };
};

type NextSearchParams = Record<string, string | string[] | undefined>;

const stripe = env.STRIPE_SECRET_KEY ? createStripeClient(env.STRIPE_SECRET_KEY) : null;

const getFirstMetadataValue = (metadata: Record<string, string | undefined>, keys: string[]) => {
	for (const key of keys) {
		const value = metadata[key];
		if (typeof value !== "string") continue;
		const trimmed = value.trim();
		if (!trimmed) continue;
		return trimmed;
	}

	return undefined;
};

const COLOR_METADATA_KEYS = ["color", "colour"];
const SIZE_METADATA_KEYS = ["size"];
const VARIANT_METADATA_KEYS = ["variant", "variant_label", "variant_title", "variant_name"];

export default async function OrderDetailsPage({
	searchParams,
}: {
	searchParams: Promise<NextSearchParams>;
}) {
	noStore();

	const sp = await searchParams;
	const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
	const subscriptionSessionId =
		typeof sp.subscription_session_id === "string" ? sp.subscription_session_id : undefined;
	const subscriptionWasCancelled = sp.subscription_cancelled === "1";

	if (!sessionId) return <div>Missing session_id</div>;

	if (!stripe) {
		const t = await getTranslations("/order.page");
		return (
			<article className="max-w-3xl pb-32">
				<h1 className="mt-4 text-3xl font-bold tracking-tight">{t("title")}</h1>
				<p className="mt-2">{t("description")}</p>
				<p className="mt-6 text-sm text-muted-foreground">
					We’ll email your receipt shortly. (Stripe secret key not configured.)
				</p>
			</article>
		);
	}

	let subscriptionSession: Stripe.Checkout.Session | null = null;
	if (subscriptionSessionId && subscriptionSessionId !== sessionId) {
		subscriptionSession = await stripe.checkout.sessions.retrieve(subscriptionSessionId, {
			expand: ["line_items", "line_items.data.price.product", "payment_intent", "customer"],
		});

		const subscriptionComplete =
			subscriptionSession?.status === "complete" || subscriptionSession?.payment_status === "paid";

		if (!subscriptionWasCancelled && !subscriptionComplete && subscriptionSession?.url) {
			redirect(subscriptionSession.url);
		}
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId, {
		expand: ["line_items", "line_items.data.price.product", "payment_intent", "customer"],
	});

	if (!session) return <div>Order not found</div>;

	const linkedSessionsMap = new Map<string, Stripe.Checkout.Session>();
	linkedSessionsMap.set(session.id, session);

	if (
		subscriptionSession &&
		!subscriptionWasCancelled &&
		(subscriptionSession.payment_status === "paid" || subscriptionSession.status === "complete") &&
		!linkedSessionsMap.has(subscriptionSession.id)
	) {
		linkedSessionsMap.set(subscriptionSession.id, subscriptionSession);
	}
	const linkedPaymentSessionId = session.metadata?.payment_session_id;

	if (typeof linkedPaymentSessionId === "string" && linkedPaymentSessionId) {
		try {
			const linkedSession = await stripe.checkout.sessions.retrieve(linkedPaymentSessionId, {
				expand: ["line_items", "line_items.data.price.product", "payment_intent", "customer"],
			});

			const linkedComplete =
				linkedSession.payment_status === "paid" || linkedSession.status === "complete";

			if (linkedSession && linkedComplete && !linkedSessionsMap.has(linkedSession.id)) {
				linkedSessionsMap.set(linkedSession.id, linkedSession);
			}
		} catch (error) {
			console.error("Unable to load linked checkout session", error);
		}
	}

	const linkedSessions = Array.from(linkedSessionsMap.values()).sort((a, b) => {
		const score = (session: Stripe.Checkout.Session) => {
			if (session.mode === "payment") return 0;
			if (session.payment_status === "paid" || session.status === "complete") return 1;
			return 2;
		};
		return score(a) - score(b);
	});

	const paidSessions = linkedSessions.filter(
		(s) => s.payment_status === "paid" || s.status === "complete" || s.mode === "payment",
	);
	const hasPaidReceipt = paidSessions.length > 0;
	const sessionsForDisplay = hasPaidReceipt ? paidSessions : [session];
	const primarySession = sessionsForDisplay[0] ?? session;

	const t = await getTranslations("/order.page");
	const locale = await getLocale();
	const allLineItems = sessionsForDisplay.flatMap((s) => s.line_items?.data ?? []);
	const totalAmount = sessionsForDisplay.reduce((sum, s) => sum + (s.amount_total ?? 0), 0);
	const currency = primarySession.currency ?? sessionsForDisplay.find((s) => s.currency)?.currency ?? "usd";

	return (
		<article className="max-w-3xl pb-32">
			<h1 className="mt-4 inline-flex items-center text-3xl font-bold leading-none tracking-tight">
				{t("title")}
				<PaymentStatus status={primarySession.payment_status} />
			</h1>
			<p className="mt-2">{t("description")}</p>

			{subscriptionWasCancelled ? (
				<p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
					The subscription portion of this order was cancelled. The summary below shows the one-time
					items that were successfully paid.
					{!hasPaidReceipt && " We were unable to locate the matching payment receipt."}
				</p>
			) : null}

				<dl className="mt-12 space-y-2 text-sm">
					<dt className="font-semibold text-foreground">{t("orderNumberTitle")}</dt>
					<dd className="text-accent-foreground">{primarySession.id}</dd>
				</dl>

			<h2 className="sr-only">{t("productsTitle")}</h2>
			{/* Products List */}
			<ul role="list" className="my-8 space-y-6">
				{allLineItems.map((line) => {
					const product = line.price?.product;
					const priceMetadata = (line.price?.metadata ?? {}) as Record<string, string | undefined>;
					const productMetadata =
						typeof product === "object" && product && !product.deleted
							? ((product.metadata ?? {}) as Record<string, string | undefined>)
							: {};
					const priceColor = getFirstMetadataValue(priceMetadata, COLOR_METADATA_KEYS);
					const productColor = getFirstMetadataValue(productMetadata, COLOR_METADATA_KEYS);
					const color = priceColor ?? productColor;
					const size = getFirstMetadataValue(priceMetadata, SIZE_METADATA_KEYS);
					const priceVariant = getFirstMetadataValue(priceMetadata, VARIANT_METADATA_KEYS);
					const productVariant = getFirstMetadataValue(productMetadata, VARIANT_METADATA_KEYS);
					const baseName =
						typeof product === "object" && product && !product.deleted
							? (product.name ?? line.description ?? "Product")
							: (line.description ?? "Product");
					const variantFallback = priceVariant ?? productVariant;
					const shouldUseMetadata = !variantFallback && !color && !size;
					const metadataForParts = shouldUseMetadata ? { ...productMetadata, ...priceMetadata } : undefined;
					const variantParts = collectVariantDisplayParts({
						additional: [color, size],
						variant: variantFallback,
						metadata: metadataForParts,
					});
					const displayName = formatProductName(baseName, variantParts);
					return (
						<li key={line.id} className="flex items-start gap-6 rounded-lg border p-4 shadow-sm">
							{/* Product Image */}
							{typeof product === "object" &&
								product &&
								"images" in product &&
								Array.isArray(product.images) &&
								product.images.length > 0 && (
									<Image
										src={product.images[0] as string}
										alt={displayName}
										width={100}
										height={100}
										className="h-24 w-24 rounded-md object-cover"
										priority
									/>
								)}

							{/* Product Details */}
							<div className="flex-1">
								<h3 className="font-semibold text-lg text-neutral-900">{displayName}</h3>

								<div className="mt-2 grid grid-cols-3 gap-4 text-sm text-muted-foreground leading-relaxed">
									<div>
										<p className="font-medium">{t("price")}</p>
										<p className="leading-relaxed">
											{formatMoney({
												amount: line.price?.unit_amount ?? 0,
												currency: line.price?.currency ?? "usd",
												locale,
											})}
										</p>
									</div>
									<div>
										<p className="font-medium">{t("quantity")}</p>
										<p>{line.quantity}</p>
									</div>
									<div>
										<p className="font-medium">{t("total")}</p>
										<p className="leading-relaxed">
											{formatMoney({
												amount: (line.price?.unit_amount ?? 0) * (line.quantity ?? 1),
												currency: line.price?.currency ?? "usd",
												locale,
											})}
										</p>
									</div>
								</div>
							</div>
						</li>
					);
				})}
			</ul>

			<div className="col-span-2 grid grid-cols-2 gap-8 border-t pt-8">
				<h3 className="font-semibold leading-none text-neutral-700">{t("total")}</h3>
				<p className="leading-relaxed">
					{formatMoney({
						amount: totalAmount,
						currency,
						locale,
					})}
				</p>
			</div>
		</article>
	);
}

const PaymentStatus = ({ status }: { status: string }) => {
	const statusToVariant = {
		canceled: "destructive",
		processing: "secondary",
		unpaid: "destructive",
		paid: "default",
	} as const;

	const variant: ComponentProps<typeof Badge>["variant"] =
		statusToVariant[status as keyof typeof statusToVariant] ?? "secondary";

	return (
		<Badge className="ml-2 capitalize" variant={variant}>
			{status}
		</Badge>
	);
};
