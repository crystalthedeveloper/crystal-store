// src/context/cart-store.tsx
"use client";

import { create } from "zustand";

export type CartLine = {
	id: string;
	priceId?: string;
	name: string;
	image?: string;
	price: number;
	currency: string;
	quantity: number;
	variant?: string; // optional, but no longer used for equality
	metadata?: {
		color?: string;
		size?: string;
		[key: string]: string | undefined;
	};
};

type CartState = {
	lines: CartLine[];
	addItem: (line: CartLine) => void;
	clear: () => void;
};

// 🔑 Normalize for safe comparison
function norm(v?: string) {
	return (v ?? "").toLowerCase().trim();
}

// 🔑 Helper: consistent key matching
function isSameLine(a: CartLine, b: CartLine) {
	return (
		a.id === b.id &&
		a.priceId === b.priceId &&
		norm(a.metadata?.color) === norm(b.metadata?.color) &&
		norm(a.metadata?.size) === norm(b.metadata?.size)
	);
}

export const useCartStore = create<CartState>((set) => ({
	lines: [],
	addItem: (line) =>
		set((state) => {
			// 🆕 Check if same product + price + color + size
			const existing = state.lines.find((l) => isSameLine(l, line));

			if (existing) {
				// ✅ Merge by increasing quantity
				return {
					lines: state.lines.map((l) =>
						isSameLine(l, line) ? { ...l, quantity: l.quantity + line.quantity } : l,
					),
				};
			}

			// ✅ Otherwise add a new distinct line
			return { lines: [...state.lines, line] };
		}),
	clear: () => set({ lines: [] }),
}));
