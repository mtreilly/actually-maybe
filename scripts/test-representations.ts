import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { RouteManifest } from "../src/integrations/route-manifest";
import { POST_TYPES } from "../src/lib/post-types";
import type { KnowledgeGraph } from "../src/types/graph";

const read = (path: string): string => readFileSync(`dist/${path}`, "utf8");
const manifest = JSON.parse(
	readFileSync("src/generated/route-manifest.json", "utf8"),
) as RouteManifest;
for (const route of manifest.htmlRoutes) {
	assert(
		manifest.markdownRoutes[route],
		`${route}: every content page needs its Markdown sibling`,
	);
	const markdown = read(manifest.markdownRoutes[route].slice(1));
	assert(markdown.startsWith("---\n") && markdown.includes("canonicalUrl:"));
}
const htmlPostIds = (text: string): string[] =>
	[...text.matchAll(/href="\/blog\/([^/"?#]+)\//g)].map((match) => match[1]);
const markdownPostIds = (text: string): string[] =>
	[...text.matchAll(/\]\(https?:\/\/[^/]+\/blog\/([^/()?#]+)\//g)].map(
		(match) => match[1],
	);
const homeCards =
	read("index.html").match(
		/<h[234] class="post-title-heading"[\s\S]*?<\/h[234]>/g,
	) ?? [];
const homeIds = homeCards.flatMap(htmlPostIds);
assert.deepEqual(
	markdownPostIds(read("index.md")),
	homeIds,
	"Latest writing must have identical selection and order",
);
assert.equal(homeIds.length, 10);
const graph = JSON.parse(read("data/graph.json")) as KnowledgeGraph;
const searchItems =
	read("search/index.html").match(/<li[^>]*data-search-post[\s\S]*?<\/li>/g) ??
	[];
assert.deepEqual(
	markdownPostIds(read("search.md")),
	searchItems.flatMap(htmlPostIds),
	"Search index must remain useful without interaction in either format",
);
assert.equal(searchItems.length, graph.posts.length);
for (const kind of POST_TYPES) {
	const expected = graph.posts.filter((post) => post.type === kind).length;
	if (!expected) {
		assert(!manifest.htmlRoutes.includes(`/type/${kind}`));
		assert(!manifest.markdownRoutes[`/type/${kind}`]);
		continue;
	}
	const markdown = read(`type/${kind}.md`);
	assert.equal(markdownPostIds(markdown).length, expected);
}

const graphHtml = read("graph/index.html");
const graphMarkdown = read("graph.md");
const panels =
	graphHtml.match(/<details class="topic-panel"[\s\S]*?<\/details>/g) ?? [];
assert.equal(panels.length, Object.keys(graph.topics).length);
for (const panel of panels) {
	const topic = panel.match(/<strong[^>]*>([^<]+)<\/strong>/)?.[1];
	assert(topic);
	const heading = `### ${topic}\n`;
	assert(graphMarkdown.includes(heading), `Markdown must include ${topic}`);
	const section = graphMarkdown.split(heading)[1].split("\n### ")[0];
	assert.deepEqual(
		markdownPostIds(section),
		htmlPostIds(panel),
		`${topic}: grouped posts must agree`,
	);
}
const connectedHtml =
	graphHtml.match(/<ul class="connections-list"[\s\S]*?<\/ul>/)?.[0] ?? "";
const connectedMarkdown = graphMarkdown
	.split("## Most connected posts\n")[1]
	.split("\n## Topics & posts")[0];
assert.deepEqual(
	markdownPostIds(connectedMarkdown),
	htmlPostIds(connectedHtml),
);
for (const value of [
	`Posts: ${graph.stats.totalPosts}`,
	`Connections: ${graph.stats.totalEdges}`,
	`Topics: ${graph.stats.totalTopics}`,
])
	assert(graphMarkdown.includes(value));
console.log(
	`Representation coverage and semantic parity passed across ${manifest.htmlRoutes.length} content routes.`,
);
