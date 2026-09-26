# Representative changes after remediation

Updated 2026-09-26. These describe current coordination, not additional features.
The [original review](../review.md) preserves before-change evidence.

## T-001: Publish one more thought

Add one file to `src/content/blog/`. Public routes, feeds, search, graph, Markdown,
and agent indexes derive it automatically. Build and commit the generated manifest.
Current-content graph acquisition prevents an earlier snapshot overwriting that addition.

## T-002: Keep a draft, then publish it

Set `draft: true`, then remove it or set false to publish. The effective schema and
`getPublishedPosts` own eligibility; writers need no renderer edits. Cold/warm fixture
builds verify exclusion across all public textual outputs and derived discovery data.

## T-003: Change related reading

Change `related-reading.ts` for sidebar and Markdown. Their limits remain local.
Graph weights answer a different question, exposed as topic connections. Chronological
and series neighbours remain independent. Controlled-clock tests cover policy boundaries.

## T-004: Change identity facts

Edit `identity.ts` for name, email, and social URLs. Human and machine projections
derive the facts. Biographical rewrites remain audience-local. The identity mutation
build proves factual propagation rather than just searching for duplicate strings.

## T-005: Add a base page with Markdown

Add its HTML route and explicit Markdown path/builder, plus appropriate navigation
or discovery links. Build and commit the manifest. Representation coverage must include
its sibling and useful content; a manifest alone cannot guarantee that promise.

## T-006: Add a fifth post type

Add it to `POST_TYPES`, then supply its UI label and any intended presentation.
Schema, graph node type, and type route generation consume the shared vocabulary.
Verify empty and populated HTML/Markdown collections. No taxonomy framework is needed.

## T-007: Publish an ordered series

Author posts using `{name, part, total?}`. Series navigation and portable metadata
remain separate from global chronology. No baseline authored series exercises this;
new series behaviour requires focused fixtures. Declared `same_series` edges are not
implemented and must not be promised implicitly.

## T-008: Change theme or an article enhancement

Theme bootstrap, toggle, CSS, and storage-denial tests reflect distinct lifecycles.
Footnotes and other enhancements keep their own DOM state. Static content should remain
usable without JavaScript. Syntax and raw-output tests cannot replace focused browser
checks for changed interactions; browser launch was unavailable during this remediation.
