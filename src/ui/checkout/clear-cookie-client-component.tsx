// src/ui/checkout/clear-cookie-client-component.tsx
"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

// ✅ Clear client-side cart after purchase
export const ClearCookieClientComponent = () => {
	const router = useRouter();

	useEffect(() => {
		startTransition(() => {
			// Remove cart from localStorage
			localStorage.removeItem("localCart");

			// Optional: if you keep other state keys, clear them too
			// localStorage.removeItem("checkoutSessionId");

			// Refresh page so UI re-renders as empty cart
			router.refresh();
		});
	}, [router]);

	return null;
};
