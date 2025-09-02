// src/app/(store)/cart/cart-aside.tsx
import type { ReactNode } from "react";
import { CartAsideDrawer } from "./cart-aside-drawer";

export const CartAsideContainer = ({ children }: { children: ReactNode }) => {
	return (
		<CartAsideDrawer>
			<div
				// ✅ Give a clear description ID for the drawer content
				id="cart-overlay-description"
				className="flex h-full min-h-[80vh] flex-col"
			>
				{children}
			</div>
		</CartAsideDrawer>
	);
};
