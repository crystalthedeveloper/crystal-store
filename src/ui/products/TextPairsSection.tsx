// src/ui/products/TextPairsSection.tsx
export function TextPairsSection({
	heading,
	items,
	raw,
	defaultOpen = false,
}: {
	heading: string;
	items?: Array<{ title: string; text: string }>;
	raw?: string;
	/** start opened? */
	defaultOpen?: boolean;
}) {
	const pairs = items?.length ? items : parsePairs(raw);

	return (
		<details className="rounded-lg border bg-card open:shadow-sm" open={defaultOpen}>
			<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
				<h3 className="text-lg font-semibold">{heading}</h3>
				{/* chevron */}
				<svg
					className="h-5 w-5 transition-transform duration-200 group-open:rotate-180"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
						clipRule="evenodd"
					/>
				</svg>
			</summary>

			<div className="px-4 pb-4">
				{pairs && pairs.length > 0 ? (
					<div className="space-y-4 text-sm text-secondary-foreground">
						{pairs.map(({ title, text }, idx) => (
							<div key={idx}>
								{title && <strong className="block font-medium">{title}</strong>}
								{text && <p className="whitespace-pre-line">{text}</p>}
							</div>
						))}
					</div>
				) : raw ? (
					<p className="whitespace-pre-line text-sm text-secondary-foreground">{raw}</p>
				) : null}
			</div>
		</details>
	);
}

/** "Title - Text - Title - Text ..." → pairs */
function parsePairs(raw?: string): Array<{ title: string; text: string }> {
	if (!raw) return [];
	const parts = raw
		.split(" - ")
		.map((s) => s.trim())
		.filter(Boolean);

	const out: Array<{ title: string; text: string }> = [];
	for (let i = 0; i < parts.length; i += 2) {
		out.push({ title: parts[i] ?? "", text: parts[i + 1] ?? "" });
	}
	return out;
}
