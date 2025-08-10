// src/ui/products/PriceLabel.tsx
import { formatMoney } from "@/lib/utils";

export function PriceLabel({
	amount,
	currency,
	locale,
}: {
	amount: number | null | undefined;
	currency: string | undefined;
	locale: string;
}) {
	if (amount == null || !currency) return null;
	return (
		<p className="mt-2 text-2xl font-medium leading-none tracking-tight text-foreground/70">
			{formatMoney({ amount, currency, locale })}
		</p>
	);
}
