import { SITE_TITLE } from "../consts";
import { ui } from "../i18n/ui";
import { buildGraphView } from "../lib/graph-view";
import type { KnowledgeGraph, PostNode } from "../types/graph";
import { serializeMarkdownDoc } from "./markdownExport";

export function buildGraphMarkdown(
	graph: KnowledgeGraph,
	origin: string,
): string {
	const { topicGroups, mostConnectedPosts } = buildGraphView(graph);
	const postLink = (post: PostNode): string =>
		`[${post.title}](${new URL(`/blog/${post.slug}/`, origin)})`;
	const connected = mostConnectedPosts
		.map(
			({ post, count }) =>
				`- ${postLink(post)}: ${ui.collections.connectionCount(count)}`,
		)
		.join("\n");
	const topics = topicGroups
		.map(
			(group) =>
				`### ${group.topic}\n${ui.collections.postCount(group.count)}\n\n${group.posts.map((post) => `- ${postLink(post)}`).join("\n")}`,
		)
		.join("\n\n");
	return serializeMarkdownDoc({
		title: `${ui.graph.title} | ${SITE_TITLE}`,
		description: ui.graph.description,
		canonicalUrl: new URL("/graph/", origin).toString(),
		body: `# ${ui.graph.title}
${ui.graph.description}

- ${ui.graph.postsLabel}: ${graph.stats.totalPosts}
- ${ui.graph.connectionsLabel}: ${graph.stats.totalEdges}
- ${ui.graph.topicsLabel}: ${graph.stats.totalTopics}
- ${ui.graph.averageLabel}: ${graph.stats.avgConnectionsPerPost}

[${ui.graph.dataLink}](${new URL("/data/graph.json", origin)})

## ${ui.graph.mostConnected}
${connected || ui.graph.emptyConnections}

## ${ui.graph.topics}
${topics}
`,
	});
}
