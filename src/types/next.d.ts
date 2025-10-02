// src/types/next.d.ts
import type {} from "next";

declare module "next" {
	interface PageProps<
		TParams = Record<string, string | string[] | undefined>,
		TSearchParams = Record<string, string | string[] | undefined>,
	> {
		params?: Promise<TParams> | TParams;
		searchParams?: Promise<TSearchParams> | TSearchParams;
	}
}
