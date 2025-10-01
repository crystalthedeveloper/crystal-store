// src/ui/nav/cart-summary-nav.tsx
"use client";

import { ShoppingBagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCartStore } from "@/context/cart-store";
import { formatMoney } from "@/lib/utils";
import { CartLink } from "./cart-link";

const CartFallback = () => (
	<div className="h-6 w-6 opacity-30">
		<ShoppingBagIcon />
	</div>
);

export const CartSummaryNav = () => {
	const cart = useCartStore((s) => s.lines);

	// ✅ Add mounted flag to prevent hydration mismatch
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	// Before mounted, always render fallback to match server HTML
	if (!mounted) {
		return <CartFallback />;
	}

	if (!cart.length) {
		return <CartFallback />;
	}

	const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
	const totalItems = cart.reduce((sum, line) => sum + line.quantity, 0);
	const currency = cart[0]?.currency ?? "usd";

	return (
		<TooltipProvider>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>
					<div>
						<CartLink>
							<ShoppingBagIcon />
							<span className="absolute bottom-0 right-0 inline-flex h-5 w-5 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 bg-white text-center text-xs">
								<span className="sr-only">Items in cart: </span>
								{totalItems}
							</span>
							<span className="sr-only">
								Total:{" "}
								{formatMoney({
									amount: total,
									currency,
									locale: "en",
								})}
							</span>
						</CartLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="left" sideOffset={25}>
					<p>{totalItems} items</p>
					<p>
						Total:{" "}
						{formatMoney({
							amount: total,
							currency,
							locale: "en",
						})}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
