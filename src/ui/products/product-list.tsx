// src/ui/products/product-list.tsx
import Image from "next/image";
import { getLocale } from "@/i18n/server";
import { formatMoney } from "@/lib/utils";
import { JsonLd, mappedProductsToJsonLd, type NormalizedProduct } from "@/ui/json-ld";
import { YnsLink } from "@/ui/yns-link";

export const ProductList = async ({ products }: { products: NormalizedProduct[] }) => {
	const locale = await getLocale();

	return (
		<>
			<ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((product, idx) => (
					<li key={product.id} className="group">
						<YnsLink href={`/product/${product.metadata?.slug ?? product.id}`}>
							<article>
								{product.images[0] && (
									<div className="aspect-square w-full overflow-hidden bg-neutral-100 rounded-lg">
										<Image
											className="
                        w-full h-full object-cover object-center 
                        transition-transform duration-500 
                        group-hover:scale-105 group-hover:rotate-1 group-hover:opacity-80
                      "
											src={product.images[0]}
											width={768}
											height={768}
											loading={idx < 3 ? "eager" : "lazy"}
											priority={idx < 3}
											sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 700px"
											alt={product.name}
										/>
									</div>
								)}

								{/* Flat text under the image */}
								<div className="mt-2">
									<h2 className="text-lg font-semibold text-neutral-800">{product.name}</h2>
									<footer className="text-base font-medium text-neutral-900">
										{product.default_price.unit_amount && (
											<p>
												{formatMoney({
													amount: product.default_price.unit_amount,
													currency: product.default_price.currency,
													locale,
												})}
											</p>
										)}
									</footer>
								</div>
							</article>
						</YnsLink>
					</li>
				))}
			</ul>
			<JsonLd jsonLd={mappedProductsToJsonLd(products)} />
		</>
	);
};
