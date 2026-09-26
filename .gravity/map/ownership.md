# Decisions and state ownership

| Decision/state | Current owner | Boundary or ambiguity |
| --- | --- | --- |
| Post text and metadata | Writer's files, effective `src/content.config.ts` | Legacy schema disagrees; neither public selection nor active schema owns drafts |
| Public eligibility | No effective owner | All collection readers assume publishable; F-001 |
| Calendar interpretation | `normaliseCalendarDate`, active schema | Display date uses UTC; preserve both parse and display sides |
| Chronological neighbours | Blog route | Local product decision, distinct from series ordering |
| Series neighbours | `SeriesNav.astro` | Ordered within a named series, not global chronology |
| Sidebar recommendations | Blog route | Different from graph footer and Markdown; F-003 |
| Footer recommendations | `RelatedPosts.astro` using graph weights | Rendering also chooses limit; graph builder owns edge weights |
| Markdown further reading | `[...page].md.ts` | Independently ranks with a third recency policy |
| Topic graph rules | `graph-utils.ts` | Pure computation, clear owner |
| Current graph snapshot | Loader memory and integration closure | Competing computation, disk handoff, and output writers; F-002 |
| Mention suggestions | Integration setup hook | Optional derived output depends on serialised data-store availability |
| Contact/social facts | `identity.ts`, copied profile/context values | Intended owner exists but consumers bypass it; F-004 |
| Editorial biographies | `about.ts` and agent context text | Different audiences legitimately need different prose |
| Structured data shape | `structured-data.ts` | Component supplies origin and page descriptor; 404 exception deliberate |
| Markdown path coverage | Endpoint `basePages` plus topic/type/post sets | Independently maintained from HTML pages and builder map; F-005 |
| Route existence | Manifest scanner | Generated inventory, not route authoring policy |
| Accept choice/error status | Accept parser and root middleware | Runtime request policy, separated from output generation |
| Theme | Bootstrap, toggle, CSS | Bootstrap prevents flash; toggle owns interaction; CSS supplies no-JS system theme |
| Search index/results | Static list, then search page script | DOM is shared data source; no second network index |
| Browser interaction state | Specific script/component | Menus/tooltips/scroll have different lifecycles; keep local |
| Verification orchestration | `package.json`, scripts | Graph-page script builds before downstream output checks; ordering implicit |

Temporal constraints worth knowing:

1. Content synchronisation precedes rendering. Setup may see a data-store snapshot;
   render-time graph consumers use the collection. Finalisation must use current data.
2. The loader's disk file is a handoff to finalisation, not a trustworthy input for
   rendering a new build. Commit `1338494` fixed a stale-cache regression here.
3. Manifest scanning follows output generation. Middleware compiles separately;
   commit regenerated inventory after route/asset changes.
4. Output tests require a build. `test-graph-page.ts` performs it inside the current
   test chain. Running a downstream test alone can inspect stale `dist/`.
5. `graph-utils.test.ts` exists but is absent from the default test command. It was
   run separately for this review. Green default tests do not validate every policy.
