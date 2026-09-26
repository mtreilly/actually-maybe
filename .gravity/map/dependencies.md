# Important dependency directions

```text
Authored files -> effective schema -> Astro collection -> published-posts
  -> article/list/search/RSS/agent routes
  -> Markdown endpoint -> page/post builders -> serializer
  -> graph loader -> node projection -> graph builder -> graph types

Head / article / graph page / JSON endpoint -> current graph loader
Graph HTML + Markdown -> graph-view selections
JSON endpoint -> completed public graph.json
Build finalisation -> completed graph.json -> mention detector -> editorial suggestions

HTML sidebar + Markdown further reading -> related-reading policy
Home HTML + Markdown -> latest-post selection
Schema + type routes + graph types -> post-type vocabulary

Identity facts -> human profile / machine profiles / page data / structured data
Page data -> HTML templates + Markdown builders
UI text/date formatting -> components + optional DOM scripts

Built outputs -> manifest scanner -> committed route inventory
Root middleware -> inventory + Accept parser + 404 Markdown builder
                -> Vercel response helpers
```

The Accept parser remains dependency-free. Middleware imports explicit `.js` paths
and JSON attributes for its separate NodeNext compilation. Graph computation uses
collection types without requiring Astro runtime; collection access lives in the
loader/publication boundary. The integration no longer parses internal Astro storage
or uses `devalue`; the package declaration was left unchanged rather than widening scope.

Universal head metadata still needs the discovery graph. Explicit Markdown route
registration remains a maintenance boundary, now checked against every content route.
Source inspection is not a whole-repository import-cycle proof. Avoid a generic
page or discovery service that couples otherwise independent workflows.
