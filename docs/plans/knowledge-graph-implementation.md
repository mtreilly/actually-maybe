# Knowledge Graph Implementation Plan

**Feature**: Build-time knowledge graph with backlinks and cross-references
**Complexity**: Medium (2-3 weeks)
**Status**: Planning
**Started**: 2025-11-18

---

## Goals

1. Surface connections between posts without manual linking
2. Generate backlinks automatically at build time
3. Zero runtime JavaScript overhead for core reading
4. Optional interactive `/graph` visualization page
5. Provide edit-time suggestions for unlinked mentions

---

## Success Criteria

- [ ] Every post displays 2-5 related posts in footer
- [ ] Backlinks update automatically on every build
- [ ] `/graph` page shows all post connections
- [ ] No performance regression (build time <3s added)
- [ ] Accessible without JavaScript (progressive enhancement)
- [ ] Graph data available as JSON endpoint for LLMs

---

## Architecture Overview

```
┌─────────────┐
│  MDX Posts  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  Astro Build Hook    │
│  (astro:build:done)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Parse Posts AST     │
│  Extract Entities    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Build Graph Data    │
│  Detect Connections  │
└──────┬───────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ graph.json   │  │ Inject HTML  │
│ (static)     │  │ (backlinks)  │
└──────────────┘  └──────────────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ /graph page  │  │ Post pages   │
│ (optional)   │  │ (w/footer)   │
└──────────────┘  └──────────────┘
```

---

## Phase 1: Foundation (Days 1-3)

### Objective
Set up basic graph data extraction and storage infrastructure.

### Tasks

#### 1.1 Create Type Definitions

**File**: `src/types/graph.ts`

```typescript
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
  source: string;      // post ID
  target: string;      // post ID
  type: EdgeType;
  weight: number;      // 0-1, confidence score
  sharedTopics?: string[];
  label?: string;
}

export type EdgeType =
  | 'shared_topic'     // Both posts have same topic in frontmatter
  | 'mentions_topic'   // Post A mentions topic, Post B is about topic
  | 'same_series';     // Part of same series

export interface KnowledgeGraph {
  posts: PostNode[];
  edges: GraphEdge[];
  topics: Record<string, string[]>;  // topic → [post IDs]
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
  confidence: number;  // 0-1
  snippet?: string;
}
```

_Status: Completed 2025-11-18 — type definitions added in `src/types/graph.ts`._

**Test**: `pnpm tsc --noEmit` (no errors)

_Note: As of 2025-11-18 this command fails because of pre-existing type errors in `astro.config.mjs` and `src/scripts/headingAnchors.ts`; type definitions compile without issues._

---

#### 1.2 Create Graph Utilities

**File**: `src/lib/graph-utils.ts`

