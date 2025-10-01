// src/app/(store)/cart/page.tsx
import type { Metadata } from "next/types";
import { getTranslations } from "@/i18n/server";

export const generateMetadata = async (): Promise<Metadata> => {
	const t = await getTranslations("/cart.metadata");
	return { title: t("title") };
};

export default function CartPage() {
	// ✅ Nothing here — layout.tsx will render summary + checkout form
	return null;
}
