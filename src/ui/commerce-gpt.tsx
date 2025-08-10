// src/ui/commerce-gpt.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { type ComponentProps, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductList } from "./commercegpt/product-list";
import { YnsLink } from "./yns-link";

// ---- minimal, explicit runtime guards (no `any`)
type TextUIPart = { type: "text"; text: string };
type DynamicToolPartCommon = {
	type: "dynamic-tool";
	toolName?: unknown;
	state: "input-streaming" | "input-available" | "output-available" | "output-error";
	output?: unknown;
	toolCallId?: unknown;
};
type ProductSearchTypedPart = {
	// typed tool part if your tool is named `productSearch`
	type: "tool-productSearch";
	state: "input-streaming" | "input-available" | "output-available" | "output-error";
	output?: unknown;
	toolCallId?: unknown;
};

function isTextPart(p: unknown): p is TextUIPart {
	return (
		!!p &&
		typeof p === "object" &&
		(p as { type?: unknown }).type === "text" &&
		typeof (p as { text?: unknown }).text === "string"
	);
}

function isDynamicProductSearchPart(p: unknown): p is DynamicToolPartCommon {
	return (
		!!p &&
		typeof p === "object" &&
		(p as { type?: unknown }).type === "dynamic-tool" &&
		(p as { toolName?: unknown }).toolName === "productSearch" &&
		typeof (p as { state?: unknown }).state === "string"
	);
}

function isTypedProductSearchPart(p: unknown): p is ProductSearchTypedPart {
	return !!p && typeof p === "object" && (p as { type?: unknown }).type === "tool-productSearch";
}

