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
	priceId: string;
	name: string;
	image?: string;
	price: number;
	currency: string;
	variant?: string;
	color?: string;
	size?: string;

	/** ✅ single toggle from page.tsx */
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
	disabled = false,
	className,
}: AddToCartProps) => {
	const t = useTranslations("Global.addToCart");
	const [pending, startTransition] = useTransition();
	const { setOpen } = useCartModal();
	const { addItem } = useCartStore();

	// ✅ unified disable logic
	const isDisabled = Boolean(disabled || pending || !priceId);

	return (
		<Button
			id="button-add-to-cart"
			size="lg"
			type="button"
			disabled={isDisabled}
			aria-disabled={isDisabled}
			className={cn(
				"rounded-full text-lg relative",
				isDisabled && "opacity-50 cursor-not-allowed",
				className,
			)}
			onClick={async () => {
				if (isDisabled) return;

				setOpen(true);

				startTransition(async () => {
					try {
						const res = await fetch(`${API_BASE}/api/cart/add`, {
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
							throw new Error(`[AddToCartButton] API error: ${res.status} ${await res.text()}`);
						}

						await res.json();

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
				{isDisabled ? t("disabled") : t("actionButton")}
			</span>
			{pending && (
				<span className="absolute z-10">
					<Loader2Icon className="h-4 w-4 animate-spin" />
				</span>
			)}
		</Button>
	);
};
