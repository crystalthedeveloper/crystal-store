// src/ui/checkout/cart-summary-table.tsx
"use client";

import type * as Commerce from "commerce-kit";
import Image from "next/image";
import { useOptimistic } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/i18n/client";
import { calculateCartTotalPossiblyWithTax, formatMoney, formatProductName } from "@/lib/utils";
import { CartAmountWithSpinner, CartItemLineTotal, CartItemQuantity } from "@/ui/checkout/cart-items.client";
import { FormatDeliveryEstimate } from "@/ui/checkout/shipping-rates-section";
import { YnsLink } from "@/ui/yns-link";

// 👇 Local type ensures line-level metadata is usable
type CartLineWithPrice = Commerce.Cart["lines"][number] & {
	price?: {
		id: string;
		unit_amount: number | null;
		currency: string;
		metadata?: Record<string, string>;
	};
	metadata?: Record<string, string>;
};

// helper to normalize strings
function norm(v?: string) {
	return (v ?? "").toLowerCase().trim();
}

// 🔑 Unique row key: product + priceId + variant metadata
function getLineKey(line: CartLineWithPrice) {
	const priceId = line.price?.id ?? line.product.default_price?.id ?? "noprice";
	const color = norm(line.price?.metadata?.color) || "nocolor";
	const size = norm(line.price?.metadata?.size) || "nosize";
	const variant = norm(line.product.metadata?.variant as string | undefined) || "novariant";

	return `${line.product.id}-${priceId}-${color}-${size}-${variant}`;
}

export const CartSummaryTable = ({ cart, locale }: { cart: Commerce.Cart; locale: string }) => {
	const t = useTranslations("/cart.page.summaryTable");

	const [optimisticCart, dispatchOptimisticCartAction] = useOptimistic(
		cart,
		(
			prevCart: Commerce.Cart,
			action: {
				productId: string;
				priceId?: string;
				color?: string;
				size?: string;
				variant?: string;
				action: "INCREASE" | "DECREASE";
			},
		): Commerce.Cart => {
			const modifier = action.action === "INCREASE" ? 1 : -1;

			return {
				...prevCart,
				lines: prevCart.lines.map((line) => {
					const l = line as CartLineWithPrice;
					const linePriceId = l.price?.id ?? l.product.default_price?.id;
					const lineColor = norm(l.price?.metadata?.color);
					const lineSize = norm(l.price?.metadata?.size);
					const lineVariant = norm(l.product.metadata?.variant as string | undefined);

					if (
						l.product.id === action.productId &&
						linePriceId === action.priceId &&
						lineColor === norm(action.color) &&
						lineSize === norm(action.size) &&
						lineVariant === norm(action.variant)
					) {
						return {
							...l,
							quantity: Math.max(0, l.quantity + modifier),
						};
					}
					return l;
				}),
			};
		},
	);

	const firstLine = optimisticCart.lines[0] as CartLineWithPrice | undefined;
	const currency = firstLine?.price?.currency ?? firstLine?.product.default_price?.currency ?? "usd";
	const total = calculateCartTotalPossiblyWithTax(optimisticCart);

	return (
		<form>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="hidden w-24 sm:table-cell">
							<span className="sr-only">{t("imageCol")}</span>
						</TableHead>
						<TableHead>{t("productCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32">{t("priceCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32">{t("quantityCol")}</TableHead>
						<TableHead className="w-1/6 min-w-32 text-right">{t("totalCol")}</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{optimisticCart.lines.map((line) => {
						const l = line as CartLineWithPrice;
						const price = l.price ?? l.product.default_price;
						if (!price) return null;

						const priceId = price.id;
						const unitAmount = price.unit_amount ?? 0;
						const lineCurrency = price.currency ?? "usd";

						// ✅ Always resolve variant parts from price metadata
						const color = norm(price.metadata?.color);
						const size = norm(price.metadata?.size);
						const variant = norm(l.product.metadata?.variant as string | undefined);

						const rowKey = getLineKey(l);
						const variantParts = [color, size, variant].filter(Boolean);

						return (
							<TableRow key={rowKey}>
								<TableCell className="hidden sm:table-cell sm:w-24">
									{price.metadata?.image_url ? (
										<Image
											className="aspect-square rounded-md object-cover"
											src={price.metadata.image_url}
											width={96}
											height={96}
											alt={l.product.name ?? ""}
										/>
									) : l.product.images?.[0] ? (
										<Image
											className="aspect-square rounded-md object-cover"
											src={l.product.images[0]}
											width={96}
											height={96}
											alt={l.product.name ?? ""}
										/>
									) : (
										<div className="w-24 h-24 rounded-md bg-neutral-100" />
									)}
								</TableCell>

								<TableCell className="font-medium">
									<YnsLink
										className="transition-colors hover:text-muted-foreground"
										href={`/product/${l.product.metadata.slug}`}
									>
										{formatProductName(l.product.name, variantParts.join(" / "))}
									</YnsLink>
								</TableCell>

								<TableCell>
									{formatMoney({
										amount: unitAmount,
										currency: lineCurrency,
										locale,
									})}
								</TableCell>

								<TableCell>
									<CartItemQuantity
										cartId={cart.cart.id}
										quantity={l.quantity}
										productId={l.product.id}
										onChange={(args) =>
											dispatchOptimisticCartAction({
												productId: l.product.id,
												priceId,
												color,
												size,
												variant,
												action: args.action,
											})
										}
									/>
								</TableCell>

								<TableCell className="text-right">
									<CartItemLineTotal
										currency={lineCurrency}
										quantity={l.quantity}
										unitAmount={unitAmount}
										productId={l.product.id}
										locale={locale}
									/>
								</TableCell>
							</TableRow>
						);
					})}

					{cart.shippingRate && (
						<TableRow>
							<TableCell className="hidden sm:table-cell sm:w-24"></TableCell>
							<TableCell className="font-medium" colSpan={3}>
								{cart.shippingRate.display_name}{" "}
								<span className="text-muted-foreground">
									<FormatDeliveryEstimate estimate={cart.shippingRate.delivery_estimate} />
								</span>
							</TableCell>
							<TableCell className="text-right">
								{cart.shippingRate.fixed_amount &&
									formatMoney({
										amount: cart.shippingRate.fixed_amount.amount,
										currency: cart.shippingRate.fixed_amount.currency,
										locale,
									})}
							</TableCell>
						</TableRow>
					)}
				</TableBody>

				<TableFooter>
					{optimisticCart.cart.taxBreakdown.map((tax, idx) => (
						<TableRow key={`tax-${idx}`}>
							<TableCell className="hidden sm:table-cell"></TableCell>
							<TableCell colSpan={3} className="text-right">
								{tax.taxType.toString().toUpperCase()} {tax.taxPercentage}%
							</TableCell>
							<TableCell className="text-right">
								<CartAmountWithSpinner total={tax.taxAmount} currency={currency} locale={locale} />
							</TableCell>
						</TableRow>
					))}

					<TableRow className="text-lg font-bold">
						<TableCell className="hidden sm:table-cell"></TableCell>
						<TableCell colSpan={3} className="text-right">
							{t("totalSummary")}
						</TableCell>
						<TableCell className="text-right">
							<CartAmountWithSpinner total={total} currency={currency} locale={locale} />
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</form>
	);
};
