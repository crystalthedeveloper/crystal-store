// src/app/(store)/layout.tsx
// src/app/(store)/layout.tsx
import type Stripe from "stripe";
import "@/app/globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CartModalProvider } from "@/context/cart-modal";
import { env } from "@/env.mjs";
import { Footer } from "@/ui/footer/footer";
import { accountToWebsiteJsonLd, JsonLd } from "@/ui/json-ld";
import { Nav } from "@/ui/nav/nav";
import { CartModalPage } from "./cart/cart-modal";

// ✅ Client-only analytics loader
import { VercelAnalyticsScripts } from "./vercel-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SignedLink = { url?: string | null; expired?: boolean } | null | undefined;
type LogoRef = {
	id?: string | null;
	links?: { data?: SignedLink[] | null } | null;
} | null;

type AccountGetShape = {
	account?: Stripe.Account | null;
	logo?: LogoRef;
} | null;

type FileGetPlain = { url?: string | null } | null;
type FileGetWrapped = { data?: { url?: string | null } | null } | null;
type FileGetShape = FileGetPlain | FileGetWrapped;

function extractFileUrl(file: unknown): string | undefined {
	if (!file || typeof file !== "object") return undefined;
	if ("url" in file) {
		const u = (file as { url?: string | null }).url;
		return u ?? undefined;
	}
	if ("data" in file) {
		const data = (file as { data?: { url?: string | null } | null }).data ?? null;
		return data?.url ?? undefined;
	}
	return undefined;
}

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	let accountResult: AccountGetShape = null;
	let logoUrl: string | undefined;

	if (env.STRIPE_SECRET_KEY) {
		try {
			const { accountGet, fileGet } = await import("commerce-kit");
			accountResult = await accountGet();

			const liveLink = accountResult?.logo?.links?.data?.find((l) => l && !l.expired);
			if (liveLink?.url) {
				logoUrl = liveLink.url ?? undefined;
			} else if (accountResult?.logo?.id) {
				const file = (await fileGet(accountResult.logo.id)) as unknown as FileGetShape;
				logoUrl = extractFileUrl(file);
			}
		} catch (e) {
			console.warn("StoreLayout: failed to load account/logo via commerce-kit.", e);
		}
	} else {
		console.warn("StoreLayout: STRIPE_SECRET_KEY missing; rendering without account metadata.");
	}

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

			<JsonLd
				jsonLd={accountToWebsiteJsonLd({
					account: accountResult?.account ?? null,
					logoUrl: logoUrl ?? null,
				})}
			/>

			{/* ✅ Client-only: loads analytics only on real Vercel domains */}
			<VercelAnalyticsScripts />
		</>
	);
}
