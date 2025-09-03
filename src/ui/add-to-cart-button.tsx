// src/ui/add-to-cart-button.tsx
"use client";

import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";
import { useCartStore } from "@/context/cart-store";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_BASE =
	process.env.NODE_ENV === "development" ? BASE_PATH : (process.env.NEXT_PUBLIC_URL ?? "") + BASE_PATH;

type AddToCartProps = {
	productId: string;
	priceId: string; // ✅ Stripe price id (unique per variant)
	name: string;
	image?: string;
	price: number;
	currency: string;
	variant?: string; // hoodie variant string
	color?: string;
	size?: string;
	disabled?: boolean;
	className?: string;
};

export const AddToCartButton = ({
	productId,
	priceId,
	name,
	image,
	price,
	currency,
	variant,
	color,
	size,
	disabled,
	className,
}: AddToCartProps) => {
	const t = useTranslations("Global.addToCart");
	const [pending, startTransition] = useTransition();
	const isDisabled = disabled || pending || !priceId; // ✅ prevent undefined priceId
	const { setOpen } = useCartModal();
	const { addItem } = useCartStore();

	return (
		<Button
			id="button-add-to-cart"
			size="lg"
			type="button"
			disabled={isDisabled} // ✅ properly disables button
			aria-disabled={isDisabled} // still good for accessibility
			className={cn(
				"rounded-full text-lg relative",
				isDisabled && "opacity-50 cursor-not-allowed", // ✅ visual feedback
				className,
			)}
			onClick={async () => {
				if (isDisabled) return;
				// ✅ Open cart modal immediately
				setOpen(true);

				startTransition(async () => {
					try {
						const url = `${API_BASE}/api/cart/add`;
						console.log("[AddToCartButton] Calling", url, {
							productId,
							priceId,
							variant,
							color,
							size,
						});

						// ✅ Send priceId + metadata to API
						const res = await fetch(url, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								productId,
								priceId,
								quantity: 1,
								variant,
								color,
								size,
							}),
						});

						if (!res.ok) {
							const text = await res.text();
							throw new Error(`[AddToCartButton] API error: ${res.status} ${text}`);
						}

						await res.json();
						console.log("[AddToCartButton] ✅ addToCart API success");

						// ✅ Update local cart store with full variant info
						addItem({
							id: productId,
							priceId,
							name,
							image,
							price,
							currency,
							quantity: 1,
							variant,
							metadata: { color, size },
						});
					} catch (err) {
						console.error("[AddToCartButton] ❌ Failed to add to cart:", err);
					}
				});
			}}
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
