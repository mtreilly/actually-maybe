# Examined and accepted irregularities

Reviewed 2026-09-26. These are not blanket exemptions; revisit at the stated trigger.

## A-001: Route-local sorting and grouping

Classification: Reasonable trade-off / stable small duplication

Status: Accepted

Confidence: High

Home, archive, topic, and feed routes sort/filter collection entries directly.
They have different selections and output shapes. A generic content repository
would obscure straightforward operations whilst linking independently evolving
views. Keep these local. A publication-eligibility rule is different: it is a shared
invariant, not a display choice (F-001).

Revisit if several routes acquire the same nontrivial selection rule or changing
chronological behaviour requires repeated coordinated fixes.

## A-002: Separate HTML and Markdown renderers

Classification: Necessary projection difference

Status: Accepted

Confidence: High

HTML is semantic UI; Markdown is a portable reading/document format. Shared page
data already supports both without a universal rendering schema. Preserve explicit
builders and templates. F-005 concerns missing coverage and unintended differences
in data selection, not different markup.

Revisit when the same factual content is repeatedly copied rather than projected,
or a specific page gains enough shared editorial structure to warrant page-local data.

## A-003: Desktop and mobile TOC presentations

Classification: Productive duplication

Status: Accepted

Confidence: High

`TableOfContents.astro` and `MiniToc.astro` both consume rendered heading descriptors,
but have different viewport/interaction requirements. They already share the stable
input concept. Do not combine them through a mode-heavy TOC component merely to
remove similar loops. Native anchors remain useful without scroll highlighting.

Revisit if heading filtering or naming starts diverging unintentionally.

## A-004: A large article layout with one coherent purpose

Classification: Locally contained composition

Status: Accepted

Confidence: High

`BlogPost.astro` owns the article shell and its styles. Its size alone is not a
reason to split it. Reading the composition in one place helps explain the user
experience. Graph I/O and upstream recommendation policies are meaningful seams;
extracting arbitrary style blocks is not.

Revisit when an independent product workflow starts sharing/changing this layout,
or presentation changes demand understanding unrelated state machinery.

## A-005: Small browser scripts and deliberate theme bootstrap duplication

Classification: Necessary lifecycle difference / benign local state

Status: Accepted

Confidence: High

An early inline theme bootstrap prevents a flash before body content; the toggle
later handles user interaction and storage recovery; CSS supplies a no-JS theme.
Menus, footnotes, and reading progress own their own DOM state. There is no evidence
for an application store, event bus, or frontend framework.

Revisit on actual partial-navigation lifecycle problems or repeated synchronisation
between features, not merely because several modules hold local variables.

## A-006: A JSON graph separate from Astro collection entries

Classification: Healthy boundary

Status: Accepted

Confidence: High

`PostNode` removes renderer-specific image/date/collection details and gives a
portable graph output. Consumers that need the whole authored post can use the
collection instead. Do not make the graph the universal post database.

`mentions_topic` and `same_series` currently exist in the edge type without builders;
these are contained speculative vocabulary, not permission to implement extra features.
Revisit on a real consumer needing those edge meanings or graph performance pressure.
