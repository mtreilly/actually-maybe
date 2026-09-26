import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const slug = "quality-draft-probe";
const privateTopic = "quality-private-topic";
const fixture = resolve(`src/content/blog/${slug}.md`);
assert(
	!existsSync(fixture),
	"Publication probe must not overwrite an authored post",
);

function build(): void {
	execFileSync(resolve("node_modules/.bin/astro"), ["build", "--silent"], {
		stdio: "inherit",
	});
}

function assertPrivate(directory: string): void {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		assert(
			!path.includes(slug) && !path.includes(privateTopic),
			`Private route: ${path}`,
		);
		if (entry.isDirectory()) assertPrivate(path);
		else if (/\.(html|md|xml|json|txt|llm)$/.test(path)) {
			const content = readFileSync(path, "utf8");
			assert(!content.includes(slug), `Draft leaked into ${path}`);
			assert(
				!content.includes(privateTopic),
				`Private topic leaked into ${path}`,
			);
		}
	}
}

try {
	writeFileSync(
		fixture,
		`---
title: "Private quality draft"
description: "Private quality draft content."
pubDate: 2026-09-26
topics: ["${privateTopic}", "ai"]
type: "note"
draft: true
---
${slug}: this draft must stay private.
`,
	);
	build();
	assertPrivate("dist");
	const manifest = readFileSync("src/generated/route-manifest.json", "utf8");
	assert(!manifest.includes(slug) && !manifest.includes(privateTopic));
	const suggestions = readFileSync("docs/graph-suggestions.json", "utf8");
	assert(!suggestions.includes(slug));
	assert(!existsSync(`dist/blog/${slug}.md`));
	assert(!existsSync(`dist/blog/${slug}/index.html`));
	console.log(
		"Draft excluded from all public outputs and derived discovery data.",
	);
} finally {
	rmSync(fixture, { force: true });
	build();
}
