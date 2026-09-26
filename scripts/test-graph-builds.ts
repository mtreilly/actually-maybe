import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { KnowledgeGraph, UnlinkedMention } from "../src/types/graph";

const firstId = "quality-graph-first";
const secondId = "quality-graph-second";
const topic = "quality-shared-topic";
const editedTopic = "quality-edited-topic";
const fixtures = [firstId, secondId].map((id) => `src/content/blog/${id}.md`);
for (const path of fixtures)
	assert(!existsSync(path), `Do not overwrite ${path}`);

function build(): KnowledgeGraph {
	execFileSync(resolve("node_modules/.bin/astro"), ["build", "--silent"], {
		stdio: "inherit",
	});
	return JSON.parse(
		readFileSync("dist/data/graph.json", "utf8"),
	) as KnowledgeGraph;
}

function writePost(
	id: string,
	title: string,
	topics: string[],
	marker: string,
): void {
	writeFileSync(
		`src/content/blog/${id}.md`,
		`---
title: "${title}"
description: "${marker} ${topic} ${topic} ${topic}"
pubDate: 2026-09-26
topics: ${JSON.stringify(topics)}
type: "note"
---
${marker}: current graph content.
`,
	);
}

function suggestions(): UnlinkedMention[] {
	return JSON.parse(
		readFileSync("docs/graph-suggestions.json", "utf8"),
	) as UnlinkedMention[];
}

function assertViews(graph: KnowledgeGraph, id: string, title: string): void {
	assert.equal(graph.posts.find((post) => post.id === id)?.title, title);
	assert(readFileSync("dist/graph/index.html", "utf8").includes(title));
	const html = readFileSync(`dist/blog/${id}/index.html`, "utf8");
	assert(
		html.includes(`<meta name="graph:posts" content="${graph.posts.length}"`),
	);
	assert.equal(graph.stats.totalPosts, graph.posts.length);
}

// Build once to establish expected membership without relying on stale dist/.
const baseline = build()
	.posts.map((post) => post.id)
	.sort();
try {
	writePost(firstId, "First graph fixture", [topic, "ai"], "Original marker");
	writePost(secondId, "Second graph fixture", [topic, "ai"], "Second marker");
	// Remove all derived Astro inputs to exercise a genuinely cold content build.
	rmSync(".astro", { recursive: true, force: true });
	let graph = build();
	assertViews(graph, firstId, "First graph fixture");
	assertViews(graph, secondId, "Second graph fixture");
	assert.equal(graph.posts.length, baseline.length + 2);
	assert(
		graph.edges.some(
			(edge) => edge.source === firstId && edge.target === secondId,
		),
	);
	assert(
		suggestions().some(
			(mention) =>
				mention.sourcePostId === firstId && mention.targetPostId === secondId,
		),
	);

	writePost(
		firstId,
		"Edited graph fixture",
		[editedTopic, "ai"],
		"Edited marker",
	);
	graph = build();
	assertViews(graph, firstId, "Edited graph fixture");
	assert.deepEqual(graph.topics[editedTopic], [firstId]);
	assert.deepEqual(graph.topics[topic], [secondId]);
	const refreshed = suggestions().find(
		(mention) =>
			mention.sourcePostId === firstId && mention.targetPostId === secondId,
	);
	assert(
		refreshed?.snippet?.includes("Edited marker"),
		"Warm suggestions must use edited content",
	);
	assert(
		!suggestions().some(
			(mention) =>
				mention.sourcePostId === secondId && mention.targetPostId === firstId,
		),
	);

	rmSync(fixtures[0]);
	graph = build();
	assert(!graph.posts.some((post) => post.id === firstId));
	assert(
		!graph.edges.some(
			(edge) => edge.source === firstId || edge.target === firstId,
		),
	);
	assert(!graph.topics[editedTopic]);
	assert(!readFileSync("dist/graph/index.html", "utf8").includes(firstId));
	assert(
		!readFileSync("docs/graph-suggestions.json", "utf8").includes(firstId),
	);
	assert(!existsSync(`dist/blog/${firstId}/index.html`));
	assert(
		!readFileSync("src/generated/route-manifest.json", "utf8").includes(
			firstId,
		),
	);
	assertViews(graph, secondId, "Second graph fixture");
	console.log(
		"Cold additions, warm edits/removal, and snapshot agreement passed.",
	);
} finally {
	for (const path of fixtures) rmSync(path, { force: true });
	const restored = build()
		.posts.map((post) => post.id)
		.sort();
	assert.deepEqual(
		restored,
		baseline,
		"Fixture cleanup must restore published membership",
	);
}