```typescript
import type { CollectionEntry } from 'astro:content';
import type { PostNode, GraphEdge, KnowledgeGraph } from '../types/graph';

/**
 * Convert Astro content collection entry to PostNode
 */
export function toPostNode(post: CollectionEntry<'blog'>): PostNode {
  return {
    id: post.id,
    slug: post.slug,
    title: post.data.title,
    date: post.data.pubDate.toISOString(),
    topics: post.data.topics || [],
    type: post.data.type,
    wordCount: estimateWordCount(post.body),
    excerpt: post.data.description
  };
}

/**
 * Estimate word count from markdown content
 */
function estimateWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Find shared topics between two posts
 */
export function findSharedTopics(post1: PostNode, post2: PostNode): string[] {
  return post1.topics.filter(topic => post2.topics.includes(topic));
}

/**
 * Calculate edge weight based on connection strength
 */
export function calculateEdgeWeight(
  post1: PostNode,
  post2: PostNode,
  sharedTopics: string[]
): number {
  // Simple scoring: more shared topics = stronger connection
  const topicScore = sharedTopics.length / Math.max(post1.topics.length, post2.topics.length);

  // Bonus: same series
  const seriesBonus = 0; // TODO: implement series detection

  // Date proximity bonus (recent posts more likely related)
  const daysDiff = Math.abs(
    new Date(post1.date).getTime() - new Date(post2.date).getTime()
  ) / (1000 * 60 * 60 * 24);
  const proximityScore = Math.max(0, 1 - daysDiff / 365); // Decay over 1 year

  return Math.min(1, topicScore * 0.7 + proximityScore * 0.3);
}

/**
 * Build edges between all posts
 */
export function buildEdges(posts: PostNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const post1 = posts[i];
      const post2 = posts[j];

      const sharedTopics = findSharedTopics(post1, post2);

      if (sharedTopics.length > 0) {
        const weight = calculateEdgeWeight(post1, post2, sharedTopics);

        edges.push({
          source: post1.id,
          target: post2.id,
          type: 'shared_topic',
          weight,
          sharedTopics,
          label: `Shared: ${sharedTopics.join(', ')}`
        });
      }
    }
  }

  return edges;
}

/**
 * Group posts by topic
 */
export function buildTopicIndex(posts: PostNode[]): Record<string, string[]> {
  const topics: Record<string, string[]> = {};

  posts.forEach(post => {
    post.topics.forEach(topic => {
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(post.id);
    });
  });

  return topics;
}

/**
 * Calculate graph statistics
 */
export function calculateStats(graph: Omit<KnowledgeGraph, 'stats'>): GraphStats {
  const connectionCounts = new Map<string, number>();

  graph.edges.forEach(edge => {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
  });

  const avgConnections = graph.posts.length > 0
    ? Array.from(connectionCounts.values()).reduce((a, b) => a + b, 0) / graph.posts.length
    : 0;

  const mostConnected = Array.from(connectionCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];

  return {
    totalPosts: graph.posts.length,
    totalEdges: graph.edges.length,
    totalTopics: Object.keys(graph.topics).length,
    avgConnectionsPerPost: Math.round(avgConnections * 10) / 10,
    mostConnectedPost: mostConnected?.[0]
  };
}
```

_Status: Completed 2025-11-18 — utilities implemented in `src/lib/graph-utils.ts`._

**Test**: `pnpm tsx src/lib/__tests__/graph-utils.test.ts`

---

#### 1.3 Create Astro Integration

**File**: `src/integrations/knowledge-graph.ts`

```typescript
import type { AstroIntegration } from 'astro';
import { getCollection } from 'astro:content';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  toPostNode,
  buildEdges,
  buildTopicIndex,
  calculateStats
} from '../lib/graph-utils';
import type { KnowledgeGraph } from '../types/graph';

export default function knowledgeGraphIntegration(): AstroIntegration {
  return {
    name: 'knowledge-graph',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        logger.info('📊 Generating knowledge graph...');

        try {
          // Load all blog posts
          const posts = await getCollection('blog');
          logger.info(`Found ${posts.length} posts`);

          // Convert to graph nodes
          const nodes = posts.map(toPostNode);

          // Build edges (connections)
          const edges = buildEdges(nodes);
          logger.info(`Generated ${edges.length} connections`);

          // Build topic index
          const topics = buildTopicIndex(nodes);
          logger.info(`Indexed ${Object.keys(topics).length} topics`);

          // Create graph object
          const graphData: Omit<KnowledgeGraph, 'stats'> = {
            posts: nodes,
            edges,
            topics,
            generatedAt: new Date().toISOString(),
            version: 1
          };

          // Calculate stats
          const graph: KnowledgeGraph = {
            ...graphData,
            stats: calculateStats(graphData)
          };

          // Ensure output directory exists
          const outputDir = join(dir.pathname, 'data');
          mkdirSync(outputDir, { recursive: true });

          // Write graph.json
          const outputPath = join(outputDir, 'graph.json');
          writeFileSync(outputPath, JSON.stringify(graph, null, 2));

          logger.info(`✅ Knowledge graph saved to ${outputPath}`);
          logger.info(`   Posts: ${graph.stats.totalPosts}`);
          logger.info(`   Connections: ${graph.stats.totalEdges}`);
          logger.info(`   Avg connections/post: ${graph.stats.avgConnectionsPerPost}`);

        } catch (error) {
          logger.error(`❌ Failed to generate knowledge graph: ${error}`);
          throw error;
        }
      }
    }
  };
}
```

