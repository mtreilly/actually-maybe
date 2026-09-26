import { compareText } from "../i18n/format";
import type { KnowledgeGraph, PostNode } from "../types/graph";

type GraphView = {
	topicGroups: { topic: string; posts: PostNode[]; count: number }[];
	mostConnectedPosts: { post: PostNode; count: number }[];
};

/** Shared selections for the graph page's HTML and Markdown presentations. */
export function buildGraphView(graph: KnowledgeGraph): GraphView {
	const postsById = new Map<string, PostNode>(
		graph.posts.map((post) => [post.id, post]),
	);

	const topicGroups = Object.entries(graph.topics)
		.map(([topic, postIds]) => {
			const posts = postIds
				.map((id) => postsById.get(id))
				.filter((post): post is PostNode => Boolean(post));
			return { topic, posts, count: posts.length };
		})
		.filter((group) => group.count > 0)
		.sort((a, b) => {
			if (b.count !== a.count) return b.count - a.count;
			return compareText(a.topic, b.topic);
		});

	const connectionCounts = new Map<string, number>();
	graph.edges.forEach((edge) => {
		connectionCounts.set(
			edge.source,
			(connectionCounts.get(edge.source) ?? 0) + 1,
		);
		connectionCounts.set(
			edge.target,
			(connectionCounts.get(edge.target) ?? 0) + 1,
		);
	});

	const mostConnectedPosts =
		graph.posts.length > 0
			? Array.from(connectionCounts.entries())
					.map(([id, count]) => {
						const post = postsById.get(id);
						if (!post) return null;
						return { post, count };
					})
					.filter((entry): entry is { post: PostNode; count: number } =>
						Boolean(entry),
					)
					.sort((a, b) => {
						if (b.count !== a.count) return b.count - a.count;
						return (
							new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
						);
					})
					.slice(0, 8)
			: [];

	return { topicGroups, mostConnectedPosts };
}
