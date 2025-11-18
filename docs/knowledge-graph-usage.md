# Knowledge Graph Usage

## Overview
The build pipeline generates a knowledge graph from every post so readers can follow related ideas without manual linking. Graph data is available as HTML (backlinks), `/graph`, and `/data/graph.json` for automation.

## How It Works
1. Build loads all posts from `src/content/blog`.
2. Topics are parsed from frontmatter; a graph is constructed at build time.
3. Backlinks render in each post footer.
4. `/graph` serves a text-first view; `/data/graph.json` exposes the raw graph.
5. Unlinked mentions are written to `docs/graph-suggestions.json` for optional manual linking.

## Maintenance

### Weekly
- Review `docs/graph-suggestions.json`.
- If a suggestion makes sense, add a manual link (optional).

### When Writing
- Include accurate `topics` in frontmatter.
- No extra metadata is required; the graph updates automatically on build.

## Manual Linking (Optional)
```
relatedPosts:
  - slug: "spaced-repetition"
    reason: "Discusses spacing effect in detail"
```

## Endpoints
- `/data/graph.json` – downloadable graph (JSON)
- `/graph` – static exploration page

## Performance
- Build adds <3s for ~100 posts (cached when unchanged).
- `graph.json` stays <100KB by default.
- Zero client-side JavaScript required for backlinks or `/graph`.
