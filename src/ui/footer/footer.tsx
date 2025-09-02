// src/ui/footer/footer.tsx
import type { SVGAttributes } from "react";
import { getTranslations } from "@/i18n/server";
import StoreConfig from "@/store.config";
import { YnsLink } from "@/ui/yns-link";

const sections = [
	{
		header: "Products",
		links: StoreConfig.categories.map(({ name, slug }) => ({
			label: name,
			href: `/category/${slug}`,
		})),
	},
	{
		header: "Company",
		links: [
			{ label: "Crystal The Developer Inc.", href: "https://www.crystalthedeveloper.ca" },
			{ label: "Jobs", href: "https://www.crystalthedeveloper.ca/jobs" },
			{ label: "Website Pricing", href: "https://www.crystalthedeveloper.ca/pricing" },
			{ label: "Contact Us", href: "mailto:contact@crystalthedeveloper.ca" },
		],
	},
	{
		header: "Game Projects",
		links: [
			{ label: "Dev Hunt", href: "https://www.crystalthedeveloper.ca/dev-hunt" },
			{ label: "Clown Hunt", href: "https://www.crystalthedeveloper.ca/clown-hunt" },
		],
	},
	{
		header: "Watch & Learn",
		links: [
			{ label: "Blog", href: "https://www.crystalthedeveloper.ca/blog" },
			{ label: "1 Hour Forward", href: "https://www.crystalthedeveloper.ca/1hourforward" },
		],
	},
];

export async function Footer() {
	const t = await getTranslations("Global.footer");

	return (
		<footer className="w-full bg-neutral-50 p-6 text-neutral-800 md:py-12">
			{/* Main footer links */}
			<div className="container max-w-7xl grid grid-cols-1 gap-12 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-16">
				{sections.map((section) => (
					<section key={section.header} className="text-center md:text-left">
						<h3 className="mb-2 font-semibold">{section.header}</h3>
						<ul role="list" className="grid gap-1">
							{section.links.map((link) => (
								<li key={link.label}>
									<YnsLink
										className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center underline-offset-4 hover:underline md:justify-start"
										href={link.href}
									>
										{link.label}
									</YnsLink>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>

			{/* Bottom bar */}
			<div className="container mt-8 flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-neutral-500 md:flex-row">
				<div className="text-center md:text-left">
					<p>2025 © Crystal The Developer Inc.</p>
					<p>All rights reserved</p>
				</div>
				<div className="flex items-center gap-4">
					<YnsLink
						className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1 transition-colors hover:text-neutral-700"
						href="https://www.instagram.com/crystalthedeveloper"
					>
						<TwitterIcon className="h-4 w-4" /> Instagram @crystalthedeveloper
						<span className="sr-only">Instagram</span>
					</YnsLink>
					<YnsLink
						className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1 transition-colors hover:text-neutral-700"
						href="https://www.facebook.com/Crystalthedeveloper"
					>
						<TwitterIcon className="h-4 w-4" /> Facebook @crystalthedeveloper
						<span className="sr-only">Facebook</span>
					</YnsLink>
				</div>
			</div>
		</footer>
	);
}

function TwitterIcon(props: SVGAttributes<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596 596" fill="none">
			<path
				fill="#fff"
				d="m1 19 230 307L0 577h52l203-219 164 219h177L353 252 568 19h-52L329 221 179 19H1Zm77 38h82l359 481h-81L78 57Z"
			/>
		</svg>
	);
}
