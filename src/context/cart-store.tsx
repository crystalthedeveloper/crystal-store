// src/context/cart-store.tsx
"use client";

import { create } from "zustand";

export type CartLine = {
	id: string;
	priceId: string;
	name: string;
	image?: string;
	price: number; // unit amount in cents
	currency: string;
	quantity: number;
	variant?: string;
	metadata?: {
		color?: string;
		size?: string;
		variant?: string;
		[key: string]: string | undefined;
	};
};

type CartState = {
	lines: CartLine[];
	addItem: (line: CartLine) => void;
	updateQuantity: (line: CartLine, action: "INCREASE" | "DECREASE") => void;
	removeItem: (line: CartLine) => void;
	clear: () => void;
	loadFromStorage: () => void;
};

// 🔑 Normalize for safe comparison
function norm(v?: string) {
	return (v ?? "").toLowerCase().trim();
}

// 🔑 Helper: consistent key matching (same product + variant)
function isSameLine(a: CartLine, b: CartLine) {
	return (
		a.id === b.id &&
		a.priceId === b.priceId &&
		norm(a.metadata?.color) === norm(b.metadata?.color) &&
		norm(a.metadata?.size) === norm(b.metadata?.size)
	);
}

const STORAGE_KEY = "local_cart";

function saveToStorage(lines: CartLine[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
	} catch (err) {
		console.error("❌ Failed to save cart:", err);
	}
}

function loadFromStorage(): CartLine[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartLine[]) : [];
	} catch {
		return [];
	}
}

export const useCartStore = create<CartState>((set, get) => ({
	lines: loadFromStorage(),

	addItem: (line) =>
		set((state) => {
			const existing = state.lines.find((l) => isSameLine(l, line));
			let newLines;

			if (existing) {
				// Merge by increasing quantity and preserving enriched metadata
				newLines = state.lines.map((l) =>
					isSameLine(l, line)
						? {
								...l,
								quantity: l.quantity + line.quantity,
								metadata: { ...(l.metadata ?? {}), ...(line.metadata ?? {}) },
							}
						: l,
				);
			} else {
				newLines = [...state.lines, line];
			}

			saveToStorage(newLines);
			return { lines: newLines };
		}),

	updateQuantity: (line, action) =>
		set((state) => {
			let newLines = state.lines.map((l) =>
				isSameLine(l, line)
					? {
							...l,
							quantity: Math.max(0, l.quantity + (action === "INCREASE" ? 1 : -1)),
						}
					: l,
			);

			// Filter out lines with 0 quantity
			newLines = newLines.filter((l) => l.quantity > 0);

			saveToStorage(newLines);
			return { lines: newLines };
		}),

	removeItem: (line) =>
		set((state) => {
			const newLines = state.lines.filter((l) => !isSameLine(l, line));
			saveToStorage(newLines);
			return { lines: newLines };
		}),

	clear: () => {
		saveToStorage([]);
		set({ lines: [] });
	},

	loadFromStorage: () => {
		const stored = loadFromStorage();
		set({ lines: stored });
	},
}));
