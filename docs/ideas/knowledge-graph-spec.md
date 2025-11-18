# Knowledge Graph & Cross-References: Detailed Spec

## Overview

A build-time knowledge graph system that surfaces connections between posts without requiring JavaScript or manual linking. Readers discover related ideas organically through:
- **Backlinks**: "Also discussed in X, Y, Z posts"
- **/graph page**: Visual + textual exploration of idea networks
- **Edit-time suggestions**: "You mentioned this topic in 3 other posts, link them?"

**Zero runtime JS required for core reading experience.**

---

## How It Works: End-to-End

### 1. **Build Phase** (Astro `build:done` hook)

```
Posts (MDX) → Parse AST → Extract entities → Build graph JSON → Pre-render pages
     ↓
  [topic extraction]
  [code snippet detection]
  [quote indexing]
     ↓
  graph.json (cached)
     ↓
  Backlinks injected into HTML
  /graph page rendered
```

#### Step 1a: Parse MDX AST

```typescript
// src/integrations/knowledge-graph.ts
import { parse } from '@astrojs/mdx';
import { visit } from 'unist-util-visit';

async function extractEntitiesFromPost(mdxContent: string) {
  const ast = parse(mdxContent);
  const entities = {
    topics: [],
    codeSnippets: [],
    quotes: [],
    mentions: []
  };

  visit(ast, (node) => {
    // Extract h2/h3 headings as topics
    if (node.type === 'heading' && node.depth <= 3) {
      entities.topics.push(slugify(node.children[0].value));
    }

    // Extract code blocks
    if (node.type === 'code') {
      entities.codeSnippets.push({
        language: node.lang,
        snippet: node.value.slice(0, 50) // first 50 chars as fingerprint
      });
    }

    // Extract quotes/bold text as emphasis areas
    if (node.type === 'emphasis' || node.type === 'strong') {
      entities.mentions.push(node.children[0].value);
    }
  });

  return entities;
}
```

#### Step 1b: Extract Frontmatter Topics

```typescript
// Leverage existing frontmatter schema
function extractFromFrontmatter(post: any) {
  return {
    title: post.data.title,
    topics: post.data.topics, // already defined in schema
    type: post.data.type,     // note|essay|guide|link
    date: post.data.pubDate
  };
}
```

#### Step 1c: Build Graph Data Structure

```typescript
// graph.json generated at build time
{
  "posts": [
    {
      "id": "on-learning-theory",
      "slug": "/blog/on-learning-theory",
      "title": "On Learning Theory",
      "date": "2024-11-15",
      "topics": ["learning", "cognition", "pedagogy"],
      "type": "essay",
      "outgoing": [
        {
          "type": "mentions_topic",
          "targetTopic": "spaced-repetition",
          "matchingPosts": ["post-123", "post-456"]
        },
        {
          "type": "shared_code_pattern",
          "target": "post-789",
          "commonality": "React hooks pattern"
        }
      ]
    }
  ],
  "topics": {
    "learning": {
      "posts": ["post-1", "post-2", "post-3"],
      "connections": ["cognition", "memory"]
    }
  },
  "generatedAt": "2024-11-18T10:30:00Z",
  "version": 1
}
```

#### Step 1d: Detect Unlinked Mentions

```typescript
// Fuzzy match algorithm: if topic mentioned in text of post A,
// but post B explicitly covers that topic, suggest connection

function findUnlinkedMentions(allPosts: Post[]) {
  const suggestions = [];

  allPosts.forEach((sourcePost) => {
    const text = sourcePost.content.toLowerCase();

    allPosts.forEach((targetPost) => {
      if (sourcePost.id === targetPost.id) return;

      // Check if any target topics mentioned in source
      targetPost.topics.forEach((topic) => {
        if (text.includes(topic.toLowerCase()) &&
            !sourcePost.outgoing.some(o => o.target === targetPost.id)) {
          suggestions.push({
            source: sourcePost.id,
            target: targetPost.id,
            topic: topic,
            confidence: calculateMatchConfidence(text, topic)
          });
        }
      });
    });
  });

  return suggestions;
}
```

### 2. **Static HTML Injection** (Zero JS)

At build time, inject backlinks into post HTML:

