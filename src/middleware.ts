import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ProtectedPaths = ["/orders"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Only run on protected paths
	const isProtectedPath = ProtectedPaths.some((p) => pathname.startsWith(p));

	if (!isProtectedPath) {
		return NextResponse.next();
	}

	// ✅ Check for Supabase token cookie (set in auth.ts)
	const token = request.cookies.get("sb:token")?.value;

	if (!token) {
		// Redirect to login if missing
		return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login`, request.url));
	}

	// If token exists, just continue
	return NextResponse.next();
}

// ✅ Apply middleware only to these routes
export const config = {
	matcher: ["/orders"],
};
