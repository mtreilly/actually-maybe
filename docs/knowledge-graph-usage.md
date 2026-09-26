# Knowledge graph usage

The graph connects published posts that share frontmatter topics. It is a portable
projection of the content collection, not a database or a map of explicit citations.

## Outputs

- `/graph` and `/graph.md`: statistics, most-connected posts, and topic groups.
- `/data/graph.json`: nodes, shared-topic edges, topic index, statistics, and generation time.
- Article footer: “Topic connections”, ordered by graph edge weight.
- `docs/graph-suggestions.json`: optional editorial suggestions derived after each build.

Graph browsing and footer links work without JavaScript.

## Ownership and freshness

`getPublishedPosts()` supplies current public entries. `loadKnowledgeGraph()` owns
the graph snapshot and reuses it only when the portable node inputs are unchanged.
The JSON endpoint is its sole public file producer. The integration reads that
completed output to refresh suggestions; it never overwrites JSON or parses Astro's
internal data store. Persistent graph cache files are not inputs to this pipeline.

Nodes carry title, publication date, topics, type, description, and estimated word
count. Edges currently implement only shared topics. Their weight combines
proportional overlap (70%) and publication-date proximity within a year (30%).
The footer does not imply that another post references or discusses this one.

Sidebar and Markdown related reading instead use shared-topic count with a recency
weight, then newest-first ties. They share one policy; display limits remain local.
Chronological and series neighbours remain separate.

## Editorial suggestions

Suggestions look for repeated topic terms in post descriptions, not full article
bodies. They are approximate prompts for optional editorial review, not verified
unlinked mentions and not graph edges. Add a normal Markdown link when useful.
No `relatedPosts` frontmatter field is implemented or required.

## When writing

Use accurate topics and the effective content schema. `draft: true` excludes a post
from graph nodes, edges, groups, statistics, suggestions, and all other public outputs.
Series navigation uses ordered series metadata; declared future graph edge variants
do not yet create series/reference relationships automatically.

## Verification

`test-graph-builds.ts` checks cold additions, warm edits/removal, public snapshot
agreement, and suggestion refresh. `test-publication.ts` checks draft omission.
`test-representations.ts` compares graph and other page content across formats.
Graph computation is quadratic in post count; no unmeasured large-site performance
or output-size guarantee is claimed.
