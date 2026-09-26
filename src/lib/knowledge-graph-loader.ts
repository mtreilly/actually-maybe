import type { CollectionEntry } from "astro:content";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { KnowledgeGraph } from "../types/graph";
import {
	buildEdges,
	buildTopicIndex,
	calculateStats,
	toPostNode,
} from "./graph-utils";

const GRAPH_CACHE_PATH = resolve(process.cwd(), ".astro/graph-cache.json");

let memoryCache: KnowledgeGraph | null = null;

type LoadOptions = {
	forceRebuild?: boolean;
	entries?: CollectionEntry<"blog">[];
	skipCacheWrite?: boolean;
};

type GraphCachePayload = {
	graph: KnowledgeGraph;
	hash?: string;
};

export async function loadKnowledgeGraph(
	options: LoadOptions = {},
): Promise<KnowledgeGraph> {
	const { forceRebuild = false, entries, skipCacheWrite = false } = options;

	// The disk cache is only an output for the integration's astro:build:done
	// hook. Reading it here would serve a graph from an earlier build, so a new
	// post would render without related posts and never appear in the graph.
	if (memoryCache && !forceRebuild) {
		return memoryCache;
	}

	const posts =
		entries ??
		(await (async () => {
			const { getCollection } = await import("astro:content");
			return getCollection("blog");
		})());
	const graph = buildGraph(posts);

	if (!skipCacheWrite) {
		await writeGraphCache({ graph });
	}

	memoryCache = graph;
	return graph;
}

export function buildGraphFromEntries(
	entries: Array<CollectionEntry<"blog">>,
): KnowledgeGraph {
	return buildGraph(entries);
}

export async function writeGraphCache(
	payload: GraphCachePayload,
): Promise<void> {
	const cacheDir = dirname(GRAPH_CACHE_PATH);
	await mkdir(cacheDir, { recursive: true });
	await writeFile(GRAPH_CACHE_PATH, JSON.stringify(payload, null, 2), "utf-8");
}

function buildGraph(entries: Array<CollectionEntry<"blog">>): KnowledgeGraph {
	const nodes = entries.map(toPostNode);
	const edges = buildEdges(nodes);
	const topics = buildTopicIndex(nodes);
	const graphBase: Omit<KnowledgeGraph, "stats"> = {
		posts: nodes,
		edges,
		topics,
		generatedAt: new Date().toISOString(),
		version: 1,
	};

	return {
		...graphBase,
		stats: calculateStats(graphBase),
	};
}
