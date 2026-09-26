# One authoritative build graph

Status: Implemented and verified, 2026-09-26

Related finding: F-002, now in `findings/resolved.md`.

## Before

Graph setup parsed Astro's internal serialised data store, hashed/reused cache,
kept a private snapshot, and conditionally wrote suggestions. Rendering computed
another snapshot and wrote a disk handoff. The JSON endpoint rendered the graph,
then finalisation could overwrite it with the setup snapshot.

## Insight and change

Every public graph surface describes the same current published content. The
integration needs derivative editorial output, not another source of content.
The collection-backed loader owns the snapshot. It compares the current portable
node projection to its previous input before reusing memory, so changed content
refreshes without persistent cache authority. The endpoint alone emits JSON.
Finalisation consumes that output to refresh suggestions on every successful build.

## Complexity removed

- Astro internal data-store parsing and direct devalue use.
- Setup hash/cache authority and integration-local snapshot.
- Persistent graph handoff and cache-write options.
- Final JSON overwrite and cold/warm fallback branches.
- Cache-dependent mention suggestion generation.

## Remaining trade-offs and evidence

Universal head metadata still loads graph statistics; this is retained behaviour.
Memoisation compares serialised portable nodes, a small O(n) cost that avoids
rebuilding pairwise edges for unchanged content. Current collections are queried
before cache reuse, so module lifetime alone cannot freeze changed graph inputs.

`test-graph-builds.ts` verifies cold additions, warm additions/edits/removal, suggestion
refresh, and agreement with graph HTML and article metadata. Loader unit tests
verify same-process content refresh. No claim of a complete Astro dev hot-reload
browser audit is made. Build finalisation must remain after endpoint generation;
missing or invalid graph output fails rather than reusing old suggestions silently.