```html
<!-- Injected into post layout -->
<aside class="related-posts">
  <h3>Also discussed in:</h3>
  <ul>
    <li><a href="/blog/spaced-repetition">Spaced Repetition in Learning</a></li>
    <li><a href="/blog/memory-consolidation">Memory Consolidation</a></li>
  </ul>

  <!-- Optional: unlinked mentions suggestion (content-only, no interactivity) -->
  <details>
    <summary>3 unlinked mentions of "learning theory" in other posts</summary>
    <ul>
      <li><a href="/blog/post-x">"Designing Educational Systems" mentions this</a></li>
      <li><a href="/blog/post-y">"Cognitive Load Theory" references your work here</a></li>
    </ul>
  </details>
</aside>
```

**This is HTML only—no JS required. Details/summary for optional expansion.**

### 3. **Optional /graph Visualization Page** (JS-enhanced)

For users who want to explore relationships interactively:

```typescript
// src/pages/graph.astro
---
import { getCollection } from 'astro:content';
import Graph from '../components/KnowledgeGraph.astro';

const posts = await getCollection('blog');
const graphData = JSON.parse(Astro.props.graphJson);
---

<html>
  <head>
    <script type="application/ld+json">
      {graphData as JSON-LD for SEO}
    </script>
  </head>
  <body>
    <!-- Fallback: text-based graph for no-JS -->
    <div id="graph-container">
      <div class="graph-fallback">
        <h2>Knowledge Graph</h2>
        <nav>{graphData.posts.map(post => ...)}</nav>
      </div>
    </div>

    <!-- Enhanced: interactive visualization if JS available -->
    <script type="module">
      import { renderGraph } from '../lib/graph-viz.ts';
      renderGraph(graphData, '#graph-container');
    </script>
  </body>
</html>
```

**Progressive enhancement**: Fallback text list always available.

---

## Architecture & Data Flow

### File Structure

```
src/
├── integrations/
│   └── knowledge-graph.ts          # Build hook + graph generation
├── lib/
│   ├── graph-utils.ts              # AST parsing, entity extraction
│   ├── graph-viz.ts                # Optional D3/Cytoscape rendering
│   └── fuzzy-match.ts              # Unlinked mention detection
├── components/
│   ├── BlogLayout.astro            # Inject backlinks footer
│   ├── KnowledgeGraph.astro        # /graph page component
│   └── RelatedPosts.astro          # Backlinks card component
├── pages/
│   ├── blog/
│   │   └── [slug].astro            # Individual post (with injected backlinks)
│   └── graph.astro                 # Knowledge graph explorer
└── types/
    └── graph.ts                    # TypeScript interfaces

public/
└── data/
    └── graph.json                  # Generated at build time (cached)
```

### Astro Integration Hook

```typescript
// src/integrations/knowledge-graph.ts
import type { AstroIntegration } from 'astro';

export default function knowledgeGraphIntegration(): AstroIntegration {
  return {
    name: 'knowledge-graph',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        console.log('📊 Generating knowledge graph...');

        // 1. Load all posts
        const posts = await getCollection('blog');

        // 2. Extract entities from each post
        const graphData = buildGraph(posts);

        // 3. Detect unlinked mentions
        const suggestions = findUnlinkedMentions(posts);

        // 4. Write graph.json
        const outputPath = `${dir.pathname}/data/graph.json`;
        writeFileSync(outputPath, JSON.stringify(graphData, null, 2));

        // 5. Write suggestions for edit-time hints
        writeFileSync('docs/graph-suggestions.json', JSON.stringify(suggestions, null, 2));

        console.log(`✅ Generated graph with ${posts.length} posts`);
      }
    }
  };
}
```

### Data Types

```typescript
// src/types/graph.ts
export interface PostEntity {
  id: string;
  slug: string;
  title: string;
  date: string;
  topics: string[];
  type: 'note' | 'essay' | 'guide' | 'link';
  wordCount: number;
}

export interface GraphEdge {
  source: string;       // post ID
  target: string;       // post ID
  type: 'shared_topic' | 'mentions_topic' | 'shared_code' | 'quote_reference';
  weight: number;       // 0-1, confidence score
  label?: string;       // why they're connected
}

export interface KnowledgeGraph {
  posts: PostEntity[];
  edges: GraphEdge[];
  topics: Map<string, string[]>;  // topic → [post IDs]
  generatedAt: string;
  version: number;
}

export interface UnlinkedMention {
  sourcePost: string;
  targetPost: string;
  topic: string;
  confidence: number;  // 0-1
  snippet?: string;    // context around mention
}
```

---

## UI/UX Details

### Option A: Minimal (No Extra JS)

**Backlinks footer on every post:**

