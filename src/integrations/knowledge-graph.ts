import type { CollectionEntry } from "astro:content";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { AstroIntegration } from "astro";
import { unflatten } from "devalue";
import {
	buildGraphFromEntries,
	writeGraphCache,
} from "../lib/knowledge-graph-loader";
import { findUnlinkedMentions } from "../lib/mention-detector";
import { isPublishedPost } from "../lib/published-posts";
import type { KnowledgeGraph } from "../types/graph";

export default function knowledgeGraphIntegration(): AstroIntegration {
	let graphData: KnowledgeGraph | null = null;

	return {
		name: "knowledge-graph",
		hooks: {
			"astro:build:setup": async ({ logger }) => {
				logger.info("📊 Preparing knowledge graph data...");
				const startTime = Date.now();

				try {
					let posts: CollectionEntry<"blog">[] = [];
					let contentHash: string;
					const dataStorePath = resolve(
						process.cwd(),
						".astro/data-store.json",
					);

					try {
						const dataStoreRaw = readFileSync(dataStorePath, "utf-8");
						posts = parseBlogEntries(JSON.parse(dataStoreRaw)).filter(
							isPublishedPost,
						);
						contentHash = createHash("sha256")
							.update(dataStoreRaw)
							.digest("hex");
					} catch {
						// Astro only writes .astro/data-store.json in some situations, and
						// never on a clean build, so this is a fast path rather than a
						// requirement. astro:build:done picks the graph up from the cache
						// that src/pages/data/graph.json.ts writes while rendering.
						logger.info(
							"Data store not present; deferring to the build-time graph cache",
						);
						return;
					}

					const cachePath = resolve(process.cwd(), ".astro/graph-cache.json");
					try {
						const cachedRaw = readFileSync(cachePath, "utf-8");
						const cached = JSON.parse(cachedRaw);
						if (cached?.hash === contentHash && cached.graph) {
							graphData = cached.graph as KnowledgeGraph;
							logger.info("📊 Knowledge graph unchanged, using cache");
						}
					} catch {
						// cache miss ignored
					}

					if (!graphData) {
						graphData = buildGraphFromEntries(posts);
						await writeGraphCache({ graph: graphData, hash: contentHash });
					}

					logger.info(
						`Found ${graphData.posts.length} posts for graph generation`,
					);
					logger.info(`Generated ${graphData.edges.length} connections`);
					logger.info(`Indexed ${Object.keys(graphData.topics).length} topics`);

					const mentions = findUnlinkedMentions(graphData.posts);
					logger.info(
						`🔍 Found ${mentions.length} potential unlinked mentions`,
					);

					const suggestionsPath = join(
						process.cwd(),
						"docs",
						"graph-suggestions.json",
					);
					mkdirSync(dirname(suggestionsPath), { recursive: true });
					writeFileSync(
						suggestionsPath,
						JSON.stringify(mentions, null, 2),
						"utf-8",
					);
					logger.info(`💡 Suggestions saved to ${suggestionsPath}`);

					const duration = Date.now() - startTime;
					logger.info(`⏱️ Knowledge graph prepared in ${duration}ms`);
				} catch (error) {
					logger.error(`❌ Failed to assemble knowledge graph data: ${error}`);
					throw error;
				}
			},
			"astro:build:done": async ({ dir, logger }) => {
				if (!graphData) {
					// src/pages/data/graph.json.ts builds the graph from the content
					// collection while rendering and caches it, so by now it exists even
					// when astro:build:setup had nothing to read.
					graphData = readGraphCacheSync();
				}

				if (!graphData) {
					logger.warn(
						"⚠️ Knowledge graph data unavailable; skipping graph.json output.",
					);
					return;
				}

				try {
					const outputDir = join(dir.pathname, "data");
					mkdirSync(outputDir, { recursive: true });

					const outputPath = join(outputDir, "graph.json");
					writeFileSync(
						outputPath,
						JSON.stringify(graphData, null, 2),
						"utf-8",
					);

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

/**
 * Reads the graph cache written during this build. Sync because integration
 * hooks run after Astro has finished rendering and there is nothing to await.
 */
function readGraphCacheSync(): KnowledgeGraph | null {
	try {
		const cachePath = resolve(process.cwd(), ".astro/graph-cache.json");
		const cached = JSON.parse(readFileSync(cachePath, "utf-8"));
		return (cached?.graph as KnowledgeGraph) ?? null;
	} catch {
		return null;
	}
}

function parseBlogEntries(flattened: unknown): Array<CollectionEntry<"blog">> {
	const store = unflatten(flattened) as Map<string, Map<string, StoredEntry>>;
	const blogEntries = store.get("blog");
	if (!blogEntries) {
		return [];
	}

	return Array.from(blogEntries.values()).map((entry) => ({
		id: entry.id,
		slug: entry.slug ?? entry.id,
		collection: "blog",
		body: entry.body ?? "",
		data: entry.data,
	}));
}

interface StoredEntry {
	id: string;
	slug?: string;
	body?: string;
	data: CollectionEntry<"blog">["data"];
}
