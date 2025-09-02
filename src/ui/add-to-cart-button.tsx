// src/ui/add-to-cart-button.tsx
"use client";

import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/store"

// ✅ API_BASE respects basePath (Webflow Cloud or local)
const API_BASE =
	process.env.NODE_ENV === "development"
		? BASE_PATH // → http://localhost:3000/store/api/...
		: process.env.NEXT_PUBLIC_URL + BASE_PATH; // → https://www.crystalthedeveloper.ca/store/api/...

export const AddToCartButton = ({
	productId,
	priceId,
	disabled,
	className,
}: {
	productId: string;
	priceId?: string;
	disabled?: boolean;
	className?: string;
}) => {
	const t = useTranslations("Global.addToCart");
	const [pending, startTransition] = useTransition();
	const isDisabled = disabled || pending;
	const { setOpen } = useCartModal();

	return (
		<Button
			id="button-add-to-cart"
			size="lg"
			type="button"
			className={cn("rounded-full text-lg relative", className)}
			onClick={async () => {
				if (isDisabled) return;
				setOpen(true);

				startTransition(async () => {
					try {
						const url = `${API_BASE}/api/cart/add`;

						console.log("[AddToCartButton] Calling", url, {
							productId,
							priceId,
						});

						const res = await fetch(url, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ productId, priceId }),
						});

						if (!res.ok) {
							const text = await res.text();
							throw new Error(`[AddToCartButton] API error: ${res.status} ${text}`);
						}

						const data = await res.json();
						console.log("[AddToCartButton] ✅ addToCart result:", data);
					} catch (err) {
						console.error("[AddToCartButton] ❌ Failed to add to cart:", err);
					}
				});
			}}
			aria-disabled={isDisabled}
		>
			<span className={cn("transition-opacity ease-in", pending ? "opacity-0" : "opacity-100")}>
				{disabled ? t("disabled") : t("actionButton")}
			</span>
			<span
				className={cn(
					"ease-out transition-opacity pointer-events-none absolute z-10",
					pending ? "opacity-100" : "opacity-0",
				)}
			>
				<Loader2Icon className="h-4 w-4 animate-spin" />
			</span>
		</Button>
	);
};