_Status: Completed 2025-11-18 — integration reads `.astro/data-store.json`, builds the graph during `astro:build:setup`, and writes `dist/data/graph.json`._

**Test**: `pnpm build && ls dist/data/graph.json`

_Note: `astro:content` isn't available directly inside integrations, so the implementation pulls entries from the generated `.astro/data-store.json` using `devalue.unflatten`._

---

#### 1.4 Register Integration

**File**: `astro.config.ts` (modify)

```typescript
import { defineConfig } from 'astro/config';
import knowledgeGraph from './src/integrations/knowledge-graph';

export default defineConfig({
  // ... existing config
  integrations: [
    // ... existing integrations
    knowledgeGraph()
  ]
});
```

**Test**: `pnpm build` → should see graph generation logs

---

### Phase 1 Checkpoint

✅ **Deliverables**:
- Type definitions for graph data structure
- Utilities for building graph from posts
- Astro integration that runs at build time
- `dist/data/graph.json` generated successfully

✅ **Tests**:
```bash
pnpm build
ls dist/data/graph.json  # should exist
cat dist/data/graph.json | jq '.stats'  # should show stats
```

**Commit**: `feat(graph): add build-time knowledge graph generation`

---

## Phase 2: Backlinks UI (Days 4-6)

### Objective
Display related posts in post footer (zero JS, static HTML).

### Tasks

#### 2.1 Create Backlinks Component

**File**: `src/components/RelatedPosts.astro`

```astro
---
import type { PostNode, GraphEdge } from '../types/graph';

interface Props {
  currentPostId: string;
  graph: KnowledgeGraph;
  maxRelated?: number;
}

const { currentPostId, graph, maxRelated = 5 } = Astro.props;

// Find edges connected to current post
const relatedEdges = graph.edges
  .filter(edge => edge.source === currentPostId || edge.target === currentPostId)
  .sort((a, b) => b.weight - a.weight)
  .slice(0, maxRelated);

// Get related post nodes
const relatedPosts = relatedEdges.map(edge => {
  const relatedId = edge.source === currentPostId ? edge.target : edge.source;
  return {
    post: graph.posts.find(p => p.id === relatedId)!,
    edge
  };
});

if (relatedPosts.length === 0) return null;
---

<aside class="related-posts" aria-labelledby="related-heading">
  <h3 id="related-heading">Also discussed in:</h3>
  <ul role="list">
    {relatedPosts.map(({ post, edge }) => (
      <li>
        <a href={`/blog/${post.slug}`}>
          {post.title}
        </a>
        {edge.sharedTopics && edge.sharedTopics.length > 0 && (
          <span class="shared-topics" aria-label={`Shared topics: ${edge.sharedTopics.join(', ')}`}>
            {edge.sharedTopics.map(topic => (
              <span class="topic-badge">{topic}</span>
            ))}
          </span>
        )}
      </li>
    ))}
  </ul>
</aside>

<style>
  .related-posts {
    margin-top: 3rem;
    padding: 1.5rem;
    border-left: 3px solid var(--accent-primary);
    background: var(--surface-secondary);
    border-radius: 0 0.5rem 0.5rem 0;
  }

  .related-posts h3 {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.8;
    font-weight: 600;
  }

  .related-posts ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .related-posts li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .related-posts li:last-child {
    border-bottom: none;
  }

  .related-posts a {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 500;
    transition: color 0.2s;
  }

  .related-posts a:hover {
    color: var(--accent-primary);
  }

  .shared-topics {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .topic-badge {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    background: var(--accent-primary);
    color: var(--bg-primary);
    border-radius: 0.25rem;
    opacity: 0.8;
  }

  @media (prefers-reduced-motion: reduce) {
    .related-posts a {
      transition: none;
    }
  }
</style>
```

