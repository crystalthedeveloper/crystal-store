// root layout
//import "@devlink/global.css";
//import { DevLinkProvider } from "@devlink/DevLinkProvider";
import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Script from "next/script";
import { CartModalPage } from "@/app/(store)/cart/cart-modal";
import { Toaster } from "@/components/ui/sonner";
// ✅ import cart modal context + page
import { CartModalProvider } from "@/context/cart-modal";
import { env, publicUrl } from "@/env.mjs";
import { IntlClientProvider } from "@/i18n/client";
import { getLocale, getMessages, getTranslations } from "@/i18n/server";

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("Global.metadata");
	return {
		title: t("title"),
		description: t("description"),
		metadataBase: new URL(publicUrl),
	};
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale} className="h-full antialiased">
			<body className="flex min-h-full flex-col">
				<IntlClientProvider messages={messages} locale={locale}>
					<CartModalProvider>
						<div className="flex min-h-full flex-1 flex-col bg-white" vaul-drawer-wrapper="">
							{children}
						</div>

						{/* ✅ Global CartModal mounted here */}
						<CartModalPage />

						<Toaster position="top-center" offset={10} />
					</CartModalProvider>
				</IntlClientProvider>

				{env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
					<Script
						async
						src="/stats/script.js"
						data-host-url={publicUrl + "/stats"}
						data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
					/>
				)}
				{process.env.NODE_ENV === "production" && process.env.WEBFLOW_CLOUD !== "true" && (
					<>
						<SpeedInsights />
						<Analytics />
					</>
				)}
			</body>
		</html>
	);
}
