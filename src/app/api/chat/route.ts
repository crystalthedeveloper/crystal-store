// src/app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { searchProducts } from "@/lib/search/search";

// ✅ Force Node.js runtime (supabase, stripe, etc. require Node APIs)
export const runtime = "nodejs";

// ✅ Allow up to 30s execution (AI streaming can take longer)
export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const json = await req.json();
		// biome-ignore lint/suspicious/noExplicitAny: safe cast for chat messages
		const messages = (json as any).messages;

		if (!messages) {
			return new Response("Missing messages", { status: 400 });
		}

		const result = streamText({
			system: "Every search query should be changed to singular form",
			model: openai("gpt-4o-mini"),
			messages,
			tools: {
				productSearch: tool({
					description: "Get a list of matching products",
					inputSchema: z.object({
						query: z.string(),
					}),
					execute: async ({ query }) => {
						try {
							const products = await searchProducts(query);
							return products.slice(0, 4);
						} catch (err) {
							console.error("❌ Product search error:", err);
							return [];
						}
					},
				}),
			},
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("❌ Chat API error:", error instanceof Error ? error.message : error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
