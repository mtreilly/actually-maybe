export interface PostNode {
  id: string;
  slug: string;
  title: string;
  date: string;
  topics: string[];
  type: 'note' | 'essay' | 'guide' | 'link';
  wordCount?: number;
  excerpt?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  sharedTopics?: string[];
  label?: string;
}

export type EdgeType =
  | 'shared_topic'
  | 'mentions_topic'
  | 'same_series';

export interface KnowledgeGraph {
  posts: PostNode[];
  edges: GraphEdge[];
  topics: Record<string, string[]>;
  generatedAt: string;
  version: number;
  stats: GraphStats;
}

export interface GraphStats {
  totalPosts: number;
  totalEdges: number;
  totalTopics: number;
  avgConnectionsPerPost: number;
  mostConnectedPost?: string;
}

export interface UnlinkedMention {
  sourcePostId: string;
  targetPostId: string;
  topic: string;
  confidence: number;
  snippet?: string;
}
