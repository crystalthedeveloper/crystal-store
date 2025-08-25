// src/ui/add-to-cart-button.tsx
"use client";

import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

export const AddToCartButton = ({
	productId,
	disabled,
	className,
}: {
	productId: string;
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
			onClick={async (e) => {
				e.preventDefault();
				if (isDisabled) return;

				setOpen(true);

				startTransition(async () => {
					try {
						// ✅ POST to API instead of product page
						const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/chat`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								messages: [
									{
										role: "user",
										content: `add product ${productId} to cart`,
									},
								],
							}),
						});

						if (!res.ok) {
							console.error("Add to cart failed:", await res.text());
						}
					} catch (err) {
						console.error("Cart request error:", err);
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
