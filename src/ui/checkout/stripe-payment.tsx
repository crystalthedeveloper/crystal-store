// src/ui/checkout/stripe-payment.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { type CartLine, useCartStore } from "@/context/cart-store"; // ✅ import CartLine + store
import { useTranslations } from "@/i18n/client";
import { createCheckoutSessionAction } from "@/ui/checkout/checkout-actions";

// ✅ Stripe Checkout Session trigger
export const StripePayment = ({
	allProductsDigital,
	locale,
}: {
	allProductsDigital: boolean;
	locale: string;
}) => {
	const t = useTranslations("/cart.page.stripePayment");

	// ✅ use Zustand instead of local state
	const cart = useCartStore((s) => s.lines);

	const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isTransitioning, startTransition] = useTransition();

	const handleCheckout = async () => {
		if (!cart || cart.length === 0) {
			setFormErrorMessage(t("emptyCartError"));
			return;
		}

		setIsLoading(true);
		startTransition(async () => {
			try {
				// ✅ Build Stripe line_items
				const items = cart.map((l: CartLine) => ({
					price: l.priceId ?? l.id, // make sure to use Stripe priceId if available
					quantity: l.quantity,
				}));

				const { url } = await createCheckoutSessionAction(items);

				if (url) {
					window.location.href = url; // Stripe handles redirect
				} else {
					throw new Error("No checkout URL returned from server");
				}
			} catch (err) {
				setFormErrorMessage(err instanceof Error ? err.message : t("unexpectedError"));
				setIsLoading(false);
			}
		});
	};

	return (
		<div className="grid gap-4">
			{formErrorMessage && (
				<Alert variant="destructive" className="mt-2" aria-live="polite">
					<AlertTitle>{t("errorTitle")}</AlertTitle>
					<AlertDescription>{formErrorMessage}</AlertDescription>
				</Alert>
			)}

			<Button
				type="button"
				onClick={handleCheckout}
				className="w-full rounded-full text-lg"
				size="lg"
				aria-disabled={isLoading || isTransitioning}
			>
				{isLoading || isTransitioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("payNowButton")}
			</Button>
		</div>
	);
};
