# Review evidence and scope

Date: 2026-09-26

Source baseline: `20c5bea`, initially clean worktree

Tracking: beads `actually-maybe-g6r`

Objective: `quality-goals/software-quality-goal.md`

## Observation before classification

No `.gravity/` directory existed. Read the project instructions and existing audit
notes before drawing conclusions. Inspected the effective/legacy collection schemas,
post/list/topic/type/search/graph/Markdown routes, article composition, graph
algorithm/loader/integration, root middleware and manifest generation, identity
projections, locale/date utilities, theme/menu/footnote enhancement state, test
orchestration, deployment/toolchain configuration, and representative history.

History used for causality rather than judging size: `8029b71` introduced a
cold-build graph handoff after unavailable data-store failures; `1338494` stopped
the render loader reading an unvalidated previous graph. Recent accessibility
changes explain deliberate heading levels, UTC date handling, native fallbacks,
and separate presentation labels. These choices have useful owners and should
not be undone by mechanical consolidation.

The map records current behaviour. Accepted irregularities and necessity documents
protect justified complexity; active findings distinguish observed failure from
unsettled product meaning. Eight traces connect findings to likely future changes.
One grace candidate removes competing ownership rather than splitting files.
No runtime implementation was changed by this review.

## Executed verification

Used `.nvmrc`: Node 24.21.0. Installed pnpm is 12.3.4.

- Middleware compilation: `node_modules/.bin/tsc -p tsconfig.middleware.json` passed.
- Baseline `node_modules/.bin/astro build` passed, 15 posts and 43 topic edges;
  80 generated pages, 79 HTML routes inventoried, and 76 HTML/Markdown pairs.
  The scanner does not list the standalone `404.html` as an HTML page route.
- Executed every test script in the `package.json` test chain through the installed
  `node_modules/.bin/tsx`. All passed, including the graph-page script's build,
  middleware/header negotiation harness, agent readiness, generated-script syntax,
  locale/date tests, storage-denied bootstrap, and all 80 page heading outlines.
- Separately executed `src/lib/__tests__/graph-utils.test.ts`; it passed but is not
  included in `pnpm test`.
- `/opt/homebrew/bin/biome check .` exited successfully with 234 existing warnings
  and seven informational diagnostics; no fixes were applied. Several unused-import
  warnings concern identifiers used in Astro templates, so mechanical removal would
  be unsafe. This is not a warning-free lint claim.
- The normal `pnpm test` entrypoint and an `npm test` attempt both stalled before
  executing tests at pnpm's lockfile supply-chain verification. Their observed
  live processes were stopped; no dependency bypass configuration was committed.
  Passing installed tools does not certify a fresh installation or pnpm policy gate.

The scripts can be reproduced after switching Node with `nvm use`. Run the compiler,
then `tsx` on the test scripts in the order given by `package.json`; the graph-page
script performs the build required by subsequent output tests. Do not run the
build-dependent checks against old `dist/` and treat that as current evidence.

## Publication and changed-content warm-build probes

Two temporary posts used ID `gravity-review-draft-probe`, a valid title/description,
`pubDate: 2026-09-26`, `type: note`, and `draft: true`. First used an isolated topic;
second used the existing `ai` topic so graph HTML would expose the relationship.
Each was written only after checking the path did not exist, built, inspected,
then removed in a `finally` block and followed by a baseline rebuild.

Observed with the first probe:

| Surface | Result |
| --- | --- |
| Direct HTML article | Exists |
| Direct Markdown article | Exists |
| RSS | Contains the draft slug |
| Final graph JSON | Does not contain the new slug |

Observed with the second probe:

| Surface | Result |
| --- | --- |
| Search HTML and llms.txt | Both contain the draft slug |
| Graph HTML | Contains the new slug |
| `.astro/graph-cache.json` render handoff | 16 nodes, includes new slug |
| Final `dist/data/graph.json` | 15 nodes, omits new slug |

Build logs show setup found 15 posts whilst routes for the temporary post and topic
were generated. The endpoint/render loader wrote current content to the handoff;
finalisation retained its earlier integration snapshot and wrote over the output.
This demonstrates F-001 and F-002 together. The missing draft in final JSON is a
stale-snapshot symptom, not evidence of a working draft exclusion rule.

