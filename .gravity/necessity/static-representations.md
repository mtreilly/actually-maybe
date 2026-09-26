# Static publishing with multiple representations

## Why the problem has real complexity

A build can prepare HTML, Markdown, graph JSON, RSS, and identity files, but cannot
know a future request's Accept header. The project has two timescales: publishing
at build time, and format selection at request time. Removing that distinction
would either lose negotiation or require a live content service.

Root middleware therefore has an independent compilation/runtime boundary. Its
NodeNext imports use explicit extensions and a JSON import attribute. The committed
manifest lets it choose known prebuilt siblings without runtime filesystem/content
access. Extensionless files need explicit static-host content types; cache variation
must include Accept. Parser handling of media ranges, specificity, rejection, and
q-values belongs to the protocol, not an overengineered domain layer.

## Unavoidable complexity

- Different output serializers and actual route pairs.
- A build-generated route inventory shipped with request middleware.
- Correct status and cache headers plus usable missing-path responses.
- Separate verification of compiled middleware and built files.
- Calendar-day normalisation/display independent of build-machine timezone.
- Raw HTML reading/search/navigation content and optional interaction enhancements.

The toolchain pins and build-script allow-list also exist to make local and deployed
builds agree. They are deployment constraints, not product settings to expose.

## Complexity that remains accidental

The dual graph snapshot pipeline is not necessary for static publishing. Neither
are the legacy schema, duplicated factual identity, or independently drifting
content selections. A manifest derived from outputs should not be mistaken for
proof that intended Markdown projections exist. The local negotiation harness
simulates static serving; it is not a live Vercel deployment check.

## Simplifications considered

- Move negotiation into an Astro build-time middleware: cannot inspect future
  request headers in this static design; preserve the root boundary.
- Read a persistent graph cache for every renderer: previously caused stale graphs
  (commit `1338494`); disk handoff is not content authority.
- One universal renderer/page registry: would force unlike presentation needs into
  a schema; keep explicit projections and share only genuine content facts/policies.
- Fetch all content client-side: removes the static fallback and adds runtime work;
  search already enhances the rendered index instead.

Evidence: `middleware.ts`, `accept-negotiation.ts`, `route-manifest.ts`,
`vercel.json`, `tsconfig.middleware.json`, date utilities, and negotiation/output tests.
These explanations describe repository constraints; they do not certify current
external platform policy beyond what was inspected locally.