**Test**: Render component with mock data, verify accessibility

---

#### 2.2 Load Graph in Blog Layout

**File**: `src/layouts/BlogPost.astro` (modify)

```astro
---
import type { KnowledgeGraph } from '../types/graph';
import RelatedPosts from '../components/RelatedPosts.astro';
import { readFileSync } from 'fs';
import { join } from 'path';

// ... existing frontmatter

// Load graph data (at build time)
let graph: KnowledgeGraph | null = null;
try {
  const graphPath = join(process.cwd(), 'dist', 'data', 'graph.json');
  const graphJson = readFileSync(graphPath, 'utf-8');
  graph = JSON.parse(graphJson);
} catch (error) {
  console.warn('Graph data not found, skipping related posts');
}

const currentPostId = Astro.props.id || Astro.props.slug;
---

<!-- ... existing layout -->

<article>
  <!-- ... post content -->
</article>

{graph && (
  <RelatedPosts
    currentPostId={currentPostId}
    graph={graph}
    maxRelated={5}
  />
)}

<!-- ... rest of layout -->
```

**Problem**: `dist/data/graph.json` doesn't exist during SSG build of individual posts.

**Solution**: Move graph generation to `astro:build:start` or load from `src/` instead.

---

#### 2.3 Fix Build Order Issue

**Update**: `src/integrations/knowledge-graph.ts`

Change hook from `astro:build:done` to `astro:build:setup`:

```typescript
export default function knowledgeGraphIntegration(): AstroIntegration {
  let graphData: KnowledgeGraph | null = null;

  return {
    name: 'knowledge-graph',
    hooks: {
      // Generate graph BEFORE pages are rendered
      'astro:build:setup': async ({ logger }) => {
        logger.info('📊 Generating knowledge graph...');

        const posts = await getCollection('blog');
        // ... same graph building logic

        graphData = graph;

        // Write to src for access during build
        const srcPath = join(process.cwd(), 'src', 'data', 'graph.json');
        mkdirSync(dirname(srcPath), { recursive: true });
        writeFileSync(srcPath, JSON.stringify(graph, null, 2));
      },

      // Also write to dist for runtime access
      'astro:build:done': async ({ dir }) => {
        if (graphData) {
          const distPath = join(dir.pathname, 'data', 'graph.json');
          mkdirSync(dirname(distPath), { recursive: true });
          writeFileSync(distPath, JSON.stringify(graphData, null, 2));
        }
      }
    }
  };
}
```

**Update**: `src/layouts/BlogPost.astro`

```astro
---
import graphData from '../data/graph.json';
import type { KnowledgeGraph } from '../types/graph';

const graph: KnowledgeGraph = graphData as KnowledgeGraph;
const currentPostId = Astro.props.id;
---
```

**Test**: Build and verify backlinks appear on post pages

---

### Phase 2 Checkpoint

✅ **Deliverables**:
- `RelatedPosts.astro` component styled and accessible
- Graph data loaded in blog layout
- Related posts displayed on every post page
- Zero JavaScript required

✅ **Tests**:
```bash
pnpm build
pnpm preview
# Visit any blog post, verify "Also discussed in:" footer
# Test keyboard nav, light/dark mode, mobile responsive
```

**Commit**: `feat(graph): add related posts backlinks to blog layout`

---

## Phase 3: Graph Visualization (Days 7-10)

### Objective
Create `/graph` page with interactive visualization (optional, JS-enhanced).

### Tasks

