// src/ui/products/VariantPickers.tsx
"use client";

import { cn, deslugify } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";

export function VariantPickers({
	isApparel,
	allColors,
	sizesForColor,
	selectedColor,
	selectedSize,
}: {
	isApparel: boolean;
	allColors: string[];
	sizesForColor: string[];
	selectedColor?: string;
	selectedSize?: string;
}) {
	if (!isApparel) return null;

	return (
		<>
			{allColors.length > 0 && (
				<div className="grid gap-2">
					<p className="text-base font-medium" id="color-label">
						Color
					</p>
					<ul role="list" className="grid grid-cols-4 gap-2" aria-labelledby="color-label">
						{allColors.map((c) => {
							const qp = new URLSearchParams();
							qp.set("color", c);
							if (selectedSize) qp.set("size", selectedSize);
							const isSelected = c === selectedColor;
							return (
								<li key={c}>
									<YnsLink
										scroll={false}
										prefetch
										href={`?${qp}`}
										className={cn(
											"flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 transition-colors hover:bg-neutral-100",
											isSelected && "border-black bg-neutral-50 font-medium",
										)}
										aria-selected={isSelected}
									>
										{deslugify(c)}
									</YnsLink>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			{sizesForColor.length > 0 && (
				<div className="grid gap-2">
					<p className="text-base font-medium" id="size-label">
						Size
					</p>
					<ul role="list" className="grid grid-cols-4 gap-2" aria-labelledby="size-label">
						{sizesForColor.map((s) => {
							const qp = new URLSearchParams();
							if (selectedColor) qp.set("color", selectedColor);
							qp.set("size", s);
							const isSelected = s === selectedSize;
							return (
								<li key={s}>
									<YnsLink
										scroll={false}
										prefetch
										href={`?${qp}`}
										className={cn(
											"flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2 transition-colors hover:bg-neutral-100",
											isSelected && "border-black bg-neutral-50 font-medium",
										)}
										aria-selected={isSelected}
									>
										{deslugify(s)}
									</YnsLink>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</>
	);
}
