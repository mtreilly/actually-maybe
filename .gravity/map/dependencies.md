# Important dependency directions

These are architectural relationships, not an exhaustive import listing.

```text
Authored posts -> active collection schema -> Astro collection
  -> HTML article route -> BlogPost -> reading components + DOM enhancements
  -> local list/group routes + RSS + agent index
  -> Markdown endpoint -> post/static builders -> document serializer
  -> graph loader -> graph-utils -> graph types

Graph loader -> Astro collection (lazy import) + disk handoff
Graph integration -> internal Astro data store + devalue + graph builder
                  -> mention detector -> optional suggestions
                  -> disk handoff -> final graph JSON overwrite
BaseHead / BlogPost / graph page / JSON endpoint -> graph loader

Identity facts + human profile -> structured-data builder -> JSON-LD component
Identity facts -> contact/privacy data + agent endpoints
Human/page data -> HTML pages + static Markdown builders
UI text/date formatting -> components + browser enhancement scripts

Built outputs -> route-manifest integration -> committed JSON inventory
Root middleware -> inventory + Accept parser + 404 Markdown builder
                -> Vercel next/rewrite response helpers
```

## Useful boundaries

The Accept parser has no Astro/runtime dependency. Root middleware imports explicit
`.js` paths and JSON attributes to meet its separate NodeNext compilation boundary.
The graph algorithm imports Astro entry types, but no Astro runtime: computation
is independently testable. UI formatting does not mutate taxonomy identifiers.
Search depends on its own rendered DOM, not another page's implementation.

## Dependencies to watch

- Universal head metadata depends on loading the entire discovery graph. A new
  graph requirement affects all page builds, including trust anchors and 404.
- The integration knows Astro's internal serialisation shape whilst the loader
  uses the public collection API. Framework internals make graph changes harder
  to diagnose than the algorithm itself (F-002).
- Markdown routing knows each base page and delegates to another map that also
  knows each base page. HTML route existence is maintained separately (F-005).
- Identity outputs sometimes bypass the intended shared facts (F-004).

Source inspection found no architectural import cycle amongst these inspected
paths. This is not an automated whole-repository cycle proof. No shared utility
was found depending back on one of its UI consumers. Avoid introducing a generic
page/discovery service that makes these unrelated workflows depend on each other.
