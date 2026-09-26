import type { CollectionEntry } from "astro:content";
import type { KnowledgeGraph } from "../types/graph";
import { buildKnowledgeGraph, toPostNode } from "./graph-utils";
import { getPublishedPosts, isPublishedPost } from "./published-posts";

let snapshot: { source: string; graph: KnowledgeGraph } | null = null;

/** Reuse one snapshot only whilst its current public content is unchanged. */
export async function loadKnowledgeGraph(
	entries?: CollectionEntry<"blog">[],
): Promise<KnowledgeGraph> {
	const posts = entries ?? (await getPublishedPosts());
	const nodes = posts
		.filter(isPublishedPost)
		.map(toPostNode)
		.sort((left, right) => left.id.localeCompare(right.id));
	const source = JSON.stringify(nodes);
	if (snapshot?.source === source) return snapshot.graph;

	const graph = buildKnowledgeGraph(nodes);
	snapshot = { source, graph };
	return graph;
}
