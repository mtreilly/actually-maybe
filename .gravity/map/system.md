# The system as it exists

## Publish a thought

`src/content/blog/` currently holds 15 Markdown posts. `src/content.config.ts`
uses Astro's glob loader and validates title, description, calendar dates,
topics, post type, image, and an optional ordered series. Defaults allow empty
topics and a note type. `src/content/config.ts` is an older, conflicting schema;
the installed Astro searches the root content configuration first.

Every public consumer calls `getCollection("blog")` without a draft predicate.
Writing a file is therefore publication, even when it has `draft: true`.
HTML routes use `render(post)`; Markdown exports read the source body and strip
some MDX syntax with regular expressions. There are no MDX posts in the current
sample, so that sanitiser's future component fidelity is unproven.

## Read and discover

`src/pages/blog/[...slug].astro` owns post route enumeration, chronological
neighbours, and sidebar ranking. `src/layouts/BlogPost.astro` composes article,
metadata, series, reading time, responsive TOCs, navigation, copy menu, and graph
relationships. `PostItem.astro` is a small list projection with explicit heading
level to fit its host outline.

Home, blog, archive, topic, and type pages derive their selections locally.
RSS is also derived from the collection. Search builds a full HTML index, then
Fuse searches the rendered titles, descriptions, and topic data in the browser.
It clones the existing list items for results instead of maintaining another
content index. Cmd/Ctrl+K navigates to `/search/`; there is no command palette.

## Connect ideas

`graph-utils.ts` projects collection entries into `PostNode`s, joins posts sharing
topics, weighs those edges, indexes topics, and computes statistics. The current
edges express shared topics, not explicit links/backlinks or body mentions.
`RelatedPosts.astro` shows graph neighbours; `/graph` renders topic groups and
connected posts as HTML with native details panels.

`knowledge-graph-loader.ts` owns a module-memory cache and writes a disk handoff.
Separately, the integration tries an Astro serialised data store during setup,
builds or reuses a graph, and writes optional mention suggestions. After rendering
it writes `dist/data/graph.json`, using its setup snapshot if present or the disk
handoff otherwise. The JSON endpoint already produced that same output path.
See F-002 for why this duplicated ownership matters.

## Establish identity and trust

`src/data/identity.ts` supplies contact, social profiles, postal country, and agent
guidance. `about.ts` supplies the human profile; contact/privacy/now/projects have
page-specific data. HTML and Markdown use much of this shared data. The JSON-LD
builder emits shared identity nodes plus a page-specific node; 404 deliberately
has none. Agent context endpoints also contain independent narrative/fact copies.

## Serve multiple representations

`[...page].md.ts` enumerates Markdown paths independently of HTML routes.
`markdownExport.ts` serialises post/document metadata; `staticMarkdown.ts`
projects non-post content. The route-manifest integration scans real build outputs
and commits the resulting pairs/existence inventory into `src/generated/`.

Root `middleware.ts` uses that inventory and the dependency-free Accept parser
at request time. Vercel deploys static files plus this request boundary; Astro
page endpoint `GET`s execute at build time here. Negotiation is not a live content
API. Vercel configuration supplies deployment/toolchain settings and static headers.

## State and errors

Authored files and page data are durable source state. `.astro/` caches are derived
build state; `dist/` and `.vercel/` are output. The route manifest is derived but
tracked because middleware deployment consumes it. Browser theme preference is
stored in localStorage with denial recovery; menus, footnotes, and scroll position
are local DOM/module state. There is no shared application store or event bus.

Graph loading failures are tolerated by the layout/head and graph page; the JSON
endpoint emits an error body, and the integration can fail the build. These are
different output responsibilities, but a successfully rendered page does not
prove graph generation succeeded. Tests inspect the emitted JSON as well.
