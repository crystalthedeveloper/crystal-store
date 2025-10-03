// src/app/(store)/cart/cart-modal.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { type CartLine, useCartStore } from "@/context/cart-store";
import { useTranslations } from "@/i18n/client";
import { collectVariantDisplayParts, formatMoney, formatProductName } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";
import { CartAsideContainer } from "./cart-aside";

function calcTotalNetWithoutShipping(lines: CartLine[]): number {
	return lines.reduce((sum, line) => {
		const unit = line.price ?? 0;
		return sum + unit * line.quantity;
	}, 0);
}

export function CartModalPage() {
	const t = useTranslations("/cart.modal");
	const { lines } = useCartStore();

	const total = calcTotalNetWithoutShipping(lines);
	const currency = lines[0]?.currency ?? "cad";
	const locale = "en";

	return (
		<CartAsideContainer aria-describedby="cart-description">
			{/* Hidden description for screen readers */}
			<p id="cart-description" className="sr-only">
				{t("description")}
			</p>

			<div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-neutral-700">{t("title")}</h2>
					<YnsLink replace href="/cart" className="text-sm text-muted-foreground underline">
						{t("openFullView")}
					</YnsLink>
				</div>

				<div className="mt-8">
					{lines.length === 0 ? (
						<p className="text-sm text-neutral-500">Your cart is empty.</p>
					) : (
						<ul role="list" className="-my-6 divide-y divide-neutral-200">
							{lines.map((line) => {
								const variantParts = collectVariantDisplayParts({
									additional: [line.metadata?.color, line.metadata?.size],
									variant: [line.variant, line.metadata?.variant],
									metadata: line.metadata,
								});

								return (
									<li
										key={`${line.id}-${line.priceId}`}
										className="grid grid-cols-[4rem_1fr_max-content] grid-rows-[auto_auto] gap-x-4 gap-y-2 py-6"
									>
										{line.image ? (
											<div className="col-span-1 row-span-2 bg-neutral-100">
												<Image
													className="aspect-square rounded-md object-cover"
													src={line.image}
													width={80}
													height={80}
													alt={line.name ?? ""}
												/>
											</div>
										) : (
											<div className="col-span-1 row-span-2" />
										)}

										<h3 className="-mt-1 font-semibold leading-tight">
											{formatProductName(line.name ?? "Unknown", variantParts)}
										</h3>

										<p className="text-sm font-medium leading-none">
											{formatMoney({ amount: line.price ?? 0, currency, locale })}
										</p>
										<p className="self-end text-sm font-medium text-muted-foreground">
											{t("quantity", { quantity: line.quantity })}
										</p>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>

			{lines.length > 0 && (
				<div className="border-t border-neutral-200 px-4 py-6 sm:px-6">
					<div
						id="cart-overlay-description"
						className="flex justify-between text-base font-medium text-neutral-900"
					>
						<p>{t("total")}</p>
						<p>{formatMoney({ amount: total, currency, locale })}</p>
					</div>
					<p className="mt-0.5 text-sm text-neutral-500">{t("shippingAndTaxesInfo")}</p>
					<Button asChild size="lg" className="mt-6 w-full rounded-full text-lg">
						<YnsLink href="/cart">{t("goToPaymentButton")}</YnsLink>
					</Button>
				</div>
			)}
		</CartAsideContainer>
	);
}
