import type { AstroIntegration } from 'astro';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import type { KnowledgeGraph } from '../types/graph';
import { loadKnowledgeGraph, writeGraphCache } from '../lib/knowledge-graph-loader';
import { findUnlinkedMentions } from '../lib/mention-detector';

export default function knowledgeGraphIntegration(): AstroIntegration {
	let graphData: KnowledgeGraph | null = null;

	return {
		name: 'knowledge-graph',
		hooks: {
			'astro:build:setup': async ({ logger }) => {
				logger.info('📊 Preparing knowledge graph data...');
				const startTime = Date.now();

				try {
					const dataStorePath = resolve(process.cwd(), '.astro/data-store.json');
					let contentHash: string | null = null;
					try {
						const dataStoreContents = readFileSync(dataStorePath, 'utf-8');
						contentHash = createHash('sha256').update(dataStoreContents).digest('hex');
					} catch (error) {
						logger.warn(`⚠️ Unable to hash data store: ${error}`);
					}

					if (contentHash) {
						const cachePath = resolve(process.cwd(), '.astro/graph-cache.json');
						try {
							const cachedRaw = readFileSync(cachePath, 'utf-8');
							const cached = JSON.parse(cachedRaw);
							if (cached?.hash === contentHash && cached.graph) {
								graphData = cached.graph as KnowledgeGraph;
								logger.info('📊 Knowledge graph unchanged, using cache');
							}
						} catch {
							// cache miss ignored
						}
					}

					if (!graphData) {
						graphData = await loadKnowledgeGraph(true);
						if (contentHash) {
							await writeGraphCache({ graph: graphData, hash: contentHash });
						}
					}

					logger.info(`Found ${graphData.posts.length} posts for graph generation`);
					logger.info(`Generated ${graphData.edges.length} connections`);
					logger.info(`Indexed ${Object.keys(graphData.topics).length} topics`);

					const mentions = findUnlinkedMentions(graphData.posts);
					logger.info(`🔍 Found ${mentions.length} potential unlinked mentions`);

					const suggestionsPath = join(process.cwd(), 'docs', 'graph-suggestions.json');
					mkdirSync(dirname(suggestionsPath), { recursive: true });
					writeFileSync(suggestionsPath, JSON.stringify(mentions, null, 2), 'utf-8');
					logger.info(`💡 Suggestions saved to ${suggestionsPath}`);

					const duration = Date.now() - startTime;
					logger.info(`⏱️ Knowledge graph prepared in ${duration}ms`);
				} catch (error) {
					logger.error(`❌ Failed to assemble knowledge graph data: ${error}`);
					throw error;
				}
			},
			'astro:build:done': async ({ dir, logger }) => {
				if (!graphData) {
					logger.warn('⚠️ Knowledge graph data unavailable; skipping graph.json output.');
					return;
				}

				try {
					const outputDir = join(dir.pathname, 'data');
					mkdirSync(outputDir, { recursive: true });

					const outputPath = join(outputDir, 'graph.json');
					writeFileSync(outputPath, JSON.stringify(graphData, null, 2), 'utf-8');

					logger.info(`✅ Knowledge graph saved to ${outputPath}`);
					logger.info(
						`   Posts: ${graphData.stats.totalPosts}, Connections: ${graphData.stats.totalEdges}, Avg/post: ${graphData.stats.avgConnectionsPerPost}`,
					);
				} catch (error) {
					logger.error(`❌ Failed to generate knowledge graph: ${error}`);
					throw error;
				} finally {
					graphData = null;
				}
			},
		},
	};
}
