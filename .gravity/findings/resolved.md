# Resolved architectural findings

## F-001: Publication eligibility has one owner

Resolved 2026-09-26. Previously, the active schema lacked draft metadata and
unfiltered collection reads published drafts into HTML, Markdown, RSS, and search.

`src/lib/published-posts.ts` now owns public eligibility and collection access.
The effective schema defaults `draft` to false; the obsolete schema was removed.
All public consumers use the boundary, including graph inputs. Authored collection
entries remain available privately to Astro, but public route generation excludes drafts.

Verification: `published-posts.test.ts` exercises explicit/default eligibility;
`test-publication.ts` builds an actual draft with a private topic, inspects direct
outputs and all textual public artefacts, checks graph suggestions/manifest, then
removes the fixture and rebuilds. Passed on Node 24.21.0. No probe content remains.
Graph snapshot ownership is addressed independently by F-002.

## F-002: Rendering owns the current graph snapshot

Resolved 2026-09-26. The previous setup graph could overwrite freshly rendered
JSON with stale content; mention suggestions depended on a warm internal data store.

The loader now queries current published content and memoises its portable node
projection, refreshing when that projection changes. It writes no persistent cache.
The endpoint is the only JSON producer. Finalisation reads that completed output
solely to refresh editorial suggestions. Internal Astro parsing, setup snapshot,
hash cache, disk handoff, and final output overwrite were removed.

Verification: loader tests cover reuse and refresh in one module lifetime; build
regressions add two connected posts after deleting `.astro/`, edit title/topics
and suggestion text on a warm build, remove a post, then restore baseline membership.
Rendered graph, article metadata, JSON nodes/edges/topics, suggestions, direct files,
and manifest agree. Passed on Node 24.21.0. Draft exclusion also passes this pipeline.

## F-003: Related-reading policy and topic connections are explicit

Resolved 2026-09-26. Three rankings previously served similar labels, and the
sidebar compared an elapsed age to an epoch timestamp.

`related-reading.ts` owns sidebar and Markdown recommendation order: shared-topic
count, half weight for posts at least 365 days old, newest-first ties, then stable
ID order. Display limits remain local (three sidebar, five Markdown). Graph footer
weights retain proportional overlap and proximity between publication dates;
its label is now “Topic connections”, not a claim that another post discusses this one.
Series and chronological neighbours remain independent concepts.

Verification: controlled-clock unit tests cover just inside/at/outside the age boundary,
overlap, ties, input-order independence, self/draft/unrelated exclusions. Output tests
compare the HTML sidebar to the Markdown selection prefix across all 15 posts.
Build and all page heading outlines passed. Product meanings are recorded in the
related-reading decision; no generic relevance framework was introduced.
