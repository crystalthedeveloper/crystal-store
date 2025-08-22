// src/app/(store)/[...segments]/page.tsx
import Link, { type LinkProps } from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/ui/markdown"; // ← your markdown renderer

const pages: Record<string, { content: string }> = {
	"/about": {
		content: `
# About

This is the About page.

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Heading 2

### Heading 3

#### Heading 4
`,
	},
};

export default async function Page(props: { params: Promise<{ segments?: string[] }> }) {
	const { segments } = await props.params;
	if (!segments) return notFound();

	const path = `/${segments.join("/")}`;
	const page = pages[path];
	if (!page) return notFound();

	return (
		<div className="prose pb-8 pt-4 lg:prose-lg xl:prose-xl">
			{/* Our Markdown component just takes a source string */}
			<Markdown source={page.content} />
		</div>
	);
}
