// src/ui/checkout/checkout-form.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/context/cart-store";
import { formatProductName } from "@/lib/utils";

type CheckoutSessionResponse = {
	url?: string;
	error?: string;
};

export default function CheckoutForm({
	locale,
	title,
	description,
	note,
}: {
	locale: string;
	title: string;
	description: string;
	note?: string;
}) {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const lines = useCartStore((s) => s.lines);

	const cart = lines.map((line) => {
		const variantParts = [line.metadata?.color, line.metadata?.size, line.variant];
		const displayName = formatProductName(line.name ?? "Unknown", variantParts);

		return {
			name: baseName,
			displayName, // ✅ "04H (Black / XS)"
			variantLabel: variantLabel || undefined,
			price: line.price,
			quantity: line.quantity,
			image: line.image,
			priceId: line.priceId,
			currency: line.currency,
			metadata: line.metadata ?? {},
		};
	});

	const handleCheckoutRedirect = async () => {
		setLoading(true);

		try {
			const origin =
				typeof window !== "undefined"
					? window.location.origin
					: (process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000");

			const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/store";

			const res = await fetch(`${origin}${basePath}/api/cart/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ locale, cart }),
			});

			if (!res.ok) {
				throw new Error(`❌ API error: ${res.status} ${await res.text()}`);
			}

			const data = (await res.json()) as CheckoutSessionResponse;

			if (data.error) throw new Error(data.error);
			if (!data.url) throw new Error("❌ Missing Checkout session URL");

			window.location.href = data.url;
		} catch (err) {
			console.error("❌ Checkout redirect error:", err);
			setErrorMessage(err instanceof Error ? err.message : "Unable to start checkout. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="max-w-md pb-12" aria-busy={loading} aria-live="polite">
			<h2 className="text-3xl font-bold leading-none tracking-tight">{title}</h2>
			<p className="mt-2 text-sm text-muted-foreground">{description}</p>

			{note && <p className="mt-1 text-sm text-muted-foreground">Note: {note}</p>}

			{errorMessage && (
				<p role="alert" className="mt-2 text-sm text-red-500">
					{errorMessage}
				</p>
			)}

			<Button
				type="button"
				variant="outline"
				className="mt-4 w-full rounded-full text-lg"
				disabled={loading}
				aria-disabled={loading}
				onClick={handleCheckoutRedirect}
			>
				{loading ? (
					<span className="inline-flex items-center">
						<Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />
						<span className="sr-only">Processing checkout…</span>
						Next (Stripe Checkout)
					</span>
				) : (
					"Next (Stripe Checkout)"
				)}
			</Button>
		</section>
	);
}
