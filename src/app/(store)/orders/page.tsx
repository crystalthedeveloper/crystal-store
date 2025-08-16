// app/(store)/orders/page.tsx

import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { env } from "@/env.mjs";

export const runtime = "nodejs";
export const prerender = false; // stop SSG in Webflow build
export const dynamic = "force-dynamic"; // render at request time
export const revalidate = 0;

export const metadata: Metadata = {
	title: "Your Orders",
};

export default async function OrderPage() {
	noStore();

	// If secrets aren't present (e.g. Webflow build), don't import anything that hits Stripe.
	if (!env.STRIPE_SECRET_KEY) {
		return (
			<div className="py-10">
				<h1 className="text-2xl font-bold mb-5">Your Orders</h1>
				<p className="text-sm text-muted-foreground">
					Orders are only available at runtime. (No Stripe secret configured in this environment.)
				</p>
			</div>
		);
	}

	// ✅ Import AFTER the guard so Stripe/commerce code isn't evaluated at build time
	const { OrderList } = await import("@/ui/order-list");

	return (
		<div className="py-10">
			<h1 className="text-2xl font-bold mb-5">Your Orders</h1>
			<OrderList />
		</div>
	);
}
