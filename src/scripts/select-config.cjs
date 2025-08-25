// src/scripts/select-config.cjs
const fs = require("node:fs");

const target = "next.config.ts";

// Nothing to select anymore, just confirm file exists
if (fs.existsSync(target)) {
	console.log(`[build] Using ${target}`);
} else {
	console.warn("[build] No next.config.ts found!");
}