export function CommerceGPT() {
	const { messages, sendMessage, status, stop } = useChat({});
	const [input, setInput] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const pathname = usePathname();
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	const sendUserText = (text: string) => {
		if (!text.trim()) return;
		// AI SDK v5: string or CreateUIMessage object is allowed. We use the object form.
		sendMessage({ text });
	};

	return (
		<div className="flex flex-col">
			<div className="bg-linear-to-r from-orange-100 via-orange-200 to-red-300 px-4 py-3 text-indigo-900">
				<div className="flex items-center justify-between gap-x-4">
					<div className="mx-auto flex max-w-7xl items-center justify-between gap-x-4">
						<div className="flex items-center gap-x-4">
							<p className="text-center text-sm font-medium">
								🎉 You can use powerful OpenAI models to search and buy products
							</p>
							<Button
								size="sm"
								className="flex-none rounded-full bg-orange-600 px-3 py-1 text-sm font-semibold text-white shadow-xs hover:bg-orange-700 focus-visible:ring-0"
								onClick={() => {
									ref.current?.focus();
									setIsOpen((v) => !v);
								}}
							>
								Commerce GPT <ChevronDown />
							</Button>
						</div>
					</div>
					<YnsLink
						className="bg-black rounded-full text-white px-4 py-1 text-sm"
						href="https://github.com/yournextstore/yournextstore"
						target="_blank"
					>
						View on GitHub
					</YnsLink>
				</div>
			</div>

			<div
				className={`z-100 overflow-clip fixed top-0 left-0 right-0 bg-neutral-50 transition-all duration-300 ease-in-out shadow-lg ${
					isOpen ? "h-2/3" : "h-0"
				}`}
			>
				<Card className="w-full h-full rounded-none max-w-(--breakpoint-lg) mx-auto border-transparent">
					<CardContent className="p-4 h-full flex flex-col">
						<div className="grow overflow-auto space-y-4 mb-4">
							{messages.length === 0 && (
								<div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center space-y-6 h-full">
									<h3 className="text-xl font-bold text-center">
										Welcome to{" "}
										<span className="bg-linear-to-r from-orange-500 via-red-500 to-red-600 text-transparent bg-clip-text">
											Commerce GPT
										</span>{" "}
										in Your Next Store
									</h3>
									<div className="flex flex-wrap justify-center gap-2 w-full">
										<Button
											variant="outline"
											className="text-lg text-neutral-500"
											size="lg"
											onClick={() => sendUserText("Show me some bags")}
										>
											Show me some bags
										</Button>
										<Button
											variant="outline"
											className="text-lg text-neutral-500"
											size="lg"
											onClick={() => sendUserText("Show me cool sunglasses")}
										>
											Looking for cool glasses
										</Button>
									</div>
								</div>
							)}

							{messages.map((message) => {
								const role = message.role === "user" ? "user" : "assistant";
								const hasTools = message.parts?.some(
									(p) => isDynamicProductSearchPart(p) || isTypedProductSearchPart(p),
								);
								const bubbleClass =
									role === "user"
										? "bg-linear-to-l from-orange-500 via-red-400 to-red-500 text-white"
										: hasTools
											? "bg-transparent"
											: "bg-neutral-100";

								return (
									<div
										key={message.id}
										className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
									>
										<div className={`text-lg rounded px-2 py-1 max-w-[80%] ${bubbleClass}`}>
											{/* render text parts */}
											{message.parts?.filter(isTextPart).map((p, i) => (
												<span key={`${message.id}-text-${i}`}>{p.text}</span>
											))}

											{/* render tool parts (typed + dynamic) */}
											{message.parts?.map((part, idx) => {
												const key = `${message.id}-tool-${idx}`;

												// Dynamic tools (no compile-time type), e.g. MCP or unknown tools:
												if (isDynamicProductSearchPart(part)) {
													if (part.state !== "output-available") return null;
													const out = (part.output ?? []) as unknown;

													// Type-safe prop inference from your component (no `any`)
													type PLProps = ComponentProps<typeof ProductList>;
													const products = out as PLProps["products"];

													if (!Array.isArray(out) || (Array.isArray(out) && out.length === 0)) {
														return <div key={key}>No results</div>;
													}
													return (
														<div key={key} className="grid grid-cols-1 gap-4">
															<ProductList products={products} />
															<div className="flex flex-wrap justify-center gap-2 w-full">
																<Button
																	variant="outline"
																	className="text-lg text-neutral-500"
																	size="lg"
																	onClick={() => sendUserText("Add the first product to the cart")}
																>
																	Add the first product to the cart
																</Button>
															</div>
														</div>
													);
												}

												// Typed tool part (name known at compile time):
												if (isTypedProductSearchPart(part)) {
													if (part.state !== "output-available") return null;
													const out = (part.output ?? []) as unknown;
													type PLProps = ComponentProps<typeof ProductList>;
													const products = out as PLProps["products"];

													if (!Array.isArray(out) || (Array.isArray(out) && out.length === 0)) {
														return <div key={key}>No results</div>;
													}
													return (
														<div key={key} className="grid grid-cols-1 gap-4">
															<ProductList products={products} />
															<div className="flex flex-wrap justify-center gap-2 w-full">
																<Button
																	variant="outline"
																	className="text-lg text-neutral-500"
																	size="lg"
																	onClick={() => sendUserText("Add the first product to the cart")}
																>
																	Add the first product to the cart
																</Button>
															</div>
														</div>
													);
												}

												return null;
											})}
										</div>
									</div>
								);
							})}
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								const value = input.trim();
								if (value) {
									sendUserText(value);
									setInput("");
								}
							}}
							className="flex space-x-2 items-center"
						>
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="What do you want to buy today?"
								className="grow h-12 md:text-xl"
								ref={ref}
							/>
							<Button
								type="submit"
								size="lg"
								className="rounded-full text-lg h-12"
								disabled={status === "submitted" || status === "streaming"}
							>
								<ArrowUp />
							</Button>
							{status === "streaming" && (
								<Button type="button" variant="outline" size="lg" onClick={() => stop()}>
									Stop
								</Button>
							)}
						</form>
					</CardContent>
				</Card>
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 transition-opacity ease-in-out duration-300"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
}
