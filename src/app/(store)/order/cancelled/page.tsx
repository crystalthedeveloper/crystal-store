// src/app/(store)/order/cancelled/page.tsx
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createStripeClient } from "@/lib/stripe/client";
import { env } from "@/env.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = async (): Promise<Metadata> => ({
	title: "Subscription checkout cancelled",
});

type NextSearchParams = Record<string, string | string[] | undefined>;

const stripe = env.STRIPE_SECRET_KEY ? createStripeClient(env.STRIPE_SECRET_KEY) : null;

export default async function OrderCancelledPage({
	searchParams,
}: {
	searchParams: Promise<NextSearchParams>;
}) {
	noStore();

	const sp = await searchParams;
	const subscriptionSessionId =
		typeof sp.subscription_session_id === "string" ? sp.subscription_session_id : undefined;
	const paymentSessionIdParam =
		typeof sp.payment_session_id === "string" ? sp.payment_session_id : undefined;
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

	if (paymentSessionIdParam) {
		const url = `${basePath}/order/success?session_id=${encodeURIComponent(
			paymentSessionIdParam,
		)}${
			subscriptionSessionId
				? `&subscription_session_id=${encodeURIComponent(subscriptionSessionId)}`
				: ""
		}&subscription_cancelled=1`;
		redirect(url);
	}

	let metadataPaymentSessionId: string | undefined;
	if (subscriptionSessionId && stripe) {
		try {
			const subscriptionSession = await stripe.checkout.sessions.retrieve(subscriptionSessionId);
			const paymentSessionId = subscriptionSession.metadata?.payment_session_id;

			if (typeof paymentSessionId === "string" && paymentSessionId) {
				metadataPaymentSessionId = paymentSessionId;
			}
		} catch (error) {
			console.error("Unable to resolve linked payment session after subscription cancellation", error);
		}
	}

	if (metadataPaymentSessionId) {
		const url = `${basePath}/order/success?session_id=${encodeURIComponent(
			metadataPaymentSessionId,
		)}${
			subscriptionSessionId
				? `&subscription_session_id=${encodeURIComponent(subscriptionSessionId)}`
				: ""
		}&subscription_cancelled=1`;
		redirect(url);
	}

	return (
		<article className="max-w-3xl pb-32">
			<h1 className="mt-4 text-3xl font-bold tracking-tight">Subscription checkout cancelled</h1>
			<p className="mt-2 text-muted-foreground">
				We could not find the linked one-time payment receipt for this subscription checkout. If you
				completed a payment, check your email for the receipt or return to your cart to review your
				items.
			</p>
			<Link
				href="/cart"
				className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
			>
				Return to cart
			</Link>
		</article>
	);
}
