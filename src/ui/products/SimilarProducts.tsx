// src/ui/products/SimilarProducts.tsx
import Image from "next/image";
import { publicUrl } from "@/env.mjs";
import { getRecommendedProducts } from "@/lib/search/trieve";
import { formatMoney } from "@/lib/utils";
import type { TrieveProductMetadata } from "@/scripts/upload-trieve";
import { YnsLink } from "@/ui/yns-link";

export async function SimilarProducts({ id }: { id: string }) {
	const products = await getRecommendedProducts({ productId: id, limit: 4 });
	if (!products) return null;

	return (
		<section className="py-12">
			<div className="mb-8">
				<h2 className="text-2xl font-bold tracking-tight">You May Also Like</h2>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{products.map((p) => {
					const meta = p.metadata as TrieveProductMetadata;
					return (
						<div key={p.tracking_id} className="overflow-hidden rounded bg-card shadow-sm">
							{meta.image_url && (
								<YnsLink href={`${publicUrl}${p.link}`} className="block" prefetch={false}>
									<Image
										className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-80"
										src={meta.image_url}
										width={300}
										height={300}
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
										alt=""
									/>
								</YnsLink>
							)}
							<div className="p-4">
								<h3 className="mb-2 text-lg font-semibold">
									<YnsLink href={p.link || "#"} className="hover:text-primary" prefetch={false}>
										{meta.name}
									</YnsLink>
								</h3>
								<div className="flex items-center justify-between">
									<span>{formatMoney({ amount: meta.amount, currency: meta.currency })}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