```
┌─────────────────────────────┐
│ Also discussed in:          │
├─────────────────────────────┤
│ • Spaced Repetition         │
│ • Memory Consolidation      │
│ • Cognitive Load Theory     │
└─────────────────────────────┘
```

**Optional expandable section:**

```
<details>
  <summary>🔗 You mention "learning theory" in 3 other posts</summary>
  <ul>
    <li>Designing Educational Systems</li>
    <li>Cognitive Load Theory</li>
    <li>Effective Teaching Patterns</li>
  </ul>
</details>
```

**No JavaScript needed. Styling:**

```css
.related-posts {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin-top: 2rem;
  font-size: 0.95rem;
}

.related-posts h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  opacity: 0.7;
}

.related-posts ul {
  list-style: none;
  padding: 0;
}

.related-posts li {
  padding: 0.25rem 0;
}

.related-posts a {
  text-decoration: none;
  color: var(--link-color);
}

.related-posts a:hover {
  text-decoration: underline;
}
```

### Option B: Interactive /graph Page

**Text-first fallback:**

```
Topics
├── Learning (5 posts)
│   ├─ On Learning Theory
│   ├─ Spaced Repetition
│   └─ Memory Consolidation
├── Software Design (8 posts)
│   ├─ React Patterns
│   ├─ Architecture Principles
│   └─ ...
```

**Enhanced view (if JS available):**

- Interactive force-directed graph (D3.js / Cytoscape.js)
- Click node → highlight connections
- Hover edge → show why connected
- Sidebar shows post details
- Filter by topic/date

---

## Maintenance: What's Required?

### ✅ **Minimal Ongoing Maintenance**

#### 1. **Build-Time Only** (No Runtime Overhead)

Graph generation runs **once per build**, not on every page request. After deployment, graph.json is static.

```
$ pnpm build
[Knowledge Graph] Parsing 47 posts...
[Knowledge Graph] Extracting entities...
[Knowledge Graph] Building graph...
[Knowledge Graph] Detecting unlinked mentions...
✅ Generated graph with 47 posts in 2.3s
```

**Cost**: ~2-3 seconds added to build time (negligible)

#### 2. **No Backend/Database**

Everything lives in:
- `graph.json` (static file, ~50KB for 100 posts)
- HTML injected at build time (no runtime query)
- `/graph` page pre-rendered

No database to maintain, no cron jobs, no API calls.

#### 3. **Edit Time (Optional Suggestions)**

When you write/edit a post, you **optionally** check `docs/graph-suggestions.json`:

```json
[
  {
    "sourcePost": "on-learning-theory",
    "targetPost": "spaced-repetition",
    "topic": "spacing effect",
    "confidence": 0.87,
    "snippet": "...the spacing effect, which suggests..."
  }
]
```

**Manual decision**: "Should I link these?" If yes, add to frontmatter or markdown.

**This is optional**—the system works without manual linking.

#### 4. **Automated Topic Extraction**

Two approaches:

**Option A: Explicit (Recommended)**
- Topics already in frontmatter (`topics: ["learning", "cognition"]`)
- No extra work—already doing this
- Graph uses existing data

**Option B: Implicit (More Work)**
- Parse post content to infer topics
- Requires tuning fuzzy matching
- Over time: false positives increase
- **Not recommended unless you want it**

---

## Edge Cases & Maintenance Scenarios

### Scenario 1: You Delete a Post

```
Before: post-123 has 8 backlinks from other posts
Delete: rm -f src/content/blog/old-post.md
Build: $ pnpm build

After: graph.json automatically regenerated
       Backlinks to post-123 disappear
       No broken links (graph.json is source of truth)
```

**Maintenance**: Zero. Automatic.

### Scenario 2: You Rename a Post

```
Before: slug = "learning-theory"
Change: slug = "on-learning-deeply"
Rename: Edit post frontmatter

After: Build regenerates graph with new slug
       Backlinks update automatically
       Old URL may 404 (handle via redirects in astro.config.ts)
```

**Maintenance**: Update `_redirects` file if needed (2 minutes).

### Scenario 3: You Merge Two Posts

```
Before: post-A (on learning) + post-B (on memory)
Merge: Combine into one post, delete post-B

After: Build detects post-B deleted
       Edges to post-B removed
       post-A inherits all topics from both
```

**Maintenance**: Zero (automatic cleanup).

### Scenario 4: Topic Popularity Grows