#### 3.1 Create Graph Page (Text Fallback)

**File**: `src/pages/graph.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import graphData from '../data/graph.json';
import type { KnowledgeGraph } from '../types/graph';

const graph: KnowledgeGraph = graphData as KnowledgeGraph;

// Group posts by topic for fallback view
const topicGroups = Object.entries(graph.topics)
  .map(([topic, postIds]) => ({
    topic,
    posts: postIds.map(id => graph.posts.find(p => p.id === id)!),
    count: postIds.length
  }))
  .sort((a, b) => b.count - a.count);
---

<BaseLayout
  title="Knowledge Graph"
  description="Explore connections between posts and topics"
>
  <div class="graph-container">
    <header>
      <h1>Knowledge Graph</h1>
      <p>Explore {graph.stats.totalPosts} posts connected by {graph.stats.totalEdges} relationships.</p>

      <div class="graph-stats">
        <div class="stat">
          <span class="stat-value">{graph.stats.totalTopics}</span>
          <span class="stat-label">Topics</span>
        </div>
        <div class="stat">
          <span class="stat-value">{graph.stats.avgConnectionsPerPost}</span>
          <span class="stat-label">Avg Connections</span>
        </div>
      </div>
    </header>

    <!-- Canvas for interactive graph (enhanced with JS) -->
    <div id="graph-viz" role="img" aria-label="Interactive knowledge graph visualization">
      <!-- Fallback: text-based view -->
      <div class="graph-fallback">
        <h2>Topics & Posts</h2>
        <nav aria-label="Posts grouped by topic">
          {topicGroups.map(group => (
            <details class="topic-group">
              <summary>
                <strong>{group.topic}</strong>
                <span class="post-count">{group.count} posts</span>
              </summary>
              <ul>
                {group.posts.map(post => (
                  <li>
                    <a href={`/blog/${post.slug}`}>{post.title}</a>
                    <time datetime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </div>
    </div>
  </div>
</BaseLayout>

<style>
  .graph-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .graph-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  #graph-viz {
    min-height: 600px;
    background: var(--surface-secondary);
    border-radius: 0.5rem;
    padding: 2rem;
  }

  .graph-fallback h2 {
    margin-bottom: 1.5rem;
  }

  .topic-group {
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
  }

  .topic-group summary {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .post-count {
    font-size: 0.875rem;
    opacity: 0.7;
    font-weight: normal;
  }

  .topic-group ul {
    margin-top: 1rem;
    list-style: none;
    padding: 0;
  }

  .topic-group li {
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }

  .topic-group li:last-child {
    border-bottom: none;
  }

  .topic-group a {
    text-decoration: none;
    color: var(--text-primary);
  }

  .topic-group a:hover {
    color: var(--accent-primary);
  }

  .topic-group time {
    font-size: 0.875rem;
    opacity: 0.6;
  }
</style>
```

**Test**: Visit `/graph`, verify fallback view works, accessibility checks

---

#### 3.2 Add Interactive Visualization (Optional)

**File**: `src/components/GraphVisualization.tsx` (React component)

