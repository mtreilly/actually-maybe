# Architectural knowledge for Actually Maybe

Updated 2026-09-26 after implementing the five findings. The [original review](review.md)
records the earlier architecture; the [implementation audit](implementation.md) records
current evidence and verification limits. [Active findings](findings/active.md) has no
unresolved item from that review; [resolved history](findings/resolved.md) explains each fix.

## Natural architecture

A writer adds Markdown/MDX to the blog collection. One effective schema validates it;
`getPublishedPosts` excludes drafts from public consumers. The build produces static
reading pages, discovery, feeds, a topic graph, and portable representations. Root
middleware negotiates HTML or Markdown at request time. Browser scripts enhance
already-rendered content. No application database or client framework is needed.

The boundaries remain publication, reading/discovery, identity/trust, portable
representations, and optional browser enhancements. See [system](map/system.md),
[concepts](map/concepts.md), [ownership](map/ownership.md), and [dependencies](map/dependencies.md).

## Current centres of gravity

- `published-posts.ts` owns public eligibility; renderers retain local projections.
- The graph loader derives a current published-content snapshot. The JSON endpoint
  owns public serialization; finalisation consumes its output for editorial suggestions.
- `related-reading.ts` owns sidebar/Markdown ranking. Graph topic connections,
  series navigation, and chronological neighbours retain distinct meanings.
- `identity.ts` owns repeated factual identity. Audience-specific biographies remain local.
- Explicit Markdown builders remain separate from HTML templates. Shared latest-post,
  graph-view, and post-type selections prevent accidental representation drift.

## Boundaries to preserve

Keep [accepted irregularities](findings/accepted.md): local sorting/grouping, separate
renderers, responsive TOCs, coherent article composition, small DOM scripts, and
portable graph nodes. Keep [build/request separation](necessity/static-representations.md),
calendar dates, independent middleware compilation, and the committed route manifest.
The [graph simplification](grace/one-build-graph.md) is now implemented.

## Maintenance guidance

1. Use the publication boundary for every new public consumer; exercise actual
   output exclusion rather than only unit-testing a draft predicate.
2. For content changes, regenerate the manifest and verify cold/warm graph outputs.
3. For a new page, add its useful Markdown projection and representation coverage.

[Change traces](traces/representative-changes.md) describe current coordination needs.
No broad reorganisation or generic content/page/relevance framework was introduced.
