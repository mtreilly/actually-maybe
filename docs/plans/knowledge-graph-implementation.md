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
import type { KnowledgeGraph } from '../types/graph';

interface Props {
  currentPostId: string;
  graph: KnowledgeGraph;
  maxRelated?: number;
}

const { currentPostId, graph, maxRelated = 5 } = Astro.props as Props;

const relatedEdges = graph.edges
  .filter(edge => edge.source === currentPostId || edge.target === currentPostId)
  .sort((a, b) => b.weight - a.weight)
  .slice(0, maxRelated);

const relatedPosts = relatedEdges
  .map(edge => {
    const relatedId = edge.source === currentPostId ? edge.target : edge.source;
    const post = graph.posts.find(p => p.id === relatedId);
    return post ? { post, edge } : null;
  })
  .filter(Boolean);

if (relatedPosts.length === 0) {
  return null;
}
---

<aside class="related-posts" aria-labelledby="related-heading">
  <h3 id="related-heading">Also discussed in</h3>
  <ul role="list">
    {relatedPosts.map(({ post, edge }) => (
      <li>
        <a href={`/blog/${post.slug}/`}>
          <span class="post-title">{post.title}</span>
          <time datetime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </time>
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
```

```css
.related-posts {
  margin-top: 3rem;
  padding: 1.5rem;
  border-left: 3px solid rgb(var(--gray-light));
  background: rgba(var(--gray-light), 0.05);
  border-radius: 0 0.5rem 0.5rem 0;
}

.related-posts h3 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(var(--gray));
}

.related-posts ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.related-posts li {
  border-bottom: 1px solid rgba(var(--gray-light), 0.4);
  padding-bottom: 0.75rem;
}

.related-posts li:last-child {
  border-bottom: none;
}

.related-posts a {
  text-decoration: none;
  color: rgb(var(--black));
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
```

_Status: Completed 2025-11-18 — component renders weighted related posts with shared topic badges._

**Test**: `pnpm build && pnpm preview` (manual a11y + keyboard pass)

---

#### 2.2 Load Graph in Blog Layout

**File**: `src/layouts/BlogPost.astro` (modify)

```astro
---
import RelatedPosts from '../components/RelatedPosts.astro';
import type { KnowledgeGraph } from '../types/graph';
import { loadKnowledgeGraph } from '../lib/knowledge-graph-loader';

let knowledgeGraph: KnowledgeGraph | null = null;
try {
  knowledgeGraph = await loadKnowledgeGraph();
} catch (error) {
  console.warn('Unable to load knowledge graph:', error);
}
---

{knowledgeGraph && postId && (
  <RelatedPosts currentPostId={postId} graph={knowledgeGraph} maxRelated={5} />
)}
```

_Status: Completed 2025-11-18 — blog layout now loads cached graph data and renders the RelatedPosts footer._

**Test**: `pnpm build && pnpm preview` (verify "Also discussed in" footer on sample posts)

---

#### 2.3 Fix Build Order Issue

**Update**: `src/lib/knowledge-graph-loader.ts` + `src/integrations/knowledge-graph.ts`

```typescript
export async function loadKnowledgeGraph(forceRebuild = false): Promise<KnowledgeGraph> {
  if (memoryCache && !forceRebuild) return memoryCache;

  if (!forceRebuild) {
    const cached = await readGraphCache();
    if (cached) return (memoryCache = cached);
  }

  const entries = await loadBlogEntriesFromDataStore();
  const graph = buildGraph(entries);
  await writeGraphCache(graph);
  return (memoryCache = graph);
}

// Integration
'astro:build:setup': async ({ logger }) => {
  graphData = await loadKnowledgeGraph(true);
  logger.info(`Found ${graphData.posts.length} posts`);
},
'astro:build:done': async ({ dir }) => {
  if (graphData) {
    const outputPath = join(dir.pathname, 'data', 'graph.json');
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(graphData, null, 2));
  }
}
```

_Status: Completed 2025-11-18 — shared loader reads `.astro/data-store.json`, caches to `.astro/graph-cache.json`, and integration writes `dist/data/graph.json`._

**Test**: `pnpm build` → confirms integration logs + `dist/data/graph.json` emission

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
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import KeyboardShortcuts from '../components/KeyboardShortcuts.astro';
import { SITE_TITLE } from '../consts';
import type { KnowledgeGraph } from '../types/graph';
import { loadKnowledgeGraph } from '../lib/knowledge-graph-loader';

let graph: KnowledgeGraph | null = null;
try {
  graph = await loadKnowledgeGraph();
} catch (error) {
  console.warn('Unable to load knowledge graph for /graph page:', error);
}

const topicGroups = graph
  ? Object.entries(graph.topics)
      .map(([topic, postIds]) => ({
        topic,
        posts: postIds
          .map(id => graph!.posts.find(post => post.id === id))
          .filter((post): post is KnowledgeGraph['posts'][number] => Boolean(post)),
        count: postIds.length
      }))
      .filter(group => group.count > 0)
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
  : [];
---
```

_Status: Completed 2025-11-18 — astro-only `/graph` page renders stats, a “most connected posts” list, collapsible topic groups, and a download link powered by `loadKnowledgeGraph()`._

**Test**: `pnpm build && pnpm preview` (visit `/graph`, verify layout without JS)

_Note: The optional D3/React visualization was intentionally skipped to preserve the zero-JS baseline._

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

_Status: Completed 2025-11-18 — implemented in `src/lib/mention-detector.ts` using post excerpts with deduped suggestions._

**Test**: `pnpm tsx src/lib/__tests__/graph-utils.test.ts` (existing unit set) + exercised indirectly via `pnpm build` to ensure mention detection runs without errors.

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

_Status: Completed 2025-11-18 — integration now writes `docs/graph-suggestions.json` during `astro:build:setup` with a count logged._

**Test**: `pnpm build && head docs/graph-suggestions.json`

---

#### 4.3 Add .gitignore Entry

**File**: `.gitignore` (append)

```
# Knowledge graph suggestions (optional to commit)
docs/graph-suggestions.json
```

_Status: Completed — prevents the generated suggestions file from showing up in git status._

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

**Status**: Completed 2025-11-18 — implemented via `src/pages/data/graph.json.ts` using `loadKnowledgeGraph()`.

**Test**: `pnpm build && pnpm preview` → `curl http://localhost:4321/data/graph.json | jq '.stats'`

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

**Status**: Completed — implemented inside `src/components/BaseHead.astro` so every page advertises the JSON graph along with basic stats.

**Test**: `pnpm build` → inspect `<head>` markup

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

**Status**: Completed — integration now hashes `.astro/data-store.json`, reuses cached graphs, and stores `{ hash, graph }` payloads.

**Test**: `pnpm build` (second run should log cache hit)

---

#### 5.4 Add Performance Metrics

**Update**: `src/integrations/knowledge-graph.ts`

```typescript
const startTime = Date.now();

// ... graph building

const duration = Date.now() - startTime;
logger.info(`⏱️  Graph generation took ${duration}ms`);
```

**Status**: Completed — duration logging added around graph prep.

**Test**: `pnpm build` → check integration logs

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

**Status**: Completed — documented in `docs/knowledge-graph-usage.md`.

**Test**: Review file locally / share with collaborators

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
