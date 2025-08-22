// src/ui/markdown.tsx
import "server-only";
import React from "react";

/**
 * Ultra-light Markdown-ish renderer (no external deps).
 * Supports: #..###### headings, blank lines, and paragraphs.
 * If you need richer Markdown later, swap this for react-markdown or remark.
 */
export function Markdown({ source }: { source: string }) {
	const lines = source.split(/\r?\n/);

	const nodes = lines.map((raw, i) => {
		const line = raw.trim();

		if (!line) return <br key={`br-${i}`} />;

		if (line.startsWith("###### ")) return <h6 key={i}>{line.slice(7)}</h6>;
		if (line.startsWith("##### ")) return <h5 key={i}>{line.slice(6)}</h5>;
		if (line.startsWith("#### ")) return <h4 key={i}>{line.slice(5)}</h4>;
		if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
		if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
		if (line.startsWith("# ")) return <h1 key={i}>{line.slice(2)}</h1>;

		return <p key={i}>{raw}</p>;
	});

	return <>{nodes}</>;
}
