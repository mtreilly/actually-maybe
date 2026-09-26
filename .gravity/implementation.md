# Architectural remediation audit

Date: 2026-09-26. Tracking: `actually-maybe-ni9`.
The [original review](review.md) records the before state. This audit covers the
original five outcomes, not a repository-wide certification.

## Requirement evidence

| Requirement | Current owner/change | Verification |
| --- | --- | --- |
| F-001: one schema and public eligibility, drafts absent everywhere | Effective `content.config.ts` and `published-posts.ts`; obsolete schema deleted, public readers use boundary | Eligibility unit tests and actual cold/warm draft builds inspect every textual public output, filenames, direct HTML/Markdown absence, graph, suggestions, sitemap, RSS, agent indexes, and manifest |
| F-002: current graph for rendering, JSON, suggestions | Content-sensitive loader; endpoint sole JSON writer; finalisation reads completed JSON for suggestions | Loader lifetime tests; cold additions, warm addition, title/topic/excerpt edit, removal; graph HTML, article metadata, JSON nodes/edges/topics, suggestions, direct files, and manifest assertions |
| F-003: meaningful related-reading policies | Shared sidebar/Markdown ranking; distinct labelled graph topic connections | Controlled-clock tests at 365-day boundary, overlap, ties, exclusions, nonmutation; output order parity across 15 posts |
| F-004: repeated factual identity derives from shared owner | `identity.ts` owns name/contact/social/origin; biographies remain local | Single-owner mutation build changes name/email/all four social URLs, verifies propagation and absence of old facts across human/machine outputs, restores exact source |
| F-005: useful promised Markdown | Graph projection; empty known types; complete search index; shared latest ten home selection; corrected capability docs | Coverage across all 79 content routes, ordered home/search/graph parity; unordered/empty/unknown unit fixtures; middleware and negotiation harness cover new siblings |

## Preserved constraints

- Static Astro output and separate root request middleware remain. No application
  database, client framework, generic registry, or broad directory move was added.
- Calendar normalisation and UTC formatting remain; locale/date tests pass.
- Middleware NodeNext compilation, explicit imports, JSON attribute, runtime,
  static headers, and generated manifest boundary remain; compiler and negotiation
  tests pass. The harness is not a live Vercel deployment test.
- Raw HTML provides reading, navigation, and search content. Output checks prove
  text and semantic heading structure without requiring script execution. Existing
  theme storage-denial and client syntax tests pass. These checks do not prove every
  keyboard interaction, no-JavaScript browser flow, contrast, or responsive layout.
- All six [accepted irregularities](findings/accepted.md) remain. Specific shared
  selections replace observed drift without collapsing separate renderers, TOCs,
  graph nodes, navigation meanings, or browser lifecycles.
- Fixtures and test identity are removed/restored in finally blocks; the baseline
  build has 15 posts and 79 content route pairs. The generated manifest is committed.

## Checks and reproducibility

Pinned Node: 24.21.0, selected using `.nvmrc`. Package manager remains pinned to
12.3.4; no toolchain/dependency upgrade was made.

All 21 configured `package.json` test steps passed in their configured order using
installed executables: the middleware step with `node_modules/.bin/tsc -p
 tsconfig.middleware.json`, and each test with `node_modules/.bin/tsx <path>`.
Root `node_modules/.bin/tsc --noEmit` also passed. Mutation regressions perform
fresh actual Astro builds and restore a final baseline build. Builds complete well
within the 60-second budget on this machine.

The final test transcript was written to `/tmp/actually-maybe-ni9-final-tests.log`.
`biome check .` exited successfully with 233 warnings and seven informational
messages, including existing Astro template unused-variable diagnostics. No unsafe
repository-wide fixes were applied. `git diff --check` and knowledge-base local-link
checks passed.

## Unavailable verification

The ordinary `pnpm test` entrypoint stalled at pnpm's supply-chain metadata
verification (`Verifying lockfile`, 524 entries). That specific process was stopped;
the same configured test chain was executed directly with installed tools. This
proves those tests, not a fresh installation or completion of pnpm's policy gate.

Bundled and system Chrome failed to start the owned automation session, exiting
before a usable page/DevTools endpoint. Browser checks at 375/768/1440 pixels,
interactive keyboard checks, browser no-JavaScript/dark-mode checks, console audits,
and Lighthouse performance/accessibility scores remain unverified. There is no
claimed visual certification or live deployment. The objective explicitly requires
unavailable verification to be distinguished from passing evidence.

## Delivery

Implementation commits: `93da649` (publication), `c4d7816` (graph), `7eac5b2`
(related reading), `dd7b431` (identity), and `456e746` (representations).
Follow-up commits cover strengthened cold/warm regressions and the current
architectural knowledge. All five original findings are recorded in
[resolved history](findings/resolved.md); none remains active from this review.
