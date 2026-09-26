# Active architectural findings

These are researched recommendations, not completed implementation tasks.
Reviewed 2026-09-26. See [verification](../review.md) and [change traces](../traces/representative-changes.md).

## F-004: Shared identity facts still have independent copies

Classification: Stable duplication / ambiguous ownership (locally confusing)

Confidence: High

Area: Identity and trust

### Observation

Contact/privacy pages and several identity outputs use `identity.ts`. The human
profile still embeds email/social URLs; agent context embeds the name and contact
address. `SITE_TITLE` separately repeats the author name. The AI profile contains
additional fixed identity/narrative values. Some prose appropriately differs by audience.

### Why it matters

Changing an email or profile URL in the designated owner leaves some public
representations stale. A developer must inspect human, agent, and structured-data
surfaces despite the documented single-source contract. This is legitimate
cross-output projection with accidental repeated facts.

### Evidence

- `src/data/identity.ts`: stated single source of truth and shared constants.
- `src/data/about.ts`: `elsewhere.links` contains independent mail/social URLs.
- `src/pages/about.llm.ts`: literal name/contact text.
- `src/pages/.well-known/ai-profile.ts`, `src/consts.ts`.
- `src/lib/structured-data.ts`: person name comes from about, contact from identity.

### Recommendation

Derive repeated email/profile/name facts from existing data owners. Keep editorial
biographies and audience-specific context separate. Test changed facts across both
human and machine outputs rather than asserting only today's fixed strings.

### Do not do

Do not merge every identity narrative into a generic profile schema, add localisation
infrastructure for a single name, or invent new personal facts during this review.

### Revisit when

A contact or profile change requires one factual edit and every output reflects it.

## F-005: Markdown route and content promises have parallel owners

Classification: Structural problem / change amplification (confusing)

Confidence: High

Area: Machine-readable access

### Observation

Base routes are enumerated in the Markdown endpoint and dispatched by a separate
builder map. HTML pages live in filesystem routes. The manifest records only pairs
that exist. Current output has HTML but no Markdown sibling for `/graph`,
`/type/guide`, and `/type/link`. HTML enumerates all four kinds; Markdown enumerates
only kinds with posts and its type builder rejects empty lists.

Home renders ten recent posts; Markdown slices eight without sorting its inputs.
Search HTML offers every post; its Markdown projection refers to a nonexistent
command palette and does not include that index. Existing documentation advertises
Markdown on every route and some obsolete assistant-launcher behaviour.

### Why it matters

Adding or changing a page requires finding route enumeration, content builder,
HTML template, and sometimes documentation. Negotiation can advertise available
pairs correctly whilst missing the intended capability. Successful status/header
checks do not prove readers and agents receive equivalent useful content.

### Evidence

- `src/pages/[...page].md.ts`: `basePages`, type enumeration, independent ranking.
- `src/utils/staticMarkdown.ts`: `builders`, `buildHomeDoc`, `buildTypeDoc`, `buildSearchDoc`.
- `src/pages/index.astro`, `search.astro`, `graph.astro`, `type/[type].astro`.
- `src/integrations/route-manifest.ts`: inventory from actual output, not completeness policy.
- Built manifest: 76 Markdown pairs, 79 listed HTML routes; built homepage counts 10/8.
- README and graph usage guide claim capabilities the current code does not implement.

### Recommendation

Complete promised useful projections, including empty type pages and graph/search
content, and explicitly align homepage selection/order. Keep content selection
policy shared only where both formats promise it. Add output-level parity checks
for representative pages and correct documentation to match implementation.

### Do not do

Do not replace filesystem routing with a generic page DSL or require every HTML
layout detail to survive Markdown. Do not alter the working negotiation parser
to hide missing build outputs.

### Revisit when

Coverage and semantic selections match the actual contract across populated and
empty collections; adding a base page has an explicit Markdown completion step.
