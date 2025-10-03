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

	// ✅ Prevent hydration mismatch
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const currency = lines[0]?.currency?.toLowerCase() ?? "usd";
	const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

	if (!mounted) {
		return <div className="relative w-full overflow-auto" />;
	}

	if (!lines.length) {
		return <p className="text-muted-foreground">{t("empty")}</p>;
	}

	return (
		<div className="w-full">
			{/* 🖥 Desktop Table */}
			<div className="hidden sm:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-24">
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
							const variantParts = [
								line.metadata?.color,
								line.metadata?.size,
								...(line.metadata?.color || line.metadata?.size ? [] : [line.variant]),
							];

							return (
								<TableRow key={`${line.id}-${line.priceId}`}>
									<TableCell className="w-24">
										{line.image ? (
											<Image
												className="aspect-square rounded-md object-cover"
												src={line.image}
												width={96}
												height={96}
												alt={line.name}
												priority
											/>
										) : (
											<div className="w-24 h-24 rounded-md bg-neutral-100" />
										)}
									</TableCell>
									<TableCell className="font-medium">
										<YnsLink
											className="transition-colors hover:text-muted-foreground"
											href={`/product/${line.id}`}
										>
											{formatProductName(line.name, variantParts)}
										</YnsLink>
									</TableCell>
									<TableCell>{formatMoney({ amount: line.price, currency, locale })}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<button onClick={() => updateQuantity(line, "DECREASE")}>–</button>
											{line.quantity}
											<button onClick={() => updateQuantity(line, "INCREASE")}>+</button>
											<button className="ml-2 text-xs text-red-500" onClick={() => removeItem(line)}>
												✕
											</button>
										</div>
									</TableCell>
									<TableCell className="text-right">
										{formatMoney({ amount: lineTotal, currency, locale })}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>

					<TableFooter>
						<TableRow>
							<TableCell />
							<TableCell colSpan={3} className="text-right">
								{t("subtotal")}
							</TableCell>
							<TableCell className="text-right">
								<CartAmountWithSpinner total={subtotal} currency={currency} locale={locale} />
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell />
							<TableCell colSpan={3} className="text-right">
								{t("shipping")}
							</TableCell>
							<TableCell className="text-right text-muted-foreground">{t("calculatedAtCheckout")}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell />
							<TableCell colSpan={3} className="text-right">
								{t("taxes")}
							</TableCell>
							<TableCell className="text-right text-muted-foreground">{t("calculatedAtCheckout")}</TableCell>
						</TableRow>
						<TableRow className="text-lg font-bold">
							<TableCell />
							<TableCell colSpan={3} className="text-right">
								{t("totalSummary")}
							</TableCell>
							<TableCell className="text-right">
								<CartAmountWithSpinner total={subtotal} currency={currency} locale={locale} />
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</div>

			{/* 📱 Mobile Cards */}
			<div className="space-y-4 sm:hidden">
				{lines.map((line: CartLine) => {
					const lineTotal = line.price * line.quantity;
					const variantParts = [
						line.metadata?.color,
						line.metadata?.size,
						...(line.metadata?.color || line.metadata?.size ? [] : [line.variant]),
					];
					return (
						<div key={`${line.id}-${line.priceId}`} className="flex gap-3 rounded-lg border p-3 shadow-sm">
							{line.image ? (
								<Image
									className="h-20 w-20 rounded-md object-cover"
									src={line.image}
									width={80}
									height={80}
									alt={line.name}
								/>
							) : (
								<div className="h-20 w-20 rounded-md bg-neutral-100" />
							)}
							<div className="flex flex-1 flex-col justify-between">
								<YnsLink className="font-medium hover:text-muted-foreground" href={`/product/${line.id}`}>
									{formatProductName(line.name, variantParts)}
								</YnsLink>
								<div className="text-sm text-muted-foreground">
									{formatMoney({ amount: line.price, currency, locale })} × {line.quantity}
								</div>
								<div className="mt-1 flex items-center gap-2 text-sm">
									<button className="rounded border px-2" onClick={() => updateQuantity(line, "DECREASE")}>
										–
									</button>
									{line.quantity}
									<button className="rounded border px-2" onClick={() => updateQuantity(line, "INCREASE")}>
										+
									</button>
									<button className="ml-auto text-xs text-red-500" onClick={() => removeItem(line)}>
										✕
									</button>
								</div>
								<div className="mt-2 font-semibold">
									{formatMoney({ amount: lineTotal, currency, locale })}
								</div>
							</div>
						</div>
					);
				})}
				<div className="mt-4 rounded-lg border p-3 text-sm">
					<div className="flex justify-between">
						<span>{t("subtotal")}</span>
						<CartAmountWithSpinner total={subtotal} currency={currency} locale={locale} />
					</div>
					<div className="flex justify-between text-muted-foreground">
						<span>{t("shipping")}</span>
						<span>{t("calculatedAtCheckout")}</span>
					</div>
					<div className="flex justify-between text-muted-foreground">
						<span>{t("taxes")}</span>
						<span>{t("calculatedAtCheckout")}</span>
					</div>
					<div className="mt-2 flex justify-between font-bold">
						<span>{t("totalSummary")}</span>
						<CartAmountWithSpinner total={subtotal} currency={currency} locale={locale} />
					</div>
				</div>
			</div>
		</div>
	);
};