```tsx
import { useEffect, useRef } from 'react';
import type { KnowledgeGraph } from '../types/graph';

interface Props {
  graph: KnowledgeGraph;
}

export default function GraphVisualization({ graph }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamic import to avoid SSR issues
    import('d3').then(d3 => {
      const width = canvasRef.current!.clientWidth;
      const height = 600;

      // Create SVG
      const svg = d3.select(canvasRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('role', 'img')
        .attr('aria-label', 'Interactive force-directed graph');

      // Build D3 force simulation
      const simulation = d3.forceSimulation(graph.posts as any)
        .force('link', d3.forceLink(graph.edges)
          .id((d: any) => d.id)
          .distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

      // Draw edges
      const link = svg.append('g')
        .selectAll('line')
        .data(graph.edges)
        .join('line')
        .attr('stroke', 'var(--border-color)')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', (d: any) => Math.max(1, d.weight * 3));

      // Draw nodes
      const node = svg.append('g')
        .selectAll('circle')
        .data(graph.posts)
        .join('circle')
        .attr('r', 8)
        .attr('fill', 'var(--accent-primary)')
        .attr('stroke', 'var(--bg-primary)')
        .attr('stroke-width', 2)
        .call(drag(simulation) as any);

      // Add labels
      const label = svg.append('g')
        .selectAll('text')
        .data(graph.posts)
        .join('text')
        .text((d: any) => d.title)
        .attr('font-size', 10)
        .attr('dx', 12)
        .attr('dy', 4);

      // Update positions on tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);

        label
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y);
      });

      // Drag behavior
      function drag(simulation: any) {
        function dragstarted(event: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event: any) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      }
    });

    return () => {
      // Cleanup
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, [graph]);

  return <div ref={canvasRef} className="graph-viz-canvas" />;
}
```

**Note**: This requires adding React to Astro. **Skip this task if you want to keep the site Astro-only.** The text fallback is sufficient.

---

### Phase 3 Checkpoint

✅ **Deliverables**:
- `/graph` page accessible and functional
- Text-based topic browser (no JS required)
- Optional: Interactive D3.js visualization
- Accessible, keyboard-navigable

✅ **Tests**:
```bash
pnpm build
pnpm preview
# Visit /graph
# Verify topic groups expand/collapse
# Test keyboard navigation
# Verify works without JS
```

**Commit**: `feat(graph): add /graph visualization page`

---

## Phase 4: Unlinked Mentions (Days 11-14)

### Objective
Detect when a post mentions a topic covered elsewhere, suggest linking.

### Tasks

#### 4.1 Build Mention Detector

**File**: `src/lib/mention-detector.ts`

```typescript
import type { PostNode, UnlinkedMention } from '../types/graph';

/**
 * Find unlinked mentions: Post A mentions topic X in text,
 * but Post B is explicitly about topic X and not linked
 */
export function findUnlinkedMentions(
  posts: PostNode[],
  threshold = 0.6
): UnlinkedMention[] {
  const mentions: UnlinkedMention[] = [];

  posts.forEach(sourcePost => {
    // Get post content (would need to pass in body)
    const content = sourcePost.excerpt?.toLowerCase() || '';

    posts.forEach(targetPost => {
      if (sourcePost.id === targetPost.id) return;

      // Check if any of target's topics mentioned in source text
      targetPost.topics.forEach(topic => {
        const topicLower = topic.toLowerCase();

        if (content.includes(topicLower)) {
          // Calculate confidence based on topic prominence
          const occurrences = (content.match(new RegExp(topicLower, 'g')) || []).length;
          const confidence = Math.min(1, occurrences * 0.2);

          if (confidence >= threshold) {
            mentions.push({
              sourcePostId: sourcePost.id,
              targetPostId: targetPost.id,
              topic,
              confidence,
              snippet: extractSnippet(content, topicLower)
            });
          }
        }
      });
    });
  });

  return mentions;
}

/**
 * Extract 100 chars around first mention of topic
 */
function extractSnippet(text: string, topic: string): string {
  const index = text.indexOf(topic);
  if (index === -1) return '';

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + 50);

  return '...' + text.slice(start, end) + '...';
}
```

---

#### 4.2 Generate Suggestions File

**Update**: `src/integrations/knowledge-graph.ts`

```typescript
import { findUnlinkedMentions } from '../lib/mention-detector';

export default function knowledgeGraphIntegration(): AstroIntegration {
  return {
    name: 'knowledge-graph',
    hooks: {
      'astro:build:setup': async ({ logger }) => {
        // ... existing graph building

        // Detect unlinked mentions
        logger.info('🔍 Detecting unlinked mentions...');
        const mentions = findUnlinkedMentions(nodes);
        logger.info(`Found ${mentions.length} potential connections`);

        // Write suggestions for manual review
        const suggestionsPath = join(process.cwd(), 'docs', 'graph-suggestions.json');
        writeFileSync(suggestionsPath, JSON.stringify(mentions, null, 2));

        logger.info(`💡 Suggestions saved to docs/graph-suggestions.json`);
      }
    }
  };
}
```

