import type { AstroIntegration } from 'astro';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { KnowledgeGraph } from '../types/graph';
import { loadKnowledgeGraph } from '../lib/knowledge-graph-loader';
import { findUnlinkedMentions } from '../lib/mention-detector';

export default function knowledgeGraphIntegration(): AstroIntegration {
	let graphData: KnowledgeGraph | null = null;

	return {
		name: 'knowledge-graph',
		hooks: {
			'astro:build:setup': async ({ logger }) => {
				logger.info('📊 Preparing knowledge graph data...');

				try {
					graphData = await loadKnowledgeGraph(true);
					logger.info(`Found ${graphData.posts.length} posts for graph generation`);
					logger.info(`Generated ${graphData.edges.length} connections`);
					logger.info(`Indexed ${Object.keys(graphData.topics).length} topics`);

					const mentions = findUnlinkedMentions(graphData.posts);
					logger.info(`🔍 Found ${mentions.length} potential unlinked mentions`);

					const suggestionsPath = join(process.cwd(), 'docs', 'graph-suggestions.json');
					mkdirSync(dirname(suggestionsPath), { recursive: true });
					writeFileSync(suggestionsPath, JSON.stringify(mentions, null, 2), 'utf-8');
					logger.info(`💡 Suggestions saved to ${suggestionsPath}`);
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
