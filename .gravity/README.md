# Architectural knowledge for Actually Maybe

Reviewed 2026-09-26 against `20c5bea`. This is research about the current system,
not a refactoring plan or a quality score. Start here before changing publishing
or machine-readable access. Evidence and limitations are in [the review record](review.md).

## Natural architecture

A writer puts Markdown/MDX in a content collection. The build turns it into a
reading experience, discovery pages, feeds, a topic graph, and agent-readable
representations. Production serves static files; root middleware chooses HTML
or Markdown per request. Browser scripts enhance already-rendered content.
There is no application database, authenticated session, or content API.

The natural boundaries are **publication**, **reading and discovery**,
**author identity and trust**, **machine-readable access**, and **optional
browser enhancements**. Technical folders mostly fit this small site: a broad
move into feature directories would add movement without solving its real problems.
See [system](map/system.md), [concepts](map/concepts.md),
[ownership](map/ownership.md), and [dependencies](map/dependencies.md).

## Centres of gravity

- The blog collection feeds almost every discovery/output surface. This is
  useful domain gravity, but publication eligibility has no effective owner.
- The graph loader and integration both manage graph state. Even the universal
  `BaseHead` loads the graph for metadata. The graph has become build infrastructure
  as well as a discovery feature.
- `BlogPost.astro` composes the reading experience. Its concentration is mostly
  coherent; ranking and graph I/O, rather than file length, are the boundaries to examine.
- `staticMarkdown.ts` collects several page projections. Its switchboard is
  understandable today, but new pages require parallel registration elsewhere.
- `identity.ts` and `i18n/ui.ts` are useful shared owners with incomplete adoption.

## Change friction and missing concepts

[Five active findings](findings/active.md) identify concrete friction:

1. **F-001: publication eligibility.** `draft: true` is published by the current
   pipeline. Two schemas disagree, and the effective one lacks this field.
2. **F-002: graph snapshot ownership.** Setup, rendering, and finalisation can
   compute/read/write different snapshots. Cache availability also decides whether
   mention suggestions are refreshed.
3. **F-003: related-reading policy.** Sidebar, footer, and Markdown implement
   three rankings. The sidebar's recency comparison also mixes an elapsed age
   with an absolute timestamp.
4. **F-004: identity facts.** Shared contact/social facts coexist with copies
   in the human profile and agent context; changing one owner can leave stale outputs.
5. **F-005: Markdown coverage and projection.** `/graph`, empty guide/link
   collections, and homepage list length disagree across formats. The manifest
   discovers existing pairs; it does not ensure the promised pairs exist.

The stable missing concepts are a published-post set and ownership of the current
build's graph snapshot. A single relevance policy needs a product decision first:
shared topics, references, and series relationships are different meanings.

## Healthy irregularities and things not to change

Keep simple route-local sorting/grouping, separate HTML and Markdown renderers,
responsive TOCs, and small DOM scripts. Their duplication often reflects different
presentation or lifecycle needs. Keep the JSON graph as a projection rather than
forcing every renderer to use it. Avoid a generic page registry, client store,
content repository framework, or a wholesale directory reorganisation.
See [accepted irregularities](findings/accepted.md).

## Premature abstractions

No general-purpose framework dominates this repository. Smaller speculative
remnants exist: unused graph edge variants, assistant-launch plumbing without
rendered launcher actions, and unused navigation icon/command branches. They are
locally contained; do not expand them or build a generic discovery framework
around them. Remove them opportunistically when their feature is next changed.

## Necessary complexity

[Static deployment and format negotiation](necessity/static-representations.md)
need separate build/request phases, a committed route manifest, independent
middleware compilation, and explicit headers for extensionless files. Calendar
publication dates must not shift with the machine's timezone. These constraints
are justified; preserve them when simplifying graph ownership.

## Grace opportunity

[One authoritative build graph](grace/one-build-graph.md) could remove an internal
Astro data-store parser, competing snapshots, a final output overwrite, and
cache-dependent suggestions together. This is a candidate, not an implemented fix.

## Recommended next actions

1. Restore a real publication boundary: one effective schema and a published-post
   set used by all public outputs. Verify draft omission across HTML, Markdown,
   graph, RSS, search, and discovery before shipping.
2. Make graph finalisation consume the same snapshot as rendering. Verify both
   cold builds and changed-content warm builds; refresh suggestions from that snapshot.
3. Decide what each related-reading section means, then share only the policy
   that actually represents the same concept. Correct and test the age comparison.
4. Derive repeated contact/social identity facts from their existing owner whilst
   keeping narrative biographies separate.
5. Reconcile promised Markdown coverage and page selections, including empty
   collections and search fallback. Test content parity, not just route existence.

[Eight change traces](traces/representative-changes.md) explain what each action
would make easier. Findings are recommendations; completing this review does not
claim their implementation. Update this knowledge base when those changes land.