---

#### 4.3 Add .gitignore Entry

**File**: `.gitignore` (append)

```
# Knowledge graph suggestions (optional to commit)
docs/graph-suggestions.json
```

---

### Phase 4 Checkpoint

✅ **Deliverables**:
- Mention detection algorithm
- `docs/graph-suggestions.json` generated on build
- Manual review workflow documented

✅ **Tests**:
```bash
pnpm build
cat docs/graph-suggestions.json | jq '.[:5]'  # View first 5 suggestions
```

**Commit**: `feat(graph): add unlinked mention detection`

---

## Phase 5: Polish & Optimization (Days 15-18)

### Tasks

#### 5.1 Add Graph JSON Endpoint for LLMs

**File**: `src/pages/data/graph.json.ts`

```typescript
import type { APIRoute } from 'astro';
import graphData from '../../data/graph.json';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(graphData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
```

**Test**: Visit `/data/graph.json`, verify JSON served

---

#### 5.2 Add Graph Metadata to Head

**File**: `src/layouts/BaseLayout.astro` (modify)

```astro
<head>
  <!-- ... existing meta tags -->

  <!-- Knowledge graph metadata -->
  <link rel="alternate" type="application/json" href="/data/graph.json" title="Knowledge Graph" />

  <meta name="graph:posts" content={graphData.stats.totalPosts} />
  <meta name="graph:connections" content={graphData.stats.totalEdges} />
</head>
```

---

#### 5.3 Add Caching for Build Performance

**Update**: `src/integrations/knowledge-graph.ts`

```typescript
import { createHash } from 'crypto';

export default function knowledgeGraphIntegration(): AstroIntegration {
  return {
    name: 'knowledge-graph',
    hooks: {
      'astro:build:setup': async ({ logger }) => {
        const posts = await getCollection('blog');

        // Calculate content hash
        const contentHash = createHash('sha256')
          .update(JSON.stringify(posts.map(p => p.id + p.data.title)))
          .digest('hex');

        const cacheFile = join(process.cwd(), '.astro', 'graph-cache.json');

        // Check cache
        try {
          const cache = JSON.parse(readFileSync(cacheFile, 'utf-8'));
          if (cache.hash === contentHash) {
            logger.info('📊 Knowledge graph unchanged, using cache');
            graphData = cache.data;
            return;
          }
        } catch {
          // No cache, continue
        }

        // ... build graph as before

        // Save cache
        writeFileSync(cacheFile, JSON.stringify({
          hash: contentHash,
          data: graphData
        }));
      }
    }
  };
}
```

---

#### 5.4 Add Performance Metrics

**Update**: `src/integrations/knowledge-graph.ts`

```typescript
const startTime = Date.now();

// ... graph building

const duration = Date.now() - startTime;
logger.info(`⏱️  Graph generation took ${duration}ms`);
```

---

#### 5.5 Documentation

**File**: `docs/knowledge-graph-usage.md`

```markdown
# Knowledge Graph Usage

## Overview
This site uses a build-time knowledge graph to surface connections between posts.

## How It Works
1. On every build, the graph integration parses all posts
2. Extracts topics from frontmatter
3. Builds connections between posts with shared topics
4. Generates `graph.json` and injects backlinks into HTML

## Maintenance

### Weekly
- Review `docs/graph-suggestions.json` for unlinked mentions
- Manually add 1-2 strategic links if suggestions are strong

### When Writing
- Add relevant topics to frontmatter (`topics: ["ai", "learning"]`)
- Graph will automatically connect to related posts

## Manual Linking (Optional)
If a suggestion looks good, add to frontmatter:

```yaml
relatedPosts:
  - slug: "spaced-repetition"
    reason: "Discusses spacing effect in detail"
