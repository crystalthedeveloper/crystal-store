// src/ui/checkout/cart-items.client.tsx
"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

// ✅ Local-only cart quantity controls
export const CartItemQuantity = ({
	quantity,
	priceId,
	onChange,
}: {
	quantity: number;
	priceId: string;
	onChange: (args: { priceId: string; action: "INCREASE" | "DECREASE" }) => void;
}) => {
	return (
		<span className="flex flex-row items-center text-foreground">
			<Button
				variant="ghost"
				size="sm"
				type="button"
				disabled={quantity <= 0}
				className="group aspect-square p-0"
				onClick={() => onChange({ priceId, action: "DECREASE" })}
			>
				<span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 pb-0.5 font-bold leading-none text-black transition-colors group-hover:bg-neutral-500 group-hover:text-white">
					–
				</span>
			</Button>
			<span className="inline-block min-w-8 px-1 text-center tabular-nums">{quantity}</span>
			<Button
				variant="ghost"
				size="sm"
				type="button"
				className="group aspect-square p-0"
				onClick={() => onChange({ priceId, action: "INCREASE" })}
			>
				<span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 pb-0.5 font-bold leading-none text-black transition-colors group-hover:bg-neutral-500 group-hover:text-white">
					+
				</span>
			</Button>
		</span>
	);
};

// ✅ Line total = unit × qty
export const CartItemLineTotal = ({
	unitAmount,
	quantity,
	currency,
	locale,
}: {
	unitAmount: number;
	quantity: number;
	currency: string;
	locale: string;
}) => {
	return (
		<span className="whitespace-nowrap tabular-nums text-foreground">
			{formatMoney({
				amount: unitAmount * quantity,
				currency,
				locale,
			})}
		</span>
	);
};

// ✅ Subtotal with spinner (optional pending state)
export const CartAmountWithSpinner = ({
	total,
	currency,
	locale,
	pending = false,
}: {
	total: number;
	currency: string;
	locale: string;
	pending?: boolean;
}) => {
	return (
		<span
			className={clsx(
				"relative tabular-nums",
				pending ? "cursor-wait text-foreground/50" : "text-foreground",
			)}
		>
			{pending && (
				<Loader2 className="absolute -left-[.85rem] top-[.1rem] inline-block size-3 animate-spin text-foreground" />
			)}
			{formatMoney({
				amount: total,
				currency,
				locale,
			})}
		</span>
	);
};
