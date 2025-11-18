import type { CollectionEntry } from 'astro:content';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { KnowledgeGraph } from '../types/graph';
import {
	buildEdges,
	buildTopicIndex,
	calculateStats,
	toPostNode,
} from './graph-utils';

const GRAPH_CACHE_PATH = resolve(process.cwd(), '.astro/graph-cache.json');

let memoryCache: KnowledgeGraph | null = null;

type LoadOptions = {
	forceRebuild?: boolean;
	entries?: CollectionEntry<'blog'>[];
	skipCacheWrite?: boolean;
};

type GraphCachePayload = {
	graph: KnowledgeGraph;
	hash?: string;
};

export async function loadKnowledgeGraph(options: LoadOptions = {}): Promise<KnowledgeGraph> {
	const { forceRebuild = false, entries, skipCacheWrite = false } = options;

	if (memoryCache && !forceRebuild) {
		return memoryCache;
	}

	if (!forceRebuild) {
		const cached = await readGraphCache();
		if (cached) {
			memoryCache = cached.graph;
			return cached.graph;
		}
	}

	const posts =
		entries ??
		(await (async () => {
			const { getCollection } = await import('astro:content');
			return getCollection('blog');
		})());
	const graph = buildGraph(posts);

	if (!skipCacheWrite) {
		await writeGraphCache({ graph });
	}

	memoryCache = graph;
	return graph;
}

export function buildGraphFromEntries(entries: Array<CollectionEntry<'blog'>>): KnowledgeGraph {
	return buildGraph(entries);
}

async function readGraphCache(): Promise<GraphCachePayload | null> {
	try {
		const raw = await readFile(GRAPH_CACHE_PATH, 'utf-8');
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && 'graph' in parsed) {
			return parsed as GraphCachePayload;
		}
		return { graph: parsed as KnowledgeGraph };
	} catch {
		return null;
	}
}

export async function writeGraphCache(payload: GraphCachePayload): Promise<void> {
	const cacheDir = dirname(GRAPH_CACHE_PATH);
	await mkdir(cacheDir, { recursive: true });
	await writeFile(GRAPH_CACHE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

function buildGraph(entries: Array<CollectionEntry<'blog'>>): KnowledgeGraph {
	const nodes = entries.map(toPostNode);
	const edges = buildEdges(nodes);
	const topics = buildTopicIndex(nodes);
	const graphBase: Omit<KnowledgeGraph, 'stats'> = {
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
