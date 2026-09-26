# Representative changes

Eight traces of likely product changes, reviewed 2026-09-26. These are source-based
impact traces, not implemented features. File counts describe authored edits or
named participants, not a score; generated artefacts are distinguished.

## T-001: Publish one more thought

Author edits: one new file in `src/content/blog/`. Generated tracked artefact:
`src/generated/route-manifest.json`. Areas crossed: publication, discovery,
machine-readable access; infrastructure handles this propagation automatically.

Participants: collection loader, blog route/layout, list/topic/type routes, search,
RSS, llms.txt, Markdown endpoint, graph loader/integration, manifest scanner.
Concepts: post, topic, date, graph snapshot, route pair.

Assessment: broad output fan-out is legitimate and usually invisible to the writer.
F-002 is the unexpected dependency: an old integration setup snapshot can overwrite
the graph after current content renders. The warm probe reproduced that failure.
A new topic is an implicit route identifier; current schema does not enforce slug safety.

## T-002: Keep a thought as a draft, then publish it

Desired author edits: one `draft` value. Required implementation touches: active
schema plus a public-selection owner and its consumers; current code has roughly
15 collection-read locations plus the integration's separate data-store path.
Areas crossed: publication, every public discovery/output surface.

Concepts: authored post versus published post, direct route eligibility, graph input.

Assessment: accidental amplification. There is no stable public-eligibility boundary,
so independently fixing route readers would scatter policy. The legacy schema adds
false reassurance. A named published-post set makes future embargo/preview decisions
locatable, without imposing a content service. Verify omission across outputs, not
merely the homepage. F-001 and F-002 interact here.

## T-003: Change how related reading is selected

Policy files: `blog/[...slug].astro`, `[...page].md.ts`, `graph-utils.ts`.
Presentation participants: `BlogSidebar.astro`, `RelatedPosts.astro`, `i18n/ui.ts`,
and Markdown further-reading serialization. Areas crossed: reading, discovery,
machine-readable access. Concepts: topic overlap, recency, pairwise proximity,
relationship meaning, presentation limit.

Assessment: three algorithms for similar labels make one change hard to predict.
This is stronger evidence than repeated array operations. Decide whether the surfaces
promise the same relationship before sharing policy. Correct sidebar duration units
regardless. A shared relevance contract should not absorb unrelated series navigation.
See F-003.

## T-004: Change the contact email or social profile URL

Intended factual edit: `src/data/identity.ts`. Current extra edits may be needed in
`src/data/about.ts`, `src/pages/about.llm.ts`, and
`src/pages/.well-known/ai-profile.ts`. Name changes additionally cross `src/consts.ts`.
Areas crossed: human trust pages, agent identity, structured data.

Concepts: identity fact versus biography, contact address, social link.

Assessment: output fan-out is legitimate; repeated factual edits are accidental.
Contact/privacy and JSON-LD already use shared constants, showing a stable owner
exists. Derive the remaining copies without centralising all narrative. F-004.

## T-005: Add a new base page with Markdown access

Author edits: a new `src/pages/<page>.astro`, optional page-local data, Markdown
`basePages` entry, and a builder/map entry in `staticMarkdown.ts`. Potential nav/footer
or discovery-index edits depend on the page purpose. Generated manifest changes
automatically after building and must be committed.

Areas crossed: page experience, portable output, agent discovery, deployment inventory.
Concepts: page content, representation, route pair, canonical URL.

Assessment: different renderers are necessary, but duplicated registration is hidden
knowledge. `/graph` demonstrates that HTML can exist without a promised Markdown
projection. Keep a clear completion step and a coverage assertion; a generic registry
would currently add another abstraction rather than clarify ownership. F-005.

## T-006: Add a fifth post type

Likely authored edits: active schema enum, `type/[type].astro` enumeration,
`i18n/ui.ts` label union/map, and `types/graph.ts` node union. Depending on desired
index behaviour, `type/index.astro` presentation also changes. Existing content
sets drive Markdown paths; new type data adds generated routes/manifest.
Areas crossed: publication vocabulary, discovery, graph API, presentation.

Concepts: stable kind identifier, display label, empty collection, portable graph node.

Assessment: a new domain kind legitimately affects projections. Do not infer that
all repeated enums warrant a generic taxonomy framework. Empty kinds reveal an
accidental difference: HTML exists before posts do, Markdown does not. Verify both
states and preserve identifier/display separation. Removing the legacy schema
prevents changing the wrong enum first (F-001).

## T-007: Publish an ordered series

Author edits: two or more posts with the active `{name, part, total?}` shape.
Participants: active schema, blog route passing all posts, `SeriesNav.astro`,
`BlogPost.astro`, and `markdownExport.ts`. No separate database or manual list.
Areas crossed: publication, reading, portable metadata. Concepts: named sequence,
part order, global chronological order.

Assessment: a healthy explicit concept; series ordering correctly lives separately
from publication chronology. The legacy schema/documented string shorthand misleads
writers. Graph `same_series` is merely a declared edge variant, not implemented
behaviour; publishing a series does not automatically create those edges.
Current authored posts have no series, so real-content behaviour is not exercised
by the baseline build. Keep fixture verification for the ordered navigation path.

## T-008: Change theme behaviour or an article enhancement

Theme files: `BaseHead.astro` bootstrap, `ThemeToggle.astro`, `global.css`, and
`test-theme-bootstrap.ts`. A footnote preview change instead touches
`footnoteTooltips.ts`, article CSS, its initialisation, and appropriate verification.
Areas crossed: reading presentation and optional browser state; authored content
and machine-readable output should not need changes.

Concepts: initial theme, explicit reader preference, system preference, native anchor.

Assessment: multiple theme participants reflect real timing constraints. Bootstrap
must precede paint; the toggle runs after the DOM exists; CSS covers no-JS system
preference. This is necessary coupling, unlike graph snapshot competition.
Do not introduce a global client store or common interaction lifecycle without
actual synchronisation pressure. Current syntax/bootstrap tests do not prove every
browser interaction or keyboard flow; use focused browser checks for changed behaviour.
