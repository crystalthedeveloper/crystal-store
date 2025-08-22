import Link from "next/link";
import StoreConfig from "@/store.config";
import { NavMobileMenu } from "@/ui/nav/nav-mobile-menu.client";

type LinkItem = { label: string; href: string; newTab?: boolean };

const links: LinkItem[] = [
	...StoreConfig.categories.map(({ name, slug }) => ({
		label: name,
		href: `/category/${slug}`,
	})),
	{
		label: "Crystal The Developer Inc.",
		href: "https://www.crystalthedeveloper.ca",
		newTab: true,
	},
];

export const NavMenu = () => {
	return (
		<>
			<div className="sm:block hidden">
				<ul className="flex flex-row items-center justify-center gap-x-1">
					{links.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="group inline-flex min-h-[44px] min-w-[44px] w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden"
								target={link.newTab ? "_blank" : undefined}
								rel={link.newTab ? "noopener noreferrer" : undefined}
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
			<div className="sm:hidden flex items-center">
				<NavMobileMenu>
					<ul className="flex pb-8 flex-col items-stretch justify-center gap-x-1">
						{links.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="group inline-flex min-h-[44px] min-w-[44px] w-full items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden"
									target={link.newTab ? "_blank" : undefined}
									rel={link.newTab ? "noopener noreferrer" : undefined}
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</NavMobileMenu>
			</div>
		</>
	);
};
