# Concepts and stability

| Concept | Representation/owner | Assessment |
| --- | --- | --- |
| Authored post | Files and effective content schema | Durable source, not automatically public |
| Published-post set | `published-posts.ts` | Stable shared boundary excluding explicit drafts |
| Calendar date | Date utility, schema, UTC formatter | Healthy timezone-independent interpretation |
| Topic | Frontmatter string | Stable identifier; arbitrary URL-safe slug validation remains outside this fix |
| Post type | `POST_TYPES` and `PostType` | Closed vocabulary shared with empty-route generation |
| Series | `{name, part, total?}`, series navigation | Independent sequence; no baseline authored series |
| Graph node/edge | Portable graph types and pure builder | Shared-topic edges only; no implied backlinks |
| Current build graph | Content-sensitive loader snapshot | Current published inputs; endpoint owns serialization |
| Related reading | Shared topic/age ranking | Same selection across formats; limits are presentation |
| Topic connection | Graph overlap/date-proximity edge | Different from next-reading ranking |
| Identity fact | `identity.ts` | Single factual owner, separate narrative biographies |
| Markdown document | Builders and serializer | Useful portable projection; not a full MDX renderer |
| Route pair | Generated manifest | Existence inventory, complemented by semantic parity checks |
| Reader preference | Theme attribute, system preference, optional storage | Local ownership and early bootstrap |
| UI language | `i18n/ui.ts`, formatting | Presentation labels separate from taxonomy identifiers |

Share stable invariants that change together. Keep local archive/feed grouping and
separate renderers where their output needs differ. The graph is not a universal
post database; reading-time and graph statistics do not require a generic processor.
