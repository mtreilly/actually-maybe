# Candidate: one authoritative graph snapshot per build

Status: Investigated opportunity, not implemented

Related finding: F-002

## Complexity that exists

Graph setup parses Astro internals with devalue, hashes/reuses persistent cache,
keeps an integration snapshot, and conditionally writes suggestions. Renderers use
a collection-backed graph with module memory and a disk handoff. A route produces
JSON, then finalisation writes over it. This has accumulated through legitimate
fixes for clean-build availability and stale content, but those repairs have not
removed the competing authorities.

## The underlying insight

Every public graph view represents the same published content at the same build.
There is no independent setup-time graph product. The integration needs final
outputs/suggestions, not its own definition of current content.

Make the graph computed through the collection boundary authoritative for the build.
Keep one producer for the JSON route. Finalisation can read that completed output
(or an explicitly owned build handoff) to derive suggestions instead of recomputing
or overwriting the graph. Explore this using actual hook/build order before changing it.

## Complexity that could disappear together

- Internal data-store shape knowledge and its devalue dependency if no other use remains.
- Hash-based setup cache authority competing with fresh collection data.
- Integration-local graph snapshot and final JSON overwrite.
- Suggestions that refresh only when setup sees a persistent data store.
- One entire cold/warm fallback branch and several paths to investigate stale output.

This is a high-leverage boundary change, not a call to split an algorithm into
smaller files or create a generic caching service.

## Trade-offs and proof required

Finalisation must run after graph JSON is produced, and failure must not silently
reuse previous output. Publication eligibility must be applied first (F-001).
Builds without graph input caches, changed/removed posts on warm builds, graph
HTML/footer/JSON agreement, and suggestion refresh need explicit experiments.
Dev graph lifetime is a separate open question; do not claim build ownership fixes
hot reload without testing it. Retain module memoisation only if its lifetime is
clear. Removing universal head graph statistics is a separate product decision.
