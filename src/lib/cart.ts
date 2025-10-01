// src/lib/cart.ts
"use client";

import type { CartLine } from "@/context/cart-store";

const STORAGE_KEY = "local_cart";

// ✅ Load cart from localStorage
export function loadCart(): CartLine[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartLine[]) : [];
	} catch (err) {
		console.error("❌ Failed to load cart from localStorage", err);
		return [];
	}
}

// ✅ Save cart to localStorage
export function saveCart(cart: CartLine[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
	} catch (err) {
		console.error("❌ Failed to save cart to localStorage", err);
	}
}

// ✅ Clear cart
export function clearCart(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (err) {
		console.error("❌ Failed to clear cart", err);
	}
}
