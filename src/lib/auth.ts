// src/lib/auth.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

// Supabase client (service-side)
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const SessionDuration = 24 * 60 * 60 * 1000; // 24h

// --- LOGIN ---
export async function login(_state: unknown, formData: FormData): Promise<{ error?: string } | undefined> {
	"use server";

	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { error: "Email and password are required." };
	}

	const { data, error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		return { error: error.message };
	}

	// Store the Supabase access token in cookies
	const { session } = data;
	if (!session) {
		return { error: "No session returned from Supabase." };
	}

	(await cookies()).set("sb:token", session.access_token, {
		expires: new Date(Date.now() + SessionDuration),
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	redirect("/orders");
	return;
}

// --- LOGOUT ---
export async function logout() {
	"use server";
	(await cookies()).delete("sb:token");
	redirect("/login");
}

// --- AUTH CHECK ---
export async function auth() {
	const token = (await cookies()).get("sb:token")?.value;
	if (!token) return null;

	const { data, error } = await supabase.auth.getUser(token);
	if (error || !data.user) {
		(await cookies()).delete("sb:token");
		return null;
	}

	return data.user; // full Supabase user object
}

// --- SESSION REFRESH (optional) ---
export async function updateSession(request: NextRequest) {
	const token = (await cookies()).get("sb:token")?.value;
	if (!token) return NextResponse.next();

	// Supabase auto-refreshes tokens under the hood,
	// so here you’d normally call supabase.auth.refreshSession if needed.
	return NextResponse.next();
}
