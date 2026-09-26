# Concepts and their stability

| Concept | Representation and owner | Dependants | Assessment |
| --- | --- | --- | --- |
| Authored post | Markdown/MDX and `src/content.config.ts`, Astro collection | Every list, article, RSS, graph, Markdown, agent index | Stable central domain concept; public eligibility missing, F-001 |
| Published-post set | Currently implicit: all collection entries | Same consumers | Stable missing distinction; do not distribute draft rules amongst renderers |
| Calendar publication date | `calendar-date.ts`, schema coercion, UTC formatting in `i18n/format.ts` | Lists, chronology, archive, feeds, structured data, graph | Healthy timezone boundary; full timestamps and authored calendar days have different meanings |
| Topic | Raw string in frontmatter | Routes, search, graph, related-reading policies | Stable, but identifier doubles as label; arbitrary strings are not validated as URL-safe slugs |
| Post type | Four-value enum in active schema | Type routes, labels, graph node type, Markdown | Stable closed taxonomy with repeated enumeration; update consumers when adding a kind |
| Series | Ordered `{name, part, total?}` in active schema, `SeriesNav.astro` | Article navigation, Markdown metadata | Healthy specific concept; legacy string schema is misleading; no authored series currently exercises it |
| Graph node/edge | `src/types/graph.ts`, `graph-utils.ts` | Footer, graph page, JSON, metadata, suggestions | Useful projection; current edge builder implements only `shared_topic` |
| Build graph snapshot | Integration-local graph, loader memory, disk handoff | All graph consumers | Lifetime and ownership split; F-002 |
| Related reading | Sidebar selection, graph edge order, Markdown score | Three presentations | Similar appearance but conflicting policy; F-003 requires meaning before unification |
| Identity facts | `identity.ts` plus copies in `about.ts`, `about.llm.ts`, AI profile | Trust pages, JSON-LD, agent discovery | Stable facts deserve existing single owner, F-004; narrative need not become a generic profile model |
| Markdown document | `MarkdownDoc`, serializer, static page builders | `.md` routes, copy/download, negotiated access | Useful output contract; lossy source-body transformation is not a full MDX renderer |
| Route pair | Real HTML/Markdown siblings in generated manifest | Root middleware and checks | Healthy build/request boundary; pair existence does not prove semantic parity, F-005 |
| Reader preference | HTML theme attribute, system preference, optional localStorage | BaseHead, toggle, CSS | Healthy local ownership with unavoidable early bootstrap |
| UI language | `i18n/ui.ts`, `i18n/format.ts` | Components and DOM enhancements | Useful presentation boundary, partial adoption; site is English, not a multilingual routing system |

Useful gravity is concentrated in the post, identity facts, and output contracts.
The common folders are not a miscellaneous utility dumping ground: graph modules,
negotiation, date handling, and structured data each have recognisable purposes.
Reading-time estimates overlap with graph word counts, but different display and
statistics needs do not justify introducing a general text-processing framework.
