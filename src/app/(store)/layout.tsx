// src/app/(store)/layout.tsx
import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartModalProvider } from "@/context/cart-modal";
import { env } from "@/env.mjs";
// import { CommerceGPT } from "@/ui/commerce-gpt";
import { Footer } from "@/ui/footer/footer";
import { accountToWebsiteJsonLd, JsonLd } from "@/ui/json-ld";
import { Nav } from "@/ui/nav/nav";
import { CartModalPage } from "./cart/cart-modal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Infer the return type of accountGet without importing commerce-kit at build time
type AccountGetResult = Awaited<ReturnType<typeof import("commerce-kit")["accountGet"]>>;
// Infer the return type of fileGet (for logo fallback)
type FileGetResult = Awaited<ReturnType<typeof import("commerce-kit")["fileGet"]>>;

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	let accountResult: AccountGetResult | null = null;
	let logoUrl: string | undefined;

	if (env.STRIPE_SECRET_KEY) {
		try {
			const { accountGet, fileGet } = await import("commerce-kit");

			accountResult = await accountGet();

			// Prefer a non-expired signed link if provided
			const liveLink = accountResult?.logo?.links?.data?.find((l) => !l?.expired);
			if (liveLink?.url) {
				logoUrl = liveLink.url as string;
			} else if (accountResult?.logo?.id) {
				// Fallback: fetch the file to get a stable URL
				const file: FileGetResult | null = await fileGet(accountResult.logo.id);
				logoUrl = (file as unknown as { url?: string })?.url;
			}
		} catch (e) {
			// Keep the layout rendering even if commerce calls fail
			console.warn("StoreLayout: failed to load account/logo via commerce-kit.", e);
		}
	} else {
		// No Stripe in this environment — skip commerce calls entirely
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

			{/* JSON-LD still renders; missing fields are simply omitted */}
			<JsonLd
				jsonLd={accountToWebsiteJsonLd({
					account: accountResult?.account,
					logoUrl,
				})}
			/>
		</>
	);
}
