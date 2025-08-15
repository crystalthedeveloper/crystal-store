// src/app/(store)/cart-overlay/page.tsx
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RedirectToCart() {
	redirect("/cart");
}
