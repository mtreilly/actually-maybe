import { strict as assert } from "node:assert";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Script } from "node:vm";

async function findHtmlFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await findHtmlFiles(path)));
		else if (entry.name.endsWith(".html")) files.push(path);
	}
	return files;
}

const files = await findHtmlFiles("dist");
assert(files.length > 0, "Build the site before checking browser scripts");
let scriptCount = 0;
for (const file of files) {
	const html = await readFile(file, "utf8");
	for (const match of html.matchAll(
		/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
	)) {
		const [, attributes, source] = match;
		if (/\bsrc\s*=/.test(attributes)) continue;
		const type = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
		if (type && type !== "text/javascript" && type !== "application/javascript")
			continue;
		// Inline Astro scripts bypass Vite. Parsing catches TypeScript assertions
		// and module imports that otherwise fail only in a reader's browser.
		new Script(source, { filename: file });
		scriptCount += 1;
	}
}
console.log(
	`Browser script syntax passed: ${scriptCount} scripts across ${files.length} pages.`,
);
