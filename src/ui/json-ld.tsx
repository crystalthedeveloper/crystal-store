// src/ui/json-ld.tsx
import type { ItemList, Product, Thing, WebSite, WithContext } from "schema-dts";
import type Stripe from "stripe";
import { formatProductName, getDecimalFromStripeAmount } from "@/lib/utils";

// ✅ Normalized type we send from CategoryPage → ProductList
export type NormalizedProduct = {
	id: string;
	name: string;
	description?: string | null;
	images: string[];
	metadata: {
		slug?: string;
		variant?: string;
		stock?: number | string;
		[key: string]: string | number | boolean | null | undefined;
	};
	default_price: {
		unit_amount: number | null;
		currency: string;
	};
};

export const JsonLd = <T extends Thing>({ jsonLd }: { jsonLd: WithContext<T> }) => {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
};

export const mappedProductToJsonLd = (product: NormalizedProduct): WithContext<Product> => {
	const productName = formatProductName(product.name, product.metadata?.variant);

	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: productName,
		image: product.images[0],
		description: product.description ?? undefined,
		sku: product.id,
		offers: {
			"@type": "Offer",
			price: getDecimalFromStripeAmount({
				amount: product.default_price.unit_amount ?? 0,
				currency: product.default_price.currency,
			}),
			priceCurrency: product.default_price.currency,
			availability:
				Number(product.metadata?.stock ?? 0) > 0
					? "https://schema.org/InStock"
					: "https://schema.org/OutOfStock",
		},
	};
};

export const mappedProductsToJsonLd = (products: readonly NormalizedProduct[]): WithContext<ItemList> => {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: products.map(mappedProductToJsonLd),
	};
};

export const accountToWebsiteJsonLd = ({
	account,
	logoUrl,
}: {
	account: Stripe.Account | null | undefined;
	logoUrl: string | null | undefined;
}): WithContext<WebSite> => {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: account?.business_profile?.name ?? "Your Next Store",
		url: account?.business_profile?.url ?? "https://yournextstore.com",
		mainEntityOfPage: {
			"@type": "WebPage",
			url: account?.business_profile?.url ?? "https://yournextstore.com",
		},
		...(logoUrl && {
			image: {
				"@type": "ImageObject",
				url: logoUrl,
			},
		}),
		publisher: {
			"@type": "Organization",
			name: account?.business_profile?.name ?? "Your Next Store",
			url: account?.business_profile?.url ?? "https://yournextstore.com",
		},
	};
};
