import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { AstroIntegration } from "astro";
import { findUnlinkedMentions } from "../lib/mention-detector";
import type { KnowledgeGraph } from "../types/graph";

export default function knowledgeGraphIntegration(): AstroIntegration {
	return {
		name: "knowledge-graph",
		hooks: {
			"astro:build:done": async ({ dir, logger }) => {
				// The endpoint owns graph JSON. Derive editorial suggestions from that
				// completed snapshot, never from an earlier build or Astro internals.
				const graph = JSON.parse(
					await readFile(new URL("data/graph.json", dir), "utf8"),
				) as KnowledgeGraph;
				const mentions = findUnlinkedMentions(graph.posts);
				const suggestionsPath = resolve("docs/graph-suggestions.json");
				await mkdir(dirname(suggestionsPath), { recursive: true });
				await writeFile(
					suggestionsPath,
					`${JSON.stringify(mentions, null, 2)}\n`,
					"utf8",
				);
				logger.info(
					`Graph: ${graph.posts.length} posts, ${graph.edges.length} connections; ${mentions.length} editorial suggestions refreshed.`,
				);
			},
		},
	};
}
