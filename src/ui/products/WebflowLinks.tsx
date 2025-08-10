// src/ui/products/WebflowLinks.tsx
// WebflowLinks.tsx
type Link = { kind: "demo" | "preview" | "website" | "github"; href: string; label: string };

export function WebflowLinks({ links }: { links: Link[] }) {
	if (!links?.length) return null;

	return (
		<section aria-label="More info" className="mt-6 flex flex-wrap gap-3">
			{links.map(({ kind, href, label }) => {
				if (kind === "website") {
					return (
						<a
							key={`${kind}-${href}`}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex h-10 items-center justify-center rounded-full px-6 font-medium text-neutral-900 transition-colors hover:opacity-90 focus:outline-hidden focus:ring-1 focus:ring-yellow-600"
							style={{ backgroundColor: "#ffe600" }}
						>
							{label}
						</a>
					);
				}
				if (kind === "github") {
					return (
						<a
							key={`${kind}-${href}`}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex h-10 items-center justify-center rounded-full border px-6 font-medium transition-colors hover:bg-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-300"
						>
							{label}
						</a>
					);
				}
				return (
					<a
						key={`${kind}-${href}`}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-6 font-medium text-neutral-50 transition-colors hover:bg-neutral-900/90 focus:outline-hidden focus:ring-1 focus:ring-neutral-950"
					>
						{label}
					</a>
				);
			})}
		</section>
	);
}
