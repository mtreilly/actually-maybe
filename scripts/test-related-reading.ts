import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { KnowledgeGraph } from "../src/types/graph";

const graph = JSON.parse(
	readFileSync("dist/data/graph.json", "utf8"),
) as KnowledgeGraph;
for (const post of graph.posts) {
	const html = readFileSync(`dist/blog/${post.slug}/index.html`, "utf8");
	const markdown = readFileSync(`dist/blog/${post.slug}.md`, "utf8");
	const sidebar =
		html.match(/<aside class="sidebar"[\s\S]*?<\/aside>/)?.[0] ?? "";
	const reading = markdown.slice(markdown.lastIndexOf("## Further reading"));
	const sidebarIds = [...sidebar.matchAll(/href="\/blog\/([^/"?#]+)\//g)].map(
		(match) => match[1],
	);
	const markdownIds = [
		...reading.matchAll(/\]\(https?:\/\/[^/]+\/blog\/([^/()?#]+)\//g),
	].map((match) => match[1]);
	assert.deepEqual(
		sidebarIds,
		markdownIds.slice(0, 3),
		`${post.id}: HTML/Markdown reading policy must agree`,
	);
	assert(
		!html.includes("Also discussed in"),
		"Topic similarity must not be labelled as discussion/backlinks",
	);
}
console.log(
	`Related-reading parity passed across ${graph.posts.length} posts.`,
);
