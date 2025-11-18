import type { CollectionEntry } from 'astro:content';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { unflatten } from 'devalue';
import type { KnowledgeGraph } from '../types/graph';
import {
	buildEdges,
	buildTopicIndex,
	calculateStats,
	toPostNode,
} from './graph-utils';

const DATA_STORE_PATH = resolve(process.cwd(), '.astro/data-store.json');
const GRAPH_CACHE_PATH = resolve(process.cwd(), '.astro/graph-cache.json');

let memoryCache: KnowledgeGraph | null = null;

export async function loadKnowledgeGraph(forceRebuild = false): Promise<KnowledgeGraph> {
	if (memoryCache && !forceRebuild) {
		return memoryCache;
	}

	if (!forceRebuild) {
		const cached = await readGraphCache();
		if (cached) {
			memoryCache = cached;
			return cached;
		}
	}

	const entries = await loadBlogEntriesFromDataStore();
	const graph = buildGraph(entries);
	await writeGraphCache(graph);
	memoryCache = graph;
	return graph;
}

async function readGraphCache(): Promise<KnowledgeGraph | null> {
	try {
		const raw = await readFile(GRAPH_CACHE_PATH, 'utf-8');
		return JSON.parse(raw) as KnowledgeGraph;
	} catch {
		return null;
	}
}

async function writeGraphCache(graph: KnowledgeGraph): Promise<void> {
	const cacheDir = dirname(GRAPH_CACHE_PATH);
	await mkdir(cacheDir, { recursive: true });
	await writeFile(GRAPH_CACHE_PATH, JSON.stringify(graph, null, 2), 'utf-8');
}

async function loadBlogEntriesFromDataStore(): Promise<Array<CollectionEntry<'blog'>>> {
	try {
		const raw = await readFile(DATA_STORE_PATH, 'utf-8');
		const flattened = JSON.parse(raw);
		const store = unflatten(flattened) as Map<string, Map<string, StoredEntry>>;
		const blogEntries = store.get('blog');
		if (!blogEntries) {
			return [];
		}

		return Array.from(blogEntries.values()).map((entry) => ({
			id: entry.id,
			slug: entry.slug ?? entry.id,
			collection: 'blog',
			body: entry.body ?? '',
			data: entry.data,
		})) as Array<CollectionEntry<'blog'>>;
	} catch (error) {
		throw new Error(`Unable to read blog entries from ${DATA_STORE_PATH}: ${error}`);
	}
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

interface StoredEntry {
	id: string;
	slug?: string;
	body?: string;
	data: CollectionEntry<'blog'>['data'];
}