```

## Endpoints
- `/data/graph.json` - Full graph data (JSON)
- `/graph` - Visual exploration page

## Performance
- Build time: ~2-3s for 100 posts
- Cached if posts unchanged
- Zero runtime overhead
```

---

### Phase 5 Checkpoint

✅ **Deliverables**:
- Graph JSON endpoint for LLMs
- Caching for faster builds
- Performance metrics logged
- Usage documentation complete

✅ **Tests**:
```bash
pnpm build  # First run
pnpm build  # Second run (should use cache)
# Compare build times
curl http://localhost:4321/data/graph.json | jq '.stats'
```

**Commit**: `feat(graph): add LLM endpoint and build caching`

---

## Testing & Quality Assurance

### Accessibility Tests

```bash
# Install axe-core
pnpm add -D @axe-core/cli

# Test graph page
pnpm axe http://localhost:4321/graph

# Test post with backlinks
pnpm axe http://localhost:4321/blog/any-post
```

**Requirements**:
- [ ] All color contrasts pass WCAG AA
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces graph stats
- [ ] No automated ARIA violations

### Performance Tests

```bash
# Build performance
time pnpm build

# Lighthouse audit
npx lighthouse http://localhost:4321/graph --view

# Bundle size check
du -sh dist/data/graph.json
```

**Requirements**:
- [ ] Build time <3s added for 50 posts
- [ ] graph.json <100KB for 100 posts
- [ ] Lighthouse performance >90
- [ ] No CLS or LCP regression

### Manual Testing Checklist

- [ ] Related posts appear on every blog post
- [ ] Backlinks are relevant (shared topics make sense)
- [ ] `/graph` page loads without JavaScript
- [ ] Topic groups expand/collapse properly
- [ ] Dark mode styling correct
- [ ] Mobile responsive (test 375px, 768px, 1440px)
- [ ] No broken links in backlinks
- [ ] Graph stats accurate

---

## Rollback Plan

If issues arise in production:

1. **Disable backlinks**: Remove `<RelatedPosts />` from `BlogPost.astro`
2. **Disable graph page**: Delete `src/pages/graph.astro`
3. **Disable integration**: Comment out in `astro.config.ts`
4. **Redeploy**: `pnpm build && pnpm deploy`

**Critical paths unaffected**: Blog posts still render without graph data.

---

## Future Enhancements (Post-MVP)

- [ ] Semantic similarity (embeddings) instead of topic matching only
- [ ] Temporal clustering (show how ideas evolved over time)
- [ ] Cross-reference detection (quoted text from other posts)
- [ ] Series detection (multi-part posts auto-linked)
- [ ] Export graph as `.graphml` for Obsidian/Gephi
- [ ] AI-generated summaries for post clusters
- [ ] Reader analytics (which connections clicked most)

---

## Success Metrics (3 months post-launch)

- [ ] 80%+ of posts have 2+ related posts shown
- [ ] 0 false positive connections reported
- [ ] <2% increase in build time
- [ ] `/graph` page visits >5% of total traffic
- [ ] Manual linking effort <10 mins/month

---

## Sign-Off

**Phase 1**: ☐ Foundation complete
**Phase 2**: ☐ Backlinks UI complete
**Phase 3**: ☐ Graph page complete
**Phase 4**: ☐ Unlinked mentions complete
**Phase 5**: ☐ Polish complete

**Final Review**:
- [ ] All tests pass
- [ ] Accessibility audit clean
- [ ] Documentation complete
- [ ] Deployed to production

**Completed**: ___________
**Reviewer**: ___________

---

*Last Updated: 2025-11-18*
*Version: 1.0*
