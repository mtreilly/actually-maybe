import type { AstroIntegration } from 'astro';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unflatten } from 'devalue';
import type { CollectionEntry } from 'astro:content';
import {
	buildEdges,
	buildTopicIndex,
	calculateStats,
	toPostNode,
} from '../lib/graph-utils';
import type { KnowledgeGraph } from '../types/graph';

export default function knowledgeGraphIntegration(): AstroIntegration {
	let cachedGraph: KnowledgeGraph | null = null;

	return {
		name: 'knowledge-graph',
		hooks: {
			'astro:build:setup': async ({ logger }) => {
				if (cachedGraph) {
					return;
				}

				logger.info('📊 Preparing knowledge graph data...');

				try {
					const posts = await loadBlogPosts();
					logger.info(`Found ${posts.length} posts for graph generation`);

					const nodes = posts.map(toPostNode);
					const edges = buildEdges(nodes);
					logger.info(`Generated ${edges.length} connections`);

					const topics = buildTopicIndex(nodes);
					logger.info(`Indexed ${Object.keys(topics).length} topics`);

					const graphBase: Omit<KnowledgeGraph, 'stats'> = {
						posts: nodes,
						edges,
						topics,
						generatedAt: new Date().toISOString(),
						version: 1,
					};

					cachedGraph = {
						...graphBase,
						stats: calculateStats(graphBase),
					};
				} catch (error) {
					logger.error(`❌ Failed to assemble knowledge graph data: ${error}`);
					throw error;
				}
			},
			'astro:build:done': async ({ dir, logger }) => {
				if (!cachedGraph) {
					logger.warn('⚠️ Knowledge graph data unavailable; skipping graph.json output.');
					return;
				}

				try {
					const outputDir = join(dir.pathname, 'data');
					mkdirSync(outputDir, { recursive: true });

					const outputPath = join(outputDir, 'graph.json');
					writeFileSync(outputPath, JSON.stringify(cachedGraph, null, 2), 'utf-8');

					logger.info(`✅ Knowledge graph saved to ${outputPath}`);
					logger.info(
						`   Posts: ${cachedGraph.stats.totalPosts}, Connections: ${cachedGraph.stats.totalEdges}, Avg/post: ${cachedGraph.stats.avgConnectionsPerPost}`,
					);
				} catch (error) {
					logger.error(`❌ Failed to generate knowledge graph: ${error}`);
					throw error;
				} finally {
					cachedGraph = null;
				}
			},
		},
	};
}

async function loadBlogPosts(): Promise<Array<CollectionEntry<'blog'>>> {
	const dataStoreUrl = new URL('../../.astro/data-store.json', import.meta.url);
	try {
		const raw = await readFile(dataStoreUrl, 'utf-8');
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
		const filePath = fileURLToPath(dataStoreUrl);
		throw new Error(`Unable to read content data from ${filePath}: ${error}`);
	}
}

interface StoredEntry {
	id: string;
	slug?: string;
	body?: string;
	data: CollectionEntry<'blog'>['data'];
}
