import type { CollectionEntry } from 'astro:content';
import type {
  GraphEdge,
  GraphStats,
  KnowledgeGraph,
  PostNode,
} from '../types/graph';

/**
 * Convert an Astro collection entry into a PostNode for the graph.
 */
export function toPostNode(post: CollectionEntry<'blog'>): PostNode {
  const slug = (post as CollectionEntry<'blog'> & { slug?: string }).slug ?? post.id;

  return {
    id: post.id,
    slug,
    title: post.data.title,
    date: post.data.pubDate.toISOString(),
    topics: post.data.topics ?? [],
    type: post.data.type,
    wordCount: estimateWordCount(post.body ?? ''),
    excerpt: post.data.description,
  };
}

/**
 * Estimate word count using simple whitespace splitting.
 */
function estimateWordCount(content: string): number {
  return content
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .length;
}

/**
 * Intersection of topics shared by both posts.
 */
export function findSharedTopics(post1: PostNode, post2: PostNode): string[] {
  const seen = new Set(post2.topics);
  return post1.topics.filter((topic) => seen.has(topic));
}

/**
 * Calculate connection strength between two posts (0-1).
 */
export function calculateEdgeWeight(
  post1: PostNode,
  post2: PostNode,
  sharedTopics: string[],
): number {
  const topicDenominator = Math.max(
    post1.topics.length,
    post2.topics.length,
    1,
  );
  const topicScore = sharedTopics.length / topicDenominator;

  const daysDiff =
    Math.abs(
      new Date(post1.date).getTime() - new Date(post2.date).getTime(),
    ) /
    (1000 * 60 * 60 * 24);
  const proximityScore = Math.max(0, 1 - daysDiff / 365);

  return Math.min(1, topicScore * 0.7 + proximityScore * 0.3);
}

/**
 * Build undirected edges between posts that share at least one topic.
 */
export function buildEdges(posts: PostNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (let i = 0; i < posts.length; i += 1) {
    for (let j = i + 1; j < posts.length; j += 1) {
      const post1 = posts[i];
      const post2 = posts[j];
      const sharedTopics = findSharedTopics(post1, post2);

      if (sharedTopics.length === 0) {
        continue;
      }

      edges.push({
        source: post1.id,
        target: post2.id,
        type: 'shared_topic',
        weight: calculateEdgeWeight(post1, post2, sharedTopics),
        sharedTopics,
        label: `Shared: ${sharedTopics.join(', ')}`,
      });
    }
  }

  return edges;
}

/**
 * Build an index of topic → post IDs.
 */
export function buildTopicIndex(posts: PostNode[]): Record<string, string[]> {
  return posts.reduce<Record<string, string[]>>((acc, post) => {
    post.topics.forEach((topic) => {
      if (!acc[topic]) {
        acc[topic] = [];
      }

      acc[topic].push(post.id);
    });

    return acc;
  }, {});
}

/**
 * Calculate useful stats for the generated graph.
 */
export function calculateStats(
  graph: Omit<KnowledgeGraph, 'stats'>,
): GraphStats {
  const connectionCounts = new Map<string, number>();

  graph.edges.forEach((edge) => {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) ?? 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) ?? 0) + 1);
  });

  const totalConnections = Array.from(connectionCounts.values()).reduce(
    (total, count) => total + count,
    0,
  );
  const avgConnections =
    graph.posts.length > 0 ? totalConnections / graph.posts.length : 0;

  const mostConnected = Array.from(connectionCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return {
    totalPosts: graph.posts.length,
    totalEdges: graph.edges.length,
    totalTopics: Object.keys(graph.topics).length,
    avgConnectionsPerPost: Math.round(avgConnections * 10) / 10,
    mostConnectedPost: mostConnected?.[0],
  };
}
