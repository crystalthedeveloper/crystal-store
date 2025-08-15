import * as Commerce from "commerce-kit";
import type { MetadataRoute } from "next";
import { env, publicUrl } from "@/env.mjs";
import StoreConfig from "@/store.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // don’t prerender; compute at request time

type Item = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: Item[] = [];

  try {
    if (env.STRIPE_SECRET_KEY) {
      // Pass secret directly so commerce-kit won’t complain at build time
      const products = await Commerce.productBrowse({
        first: 100,
        secretKey: env.STRIPE_SECRET_KEY,
        tagPrefix: undefined,
      } as unknown as Record<string, unknown>);

      productUrls = products
        .filter((p: any) => p?.metadata?.slug)
        .map(
          (product: any) =>
            ({
              url: `${publicUrl}/product/${product.metadata.slug}`,
              lastModified: new Date(((product.updated ?? Date.now() / 1000) as number) * 1000),
              changeFrequency: "daily",
              priority: 0.8,
            }) satisfies Item,
        );
    } else {
      console.warn("sitemap: STRIPE_SECRET_KEY missing; skipping product URLs.");
    }
  } catch (e) {
    console.warn("sitemap: failed to fetch products; continuing with static URLs.", e);
  }

  const categoryUrls: Item[] = StoreConfig.categories.map(
    (category) =>
      ({
        url: `${publicUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.5,
      }) satisfies Item,
  );

  return [
    {
      url: publicUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...productUrls,
    ...categoryUrls,
  ];
}