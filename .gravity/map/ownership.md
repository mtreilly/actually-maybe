# Decisions and state ownership

| Decision/state | Owner | Boundary |
| --- | --- | --- |
| Authored metadata | `src/content.config.ts` | One effective schema; draft defaults false |
| Public eligibility/access | `published-posts.ts` | Every public collection consumer uses it |
| Calendar interpretation | `calendar-date.ts`, schema, `i18n/format.ts` | Calendar days and UTC display preserve dates |
| Latest home selection | `latest-posts.ts` | Same ten-post selection for HTML/Markdown |
| Post kinds | `post-types.ts` | Schema and route generation share vocabulary |
| Chronological neighbours | Blog route | Distinct from named series order |
| Series neighbours | `SeriesNav.astro` | Ordered within a series |
| Sidebar/Markdown reading order | `related-reading.ts` | Shared policy, local display limits |
| Footer topic connections | Graph weights, `RelatedPosts.astro` | Separate relationship and label |
| Topic graph computation | `graph-utils.ts` | Pure node/edge/index/statistics projection |
| Current graph snapshot | `knowledge-graph-loader.ts` | Content-sensitive memory reuse, no disk authority |
| Public graph JSON | JSON endpoint | Sole serialization producer |
| Editorial mention suggestions | Integration build-finalisation | Reads completed JSON and always regenerates |
| Graph page selections | `graph-view.ts` | HTML/Markdown share groups and connected-post order |
| Identity facts | `identity.ts` | Name, contact, social, postal, origin facts |
| Editorial biographies | Human and agent page data | Audience-specific prose remains local |
| Structured data shape | `structured-data.ts` | Page descriptor plus shared identity graph; 404 excluded |
| Markdown content | Explicit endpoint/builders | Coverage/parity tests enforce intended siblings |
| Route inventory | Manifest integration | Generated and committed after building |
| Format choice/status | Accept parser, root middleware | Separate request/runtime boundary |
| Theme/search/interaction state | Specific DOM scripts and CSS | Static fallback, optional enhancement |
| Verification orchestration | `package.json`, scripts | Sequential mutation builds restore baseline |

Content synchronisation precedes render-time graph acquisition. Finalisation consumes
completed outputs, never an earlier setup snapshot. Tests that inspect `dist` need a
fresh build; the full chain includes one before output checks. Graph unit tests are
now included in that chain. Middleware compiles independently with NodeNext imports.
