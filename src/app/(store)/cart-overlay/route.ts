// src/app/(store)/cart-overlay/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(req: Request) {
	const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
	const url = new URL(req.url);
	url.pathname = `${base}/cart`;
	return NextResponse.redirect(url);
}

export const HEAD = GET;
