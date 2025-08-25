//src/app/(store)/orders/page.tsx
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // stop prerender
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = { title: "Your Orders" };

export default async function OrderPage() {
	noStore();

	// ✅ check env at runtime, not via env.mjs (prevents 404)
	const stripeKey = process.env.STRIPE_SECRET_KEY;

	if (!stripeKey) {
		return (
			<div className="py-10">
				<h1 className="text-2xl font-bold mb-5">Your Orders</h1>
				<p className="text-sm text-muted-foreground">
					Orders are only available at runtime. (No Stripe secret configured.)
				</p>
			</div>
		);
	}

	// ✅ dynamically import OrderList after env check
	const { OrderList } = await import("@/ui/order-list");

	return (
		<div className="py-10">
			<h1 className="text-2xl font-bold mb-5">Your Orders</h1>

			<Suspense fallback={<p className="text-sm text-muted-foreground">Loading your orders…</p>}>
				<OrderList />
			</Suspense>
		</div>
	);
}
