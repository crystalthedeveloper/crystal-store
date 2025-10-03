// src/app/(store)/layout.tsx
import type Stripe from "stripe";
import "@/app/globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CartModalProvider } from "@/context/cart-modal";
import { env } from "@/env.mjs";
import { getStripeClient } from "@/lib/stripe/client";
import { Footer } from "@/ui/footer/footer";
import { accountToWebsiteJsonLd, JsonLd } from "@/ui/json-ld";
import { Nav } from "@/ui/nav/nav";
import { CartModalPage } from "./cart/cart-modal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAccountAndLogo(): Promise<{ account: Stripe.Account | null; logoUrl?: string }> {
	if (!env.STRIPE_SECRET_KEY) {
		return { account: null, logoUrl: undefined };
	}

	try {
		const stripe = getStripeClient();
		const response = await stripe.accounts.retrieve();
		const account = response as unknown as Stripe.Account;

		const rawLogo = account.settings?.branding?.logo ?? null;
		const logoId = typeof rawLogo === "string" ? rawLogo : null;
		if (!logoId) {
			return { account, logoUrl: undefined };
		}

		try {
			const link = await stripe.fileLinks.create({ file: logoId });
			return { account, logoUrl: link.url ?? undefined };
		} catch (error) {
			const isResourceMissing =
				error &&
				typeof error === "object" &&
				"code" in error &&
				(error as { code?: string }).code === "resource_missing";
			if (isResourceMissing) {
				console.warn("StoreLayout: branding logo missing in this Stripe mode (skipping)", error);
				return { account, logoUrl: undefined };
			}
			throw error;
		}
	} catch (error) {
		console.warn("StoreLayout: failed to load account/logo from Stripe.", error);
		return { account: null, logoUrl: undefined };
	}
}

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const { account, logoUrl } = await getAccountAndLogo();

	return (
		<>
			<CartModalProvider>
				<Nav />
				<TooltipProvider>
					<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 pt-2 sm:px-6 lg:px-8">
						{children}
						<CartModalPage />
					</main>
					<Footer />
				</TooltipProvider>
			</CartModalProvider>

			<JsonLd jsonLd={accountToWebsiteJsonLd({ account, logoUrl: logoUrl ?? null })} />
		</>
	);
}
