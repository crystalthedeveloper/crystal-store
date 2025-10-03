// src/app/(store)/order/success/page.tsx
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import type Stripe from "stripe";
import { Badge } from "@/components/ui/badge";
import { env } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { createStripeClient } from "@/lib/stripe/client";
import { formatMoney, formatProductName } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("/order.metadata");
	return { title: t("title") };
};

type NextSearchParams = Record<string, string | string[] | undefined>;

const stripe = env.STRIPE_SECRET_KEY ? createStripeClient(env.STRIPE_SECRET_KEY) : null;

export default async function OrderDetailsPage({
	searchParams,
}: {
	searchParams: Promise<NextSearchParams>;
}) {
	noStore();

	const sp = await searchParams;
	const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
	const nextUrl =
		typeof sp.next === "string" ? Buffer.from(sp.next, "base64url").toString("utf8") : undefined;
	if (nextUrl) redirect(nextUrl);

	if (!sessionId) return <div>Missing session_id</div>;

	if (!stripe) {
		const t = await getTranslations("/order.page");
		return (
			<article className="max-w-3xl pb-32">
				<h1 className="mt-4 text-3xl font-bold tracking-tight">{t("title")}</h1>
				<p className="mt-2">{t("description")}</p>
				<p className="mt-6 text-sm text-muted-foreground">
					We’ll email your receipt shortly. (Stripe secret key not configured.)
				</p>
			</article>
		);
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId, {
		expand: ["line_items", "line_items.data.price.product", "payment_intent", "customer"],
	});

	if (!session) return <div>Order not found</div>;

	const t = await getTranslations("/order.page");
	const locale = await getLocale();

	return (
		<article className="max-w-3xl pb-32">
			<h1 className="mt-4 inline-flex items-center text-3xl font-bold leading-none tracking-tight">
				{t("title")}
				<PaymentStatus status={session.payment_status} />
			</h1>
			<p className="mt-2">{t("description")}</p>

			<dl className="mt-12 space-y-2 text-sm">
				<dt className="font-semibold text-foreground">{t("orderNumberTitle")}</dt>
				<dd className="text-accent-foreground">{session.id}</dd>
			</dl>

			<h2 className="sr-only">{t("productsTitle")}</h2>
			{/* Products List */}
			<ul role="list" className="my-8 space-y-6">
				{session.line_items?.data.map((line) => {
					const product = line.price?.product;
					const priceMetadata = (line.price?.metadata ?? {}) as Record<string, string | undefined>;
					const productMetadata =
						typeof product === "object" && product && !product.deleted
							? ((product.metadata ?? {}) as Record<string, string | undefined>)
							: {};
					const baseName =
						typeof product === "object" && product && !product.deleted
							? (product.name ?? line.description ?? "Product")
							: (line.description ?? "Product");
					const color = priceMetadata.color ?? productMetadata.color;
					const size = priceMetadata.size ?? productMetadata.size;
					const variantFallback = priceMetadata.variant ?? productMetadata.variant;
					const variantParts = [color, size, ...(color || size ? [] : [variantFallback])];
					const displayName = formatProductName(baseName, variantParts);
					return (
						<li key={line.id} className="flex items-start gap-6 rounded-lg border p-4 shadow-sm">
							{/* Product Image */}
							{product &&
								typeof product !== "string" &&
								!product.deleted &&
								Array.isArray(product.images) &&
								product.images.length > 0 && (
									<Image
										src={product.images[0] as string} // ✅ force type safe, never undefined
										alt={line.description ?? "Product image"}
										width={100}
										height={100}
										className="h-24 w-24 rounded-md object-cover"
										priority
									/>
								)}

							{/* Product Details */}
							<div className="flex-1">
								<h3 className="font-semibold text-lg text-neutral-900">{displayName}</h3>

								<div className="mt-2 grid grid-cols-3 gap-4 text-sm text-muted-foreground leading-relaxed">
									<div>
										<p className="font-medium">{t("price")}</p>
										<p className="leading-relaxed">
											{formatMoney({
												amount: line.price?.unit_amount ?? 0,
												currency: line.price?.currency ?? "usd",
												locale,
											})}
										</p>
									</div>
									<div>
										<p className="font-medium">{t("quantity")}</p>
										<p>{line.quantity}</p>
									</div>
									<div>
										<p className="font-medium">{t("total")}</p>
										<p className="leading-relaxed">
											{formatMoney({
												amount: (line.price?.unit_amount ?? 0) * (line.quantity ?? 1),
												currency: line.price?.currency ?? "usd",
												locale,
											})}
										</p>
									</div>
								</div>
							</div>
						</li>
					);
				})}
			</ul>

			<div className="col-span-2 grid grid-cols-2 gap-8 border-t pt-8">
				<h3 className="font-semibold leading-none text-neutral-700">{t("total")}</h3>
				<p className="leading-relaxed">
					{formatMoney({
						amount: session.amount_total ?? 0,
						currency: session.currency ?? "usd",
						locale,
					})}
				</p>
			</div>
		</article>
	);
}

const PaymentStatus = ({ status }: { status: string }) => {
	const statusToVariant = {
		canceled: "destructive",
		processing: "secondary",
		unpaid: "destructive",
		paid: "default",
	} as const;

	const variant: ComponentProps<typeof Badge>["variant"] =
		statusToVariant[status as keyof typeof statusToVariant] ?? "secondary";

	return (
		<Badge className="ml-2 capitalize" variant={variant}>
			{status}
		</Badge>
	);
};
