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
}: {
	locale: string;
	title: string;
	description: string;
}) {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// ✅ Zustand cart lines
	const lines = useCartStore((s) => s.lines);

	// ✅ Format cart items
	const cart = lines.map((line) => {
		const variantParts = [line.metadata?.color, line.metadata?.size, line.variant].filter(Boolean);
		const displayName = formatProductName(line.name ?? "Unknown", variantParts.join(" / "));

		return {
			name: displayName,
			price: line.price,
			quantity: line.quantity,
			image: line.image,
		};
	});

	const handleCheckoutRedirect = async () => {
		setLoading(true);

		try {
			// ✅ Use relative path (avoids double /store/store issue)
			const res = await fetch("/api/cart/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ locale, cart }),
			});

			const data = (await res.json()) as CheckoutSessionResponse;

			if (data.error) throw new Error(data.error);
			if (!data.url) throw new Error("❌ Missing Checkout session URL");

			// ✅ Redirect to Stripe Checkout
			window.location.href = data.url;
		} catch (err) {
			console.error("❌ Checkout redirect error:", err);
			setErrorMessage(err instanceof Error ? err.message : "Unable to start checkout. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="max-w-md pb-12">
			<h2 className="text-3xl font-bold leading-none tracking-tight">{title}</h2>
			<p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>

			{errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

			<Button
				type="button"
				variant="outline"
				className="w-full rounded-full text-lg"
				disabled={loading}
				onClick={handleCheckoutRedirect}
			>
				{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Next (Stripe Checkout)"}
			</Button>
		</section>
	);
}
