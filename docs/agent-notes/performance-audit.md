# Reader performance audit, 26 September 2026

The goal is predictable loading, navigation, search, and reading, without adding runtime architecture to a static blog.

## Evidence and changes

- Initial production build: 80 HTML pages in 1.02 seconds. Build-time graph preparation took 4 ms for 15 posts and 43 connections. These are not current bottlenecks.
- Inline search scripts contained an unbundled Fuse import and TypeScript assertions. Search now runs as a bundled script on `/search`, using the HTML index as its catalogue. Cmd+K navigates there; ordinary links work without JavaScript. This removes the full catalogue and modal from every page.
- Posts eagerly imported Sonner from multiple initialisers, even though no React renderer mounted the notification component. The 45.62 KB library bundle is gone from the client build and network requests. Copy feedback uses button text or a live status paragraph.
- Heading and code-copy initialisers no longer run both on module import and from the layout. TOC highlighting now shares one scheduled scroll handler with the mini TOC, resolving headings once and changing link classes only when the active section changes.
- On a 375 px post, initially expanded navigation collapsed after script startup: measured CLS 0.2908. Starting collapsed when JavaScript is enabled reduced measured CLS to 0. The navigation remains expanded without JavaScript.
- The mini TOC contained TypeScript in an inline script, and CSS overrode its `hidden` attribute. Both are corrected.
- Final observed post script: 7.07 KB, 2.60 KB gzip. Search script: 19.13 KB, 7.00 KB gzip, requested only on search.

## Chrome checks

Chrome DevTools MCP fails with a closed target. The Chrome extension connection works. Measurements below are local preview observations, without mobile network or CPU throttling; they are not production field measurements.

| Page and viewport | FCP | LCP | CLS |
| --- | ---: | ---: | ---: |
| Post, 375 × 812 | 224 ms | 224 ms | 0 |
| Home, 1440 × 1000 | 132 ms | 132 ms | 0 |
| Search, 1440 × 1000 | 68 ms | 68 ms | 0.0027 |

Search matching, no-match feedback, clearing with keyboard, markdown copy, mobile navigation, mini TOC opening/closing, theme toggle, and no-JavaScript search/navigation were exercised. No page console warnings/errors were captured in checked pages. No horizontal overflow was observed at 375, 768, or 1440 px.

A local Node Fuse benchmark used representative titles, descriptions, and topics, 30 queries per size, and a limit of 20 rendered results. Observed p95 query times: 50 posts, 3.0 ms; 500 posts, 2.5 ms; 1,000 posts, 4.1 ms. This checks search computation, not browser rendering or low-end devices. Keeping the static full index preserves no-JavaScript access; result rendering is bounded.

`pnpm build` and `pnpm test` pass on Node 24. The new browser-script regression check parses 255 inline scripts across 80 built pages, catching syntax failures that a build alone misses.

## Throttled and growth verification

Chrome was checked at 375 × 812 with 4× CPU slowdown, cache disabled,
150 ms latency, 200,000 bytes/s download, and 93,750 bytes/s upload.
Network instrumentation was enabled before measuring: font requests took
approximately 470–493 ms, confirming throttling affected resource loading.

| Page | FCP | LCP | CLS |
| --- | ---: | ---: | ---: |
| Search | 544 ms | 672 ms | 0 |
| Long Drone 101 post | 840 ms | 840 ms | 0 |

Typing `robotics` returned the expected post with throttling active. The long
post had no horizontal overflow and no captured console warnings/errors.
These are laboratory observations on this machine, not field percentiles.
Browser throttling and viewport overrides were reset afterwards.

An isolated checkout duplicated representative existing posts without changing
published content. A fresh build with 50 posts and 558 graph connections
rendered 115 pages in 1.21 seconds. A build with 500 posts and 56,073 connections
rendered 565 pages in 6.30 seconds. Both finished successfully. The temporary
checkout was removed after measurement.

Graph generation alone, using repeated representative topic distributions,
took 1.28 ms at 50 posts, 44.07 ms at 500 posts, and 160.30 ms at 1,000 posts.
The corresponding compact JSON sizes were about 109 KB, 9.1 MB, and 35.9 MB.
Retaining every shared-topic connection makes the graph export grow
quadratically for dense topic distributions. This is intentional data fidelity,
not a reader load dependency: graph generation remains at build time, and
readers request the export explicitly. The measured 500-post full build shows
no current reason to complicate the graph algorithm or its caching.
`graph-utils.test.ts` also passed when run separately.

## Remaining verification

- Run Lighthouse and Biome. Neither is installed in this repository; attempted tooling installation failed because registry DNS could not resolve.
- Remove the unused Sonner dependency when dependency tooling is available. `pnpm remove` failed with registry DNS errors, and offline removal lacks cached dependency metadata. No package/lock changes were made by that attempt.
- The committed root lockfile currently lists only pnpm itself; the installed dependency lock is under `node_modules/.pnpm/lock.yaml`. This predates this audit and needs verification before dependency changes.

The goal remains active pending broader verification. Current measurements justify these changes; they do not prove production network or device performance.
