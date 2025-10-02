// src/app/(store)/category/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { env, publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { deslugify } from "@/lib/utils";
import { ProductList } from "@/ui/products/product-list";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Infer item type
type ProductFromBrowse = Awaited<
  ReturnType<typeof import("commerce-kit")["productBrowse"]>
> extends (infer T)[]
  ? T
  : never;

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> => {
  const { slug } = params;
  const t = await getTranslations("/category.metadata");

  if (!env.STRIPE_SECRET_KEY) {
    return {
      title: t("title", { categoryName: deslugify(slug) }),
      alternates: { canonical: `${publicUrl}/store/category/${slug}` },
    };
  }

  try {
    const { productBrowse } = await import("commerce-kit");
    const products = await productBrowse({ first: 1, filter: { category: slug } });

    if (products.length === 0) {
      return {
        title: t("title", { categoryName: deslugify(slug) }),
        alternates: { canonical: `${publicUrl}/store/category/${slug}` },
      };
    }
  } catch {
    // On fetch error, return fallback metadata
  }

  return {
    title: t("title", { categoryName: deslugify(slug) }),
    alternates: { canonical: `${publicUrl}/store/category/${slug}` },
  };
};

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const t = await getTranslations("/category.page");

  if (!env.STRIPE_SECRET_KEY) {
    return (
      <main className="pb-8">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
          {deslugify(slug)}
          <div className="text-lg font-semibold text-muted-foreground">
            {t("title", { categoryName: deslugify(slug) })}
          </div>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Store preview is disabled in this environment (Stripe is not configured).
        </p>
      </main>
    );
  }

  let products: ProductFromBrowse[] = [];
  try {
    const { productBrowse } = await import("commerce-kit");
    products = await productBrowse({ first: 100, filter: { category: slug } });
  } catch (e) {
    console.warn("CategoryPage: productBrowse failed; treating as empty category.", e);
  }

  if (products.length === 0) {
    notFound();
  }

  return (
    <main className="pb-8">
      <h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
        {deslugify(slug)}
        <div className="text-lg font-semibold text-muted-foreground">
          {t("title", { categoryName: deslugify(slug) })}
        </div>
      </h1>
      <ProductList products={products} />
    </main>
  );
}
