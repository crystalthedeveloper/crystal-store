// src/ui/checkout/cart-summary-table.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type CartLine, useCartStore } from "@/context/cart-store";
import { useTranslations } from "@/i18n/client";
import { formatMoney, formatProductName } from "@/lib/utils";
import { CartAmountWithSpinner } from "@/ui/checkout/cart-items.client";
import { YnsLink } from "@/ui/yns-link";

export const CartSummaryTable = ({ locale }: { locale: string }) => {
	const t = useTranslations("/cart.page.summaryTable");

	// Zustand state
	const lines = useCartStore((s) => s.lines);
	const updateQuantity = useCartStore((s) => s.updateQuantity);
	const removeItem = useCartStore((s) => s.removeItem);

	// ✅ Add mounted flag
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	const currency = lines[0]?.currency?.toLowerCase() ?? "usd";
	const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

	// ✅ Prevent hydration mismatch
	if (!mounted) {
		return <div className="relative w-full overflow-auto" />; // placeholder matches client structure
	}

	if (!lines.length) {
		return <p className="text-muted-foreground">{t("empty")}</p>;
	}

	return (
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
				{lines.map((line: CartLine) => {
					const lineTotal = line.price * line.quantity;

					return (
						<TableRow key={`${line.id}-${line.priceId}`}>
							{/* Image */}
							<TableCell className="hidden sm:table-cell sm:w-24">
								{line.image ? (
									<Image
										className="aspect-square rounded-md object-cover"
										src={line.image}
										width={96}
										height={96}
										alt={line.name}
										priority={true} // ✅ improve LCP
									/>
								) : (
									<div className="w-24 h-24 rounded-md bg-neutral-100" />
								)}
							</TableCell>

							{/* Name */}
							<TableCell className="font-medium">
								<YnsLink
									className="transition-colors hover:text-muted-foreground"
									href={`/product/${line.id}`}
								>
									{formatProductName(
										line.name,
										[line.metadata?.color, line.metadata?.size, line.variant].filter(Boolean).join(" / "),
									)}
								</YnsLink>
							</TableCell>

							{/* Price */}
							<TableCell>
								{formatMoney({
									amount: line.price,
									currency,
									locale,
								})}
							</TableCell>

							{/* Quantity controls */}
							<TableCell>
								<div className="flex items-center gap-2">
									<button type="button" onClick={() => updateQuantity(line, "DECREASE")}>
										–
									</button>
									{line.quantity}
									<button type="button" onClick={() => updateQuantity(line, "INCREASE")}>
										+
									</button>
									<button
										type="button"
										className="ml-2 text-xs text-red-500"
										onClick={() => removeItem(line)}
									>
										✕
									</button>
								</div>
							</TableCell>

							{/* Line total */}
							<TableCell className="text-right">
								{formatMoney({ amount: lineTotal, currency, locale })}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell className="hidden sm:table-cell" />
					<TableCell colSpan={3} className="text-right">
						{t("subtotal")}
					</TableCell>
					<TableCell className="text-right">
						<CartAmountWithSpinner total={subtotal} currency={currency} locale={locale} />
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="hidden sm:table-cell" />
					<TableCell colSpan={3} className="text-right">
						{t("shipping")}
					</TableCell>
					<TableCell className="text-right text-muted-foreground">{t("calculatedAtCheckout")}</TableCell>
				</TableRow>
				<TableRow>
					<TableCell className="hidden sm:table-cell" />
					<TableCell colSpan={3} className="text-right">
						{t("taxes")}
					</TableCell>
					<TableCell className="text-right text-muted-foreground">{t("calculatedAtCheckout")}</TableCell>
				</TableRow>
				<TableRow className="text-lg font-bold">
					<TableCell className="hidden sm:table-cell" />
					<TableCell colSpan={3} className="text-right">
						{t("totalSummary")}
					</TableCell>
					<TableCell className="text-right">
						<CartAmountWithSpinner total={subtotal} currency={currency} locale={locale} />
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
};
