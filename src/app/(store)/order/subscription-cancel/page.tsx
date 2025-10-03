// src/app/(store)/order/subscription-cancel/page.tsx
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { env } from "@/env.mjs";
import { createStripeClient } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type NextSearchParams = Record<string, string | string[] | undefined>;

const stripe = env.STRIPE_SECRET_KEY ? createStripeClient(env.STRIPE_SECRET_KEY) : null;

export default async function SubscriptionCancelPage({
	searchParams,
}: {
	searchParams: Promise<NextSearchParams>;
}) {
	noStore();

	const sp = await searchParams;
	const subscriptionSessionId =
		typeof sp.subscription_session_id === "string" ? sp.subscription_session_id : undefined;

	if (!subscriptionSessionId) {
		redirect("/cart");
	}

	if (!stripe) {
		redirect(`/order/success?session_id=${subscriptionSessionId}&skip_subscription_redirect=1`);
	}

	try {
		const session = await stripe.checkout.sessions.retrieve(subscriptionSessionId);
		const paymentSessionId = session.metadata?.payment_session_id;

		if (typeof paymentSessionId === "string" && paymentSessionId.trim().length > 0) {
			const params = new URLSearchParams({
				session_id: paymentSessionId,
				subscription_session_id: subscriptionSessionId,
				skip_subscription_redirect: "1",
			});

			redirect(`/order/success?${params.toString()}`);
		}
	} catch (error) {
		console.error("Unable to resolve linked payment session after subscription cancel", error);
	}

	redirect(`/cart`);
}
