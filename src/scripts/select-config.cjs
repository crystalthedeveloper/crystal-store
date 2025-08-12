// src/scripts/select-config.cjs
// Selects the right Next config before `next build`
const fs = require("node:fs");

const isVercel = !!process.env.VERCEL;
const vercelFile = "next.vercel.config.ts";
const target = "next.config.ts";

try {
	if (isVercel && fs.existsSync(vercelFile)) {
		fs.copyFileSync(vercelFile, target);
		console.log("[build] Using next.vercel.config.ts");
	} else {
		console.log("[build] Using default next.config.ts");
	}
} catch (e) {
	console.warn("[build] Config swap skipped:", e?.message);
}
