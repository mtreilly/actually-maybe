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
