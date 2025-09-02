// src/ui/add-to-cart-button.tsx
"use client";

import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/store"
const API_BASE =
	process.env.NODE_ENV === "development"
		? "" // → http://localhost:3000
		: process.env.NEXT_PUBLIC_URL || "https://crystals-store.vercel.app";

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
	const { setOpen } = useCartModal();

	// 🚫 Force disable globally
	const cartDisabled = true; // toggle this to false later
	const isDisabled = disabled || pending || cartDisabled;

	return (
		<Button
			id="button-add-to-cart"
			size="lg"
			type="button"
			className={cn(
				"rounded-full text-lg relative",
				className,
				isDisabled && "opacity-50 cursor-not-allowed",
			)}
			disabled={isDisabled} // native HTML disable
			onClick={async () => {
				if (isDisabled) return; // extra guard
				setOpen(true);

				startTransition(async () => {
					/* ...existing fetch logic... */
				});
			}}
			aria-disabled={isDisabled}
		>
			<span className={cn("transition-opacity ease-in", pending ? "opacity-0" : "opacity-100")}>
				{t("disabled")} {/* You can customize this text */}
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