```
Original: "AI" mentioned in 5 posts
Over time: "AI" now mentioned in 25 posts
Problem: Backlinks section becomes noisy

Solution 1: Filter by relevance (only top 5 related)
Solution 2: Categorize links ("Foundational" vs "Advanced")
Solution 3: Truncate + "See 12 more" link
```

**Maintenance**: Tweak filtering logic (1-2 hours one-time).

---

## Performance Impact

### Build Time

| # Posts | Parsing | Graph Gen | Total Added |
|---------|---------|-----------|-------------|
| 10      | 50ms    | 100ms     | ~150ms      |
| 50      | 200ms   | 400ms     | ~600ms      |
| 100     | 400ms   | 800ms     | ~1.2s       |
| 250     | 900ms   | 1.8s      | ~2.7s       |

**Optimization**: Cache results; only recompute if posts changed.

### Page Load Time

**No impact**. Backlinks are static HTML; `/graph` is optional.

```
Current: ~1.2s
With backlinks injection: ~1.2s (no change)
With /graph page: ~1.2s (pre-rendered, same as blog post)
```

### Storage

```
graph.json (100 posts): ~50KB
Backlinks HTML per post: +2KB average
/graph page HTML: ~15KB
Total added: ~300KB (negligible)
```

---

## Maintenance Checklist

### Weekly
- [ ] Nothing (fully automated)

### Monthly
- [ ] Review `docs/graph-suggestions.json` for unlinked mentions
- [ ] Manually add 2-3 strategic links if suggestions look good

### Quarterly
- [ ] Check `/graph` page for isolated posts (nodes with 0 connections)
- [ ] Consider writing posts to connect clusters

### Annually
- [ ] Audit topic taxonomy (topics still relevant?)
- [ ] Optimize fuzzy matching thresholds if false positives increase

### **Zero Maintenance Needed For:**
- ✅ Backlinks freshness (regenerated every build)
- ✅ Link validity (graph.json is source of truth)
- ✅ Deleted posts (automatic cleanup)
- ✅ Topic coverage (static json, no queries)
- ✅ Performance (cached, pre-rendered)

---

## Implementation Phases

### Phase 1: MVP (Week 1)
1. Extract topics from frontmatter
2. Build simple graph.json
3. Inject backlinks into post HTML
4. Test with existing 40+ posts

**Deliverable**: Every post shows 2-5 related posts in footer

### Phase 2: Smart Linking (Week 2)
1. Implement unlinked mention detection
2. Generate suggestions JSON
3. Manual review + linking workflow

**Deliverable**: `docs/graph-suggestions.json` updated weekly

### Phase 3: Visualization (Week 3)
1. Create `/graph` page
2. Add D3.js force-directed graph (optional)
3. Text-based fallback (always available)

**Deliverable**: `/graph` route with interactive explorer

### Phase 4: Polish (Ongoing)
1. Monitor false positives in suggestions
2. Refine topic matching confidence thresholds
3. Add filtering (by topic, date, post type)

---

## Code Example: Minimal Implementation

```typescript
// src/integrations/knowledge-graph.ts (simplified)
import { getCollection } from 'astro:content';
import { writeFileSync } from 'fs';

export default function knowledgeGraph() {
  return {
    name: 'knowledge-graph',
    hooks: {
      'astro:build:done': async () => {
        const posts = await getCollection('blog');

        // Build edges from topic matches
        const edges = [];
        posts.forEach((post1) => {
          posts.forEach((post2) => {
            if (post1.id === post2.id) return;

            // Check for shared topics
            const shared = post1.data.topics.filter(t =>
              post2.data.topics.includes(t)
            );

            if (shared.length > 0) {
              edges.push({
                source: post1.slug,
                target: post2.slug,
                type: 'shared_topic',
                topics: shared
              });
            }
          });
        });

        // Write graph
        writeFileSync(
          'public/data/graph.json',
          JSON.stringify({ posts, edges }, null, 2)
        );
      }
    }
  };
}
```

---

## Maintenance: Bottom Line

**You will need to:**
- ✅ Run `pnpm build` (already doing)
- ✅ Optionally review suggestions monthly (~10 mins)
- ✅ Manually add links when topics strongly connect (~1-2 links/month)

**You will NOT need to:**
- ❌ Write queries or SQL
- ❌ Deploy databases
- ❌ Monitor cache invalidation
- ❌ Fix broken links (auto-detected)
- ❌ Worry about performance
- ❌ Update /graph manually

**Effort**: ~5 minutes/month after initial setup.

---

*Last Updated: 2025-11-18*
