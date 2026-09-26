import type { CollectionEntry } from "astro:content";
import assert from "node:assert/strict";
import { loadKnowledgeGraph } from "../knowledge-graph-loader";

const post: CollectionEntry<"blog"> = {
	id: "snapshot-probe",
	collection: "blog",
	body: "One short thought.",
	data: {
		title: "Original",
		description: "First idea",
		pubDate: new Date("2026-01-01"),
		topics: ["learning"],
		type: "note",
		draft: false,
	},
};
const original = await loadKnowledgeGraph([post]);
assert.strictEqual(await loadKnowledgeGraph([structuredClone(post)]), original);
const edited = await loadKnowledgeGraph([
	{ ...post, data: { ...post.data, title: "Edited", topics: ["ai"] } },
]);
assert.notStrictEqual(edited, original);
assert.equal(edited.posts[0].title, "Edited");
assert.deepEqual(edited.topics, { ai: [post.id] });
const privateGraph = await loadKnowledgeGraph([
	{ ...post, data: { ...post.data, draft: true } },
]);
assert.equal(privateGraph.stats.totalPosts, 0);
assert.equal((await loadKnowledgeGraph([])).posts.length, 0);
console.log("Graph snapshot reuse, edits, drafts, and removal passed.");