To reproduce on an isolated checkout: build the baseline, add a uniquely named
valid post with `draft: true` and an existing topic, build again without clearing
`.astro/`, then compare direct routes, RSS, graph HTML, cache nodes, and final JSON.
Always remove the fixture and rebuild afterwards. Do not deploy probe content.

## Graph-input-cold baseline build

After removing the second fixture, moved `.astro/data-store.json` and
`.astro/graph-cache.json` to a temporary backup outside the repo, then built again.
The integration logged its missing-data-store deferral; final graph JSON had the
correct 15 baseline nodes. This proves that fallback path with graph input caches
absent. It is not a fresh dependency install or a fully fresh checkout experiment.

The setup hook skips mention suggestion generation on this path. That follows
directly from the early return in the source; this review did not inject a sentinel
suggestion file. Baseline authored files and tracked generated manifest were
restored exactly; probes left no source changes.

## Representation comparison

Compared manifest `htmlRoutes` with `markdownRoutes` keys: missing counterparts
were `/graph`, `/type/guide`, and `/type/link`. Counted homepage post title headings
and Markdown list items: ten versus eight. Sources confirm the Markdown home builder
slices without chronological sorting. Confirmed search Markdown mentions a command
palette whilst Header actually navigates to the search page. These are semantic
output discrepancies that today's green negotiation checks do not establish away.

## Limits

This is a repository architecture review, not a security scan or performance audit.
No live deployment, external account, or production requests were changed. No browser
hot-reload, arbitrary topic identifiers, or MDX component-fidelity experiment was
performed. The existing negotiation harness simulates hosting and does not prove
live Vercel behaviour. Inline-script parsing and theme bootstrap VM checks are
narrow evidence, not full interaction E2E coverage. No numerical quality score,
exhaustive import census, or whole-repository cycle proof is claimed.

## Maintenance

Read `.gravity/README.md` before changing these boundaries. When implementing a
finding, record its changed ownership and verification, move it from active to a
resolved history file, and update affected map/trace entries. Preserve accepted
irregularities unless their revisit trigger supplies new evidence. Add machine-readable
indexes only if a real consumer needs them; Markdown contains the necessary nuance.

## Completion audit against the requested review

| Requirement | Persistent evidence |
| --- | --- |
| Observe product, state, APIs, tests, shared modules, dependencies, and history before judgement | Scope/history above; four maps tie observations to inspected source owners |
| Recover actual natural architecture and centres of gravity | `map/system.md`, `map/concepts.md`, README |
| Trace approximately 5–10 representative changes | Eight named traces in `traces/representative-changes.md` |
| Investigate suspicious structures rather than judging size | Warm/cold graph experiments, effective schema lookup, three ranking comparisons, identity/output traces |
| Classify genuine problems, necessary complexity, and healthy irregularities | Five structured active findings, six accepted irregularities, necessity document |
| Identify high-leverage interventions without speculative rewrites | One explicitly unimplemented grace candidate, five prioritised next actions |
| Preserve knowledge in the repository | Twelve populated `.gravity/` documents, linked from AGENTS.md; no empty placeholder directories |
| Keep history and existing research | Existing audit notes unchanged; relevant graph fixes documented with commit IDs; no previous `.gravity/` existed |
| Concise final synthesis including all requested categories | README covers architecture, gravity, friction, healthy irregularities, premature/missing concepts, necessity, grace, things to preserve, and next actions |
| Verify evidence and distinguish uncertainty | Build/typecheck/tests, draft/graph probes, output comparisons, and explicit limits above; recommendations do not claim fixes |

Local verification also checked internal document links, all required finding fields,
eight trace entries, absence of the temporary fixture, and the restored 15-post graph.
The final agent-readiness check passed against the restored output. The tracked
manifest has no probe paths and matches its baseline. No runtime changes or
implementation of the recommendations are required to complete this review scope.

## Subsequent implementation

The five findings were implemented after this review. See the
[implementation audit](implementation.md) and [resolved history](findings/resolved.md)
for current ownership and verification limits. The evidence above describes the
original reviewed revision and is retained as history.
