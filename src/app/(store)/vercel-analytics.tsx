// src/app/(store)/vercel-analytics.tsx
"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export function VercelAnalyticsScripts() {
	const [allow, setAllow] = useState(false);

	useEffect(() => {
		const host = window.location.hostname;
		const isProd = process.env.NODE_ENV === "production";
		const isVercel = !!process.env.VERCEL;
		const isWebflowCloud = process.env.WEBFLOW_CLOUD === "true";

		if (
			isProd &&
			isVercel &&
			!isWebflowCloud &&
			(host.endsWith("vercel.app") || host === "store.crystalthedeveloper.ca")
		) {
			setAllow(true);
		}
	}, []);

	if (!allow) return null;

	return (
		<>
			<Script defer src="/_vercel/insights/script.js" />
			<Script defer src="/_vercel/speed-insights/script.js" />
		</>
	);
}
