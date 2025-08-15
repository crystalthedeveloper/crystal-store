// app/(store)/cart-overlay/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Preserve origin (and base path if you use one)
export function GET(req: Request) {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
  const url = new URL(req.url);
  url.pathname = `${base}/cart`;
  return NextResponse.redirect(url);
}

// Handle HEAD the same way (some crawlers use HEAD)
export const HEAD = GET;