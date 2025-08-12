// src/scripts/select-config.cjs
const fs = require("node:fs");

const isVercel = !!process.env.VERCEL;
const isWebflow = !!process.env.WEBFLOW;

const target = "next.config.ts";
let source;

if (isVercel && fs.existsSync("next.vercel.config.ts")) {
  source = "next.vercel.config.ts";
  console.log("[build] Using next.vercel.config.ts");
} else if (isWebflow && fs.existsSync("next.webflow.config.ts")) {
  source = "next.webflow.config.ts";
  console.log("[build] Using next.webflow.config.ts");
} else if (fs.existsSync("next.webflow.config.ts")) {
  source = "next.webflow.config.ts"; // default to Webflow-safe
  console.log("[build] Using default next.webflow.config.ts");
}

if (source) {
  fs.copyFileSync(source, target);
} else {
  console.warn("[build] No config file found to copy");
}