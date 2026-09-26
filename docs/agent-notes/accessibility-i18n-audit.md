# Accessibility and localisation review

Worktree: `../actually-maybe-accessibility-i18n`, branch `quality/accessibility-i18n`.
Tracking: `actually-maybe-zxb`.

## Barriers addressed

- Closed mobile navigation was visually hidden but its links remained focusable.
  It now uses `inert`, and Escape closes it and restores focus to its toggle.
- Several controls removed focus outlines. Global visible focus styling preserves
  the keyboard indicator, including code-copy controls previously visible only on hover.
- Search updated results without announcing them. A separate polite status announces
  results and recovery advice without reading the entire result list.
- Heading-copy actions were mouse-only. Each heading now keeps its heading semantics
  and exposes a labelled keyboard-operable button.
- Code-copy success and failure now announce through a live region. Clipboard
  failures provide manual-copy advice. Escape from the markdown panel restores focus.
- Reduced-motion styling removes transitions and animations across components.

## Localisation boundaries addressed

- Dates use a shared formatter with the Irish English locale and UTC calendar-day
  interpretation, avoiding build-machine time-zone shifts.
- Graph dates and related-post dates use the same formatter.
- Presentation sorting uses an explicit locale-aware collator.
- Reading durations use Intl unit and number formatting.
- Dynamic search, copy feedback, and generated accessible names live in meaningful
  UI resources. Stable action identifiers and exported ISO timestamps remain semantic.

## Evidence and remaining work

Node 24 Astro build, middleware TypeScript compile, and generated inline browser-script
syntax checks pass. Formatting tests exercise opposite time zones, German dates,
Swedish/German collation, and Arabic numbering.

This is not a completed audit. Runtime keyboard, accessibility-tree, clipboard failure,
mobile/zoom, dark-mode, and reduced-motion checks remain. Playwright MCP cannot launch
because its configured Chrome-for-Testing binary is missing; Chrome DevTools MCP
returned Target closed. These are tooling observations, not evidence of usable UI.

Review still needs to cover static navigation labels and page copy boundaries,
markdown no-JavaScript recovery, storage-disabled theme controls, long text and RTL,
forms and unused components, contrast, and full regression checks. No translated blog
content or language switcher is required by the goals; adding another locale should
require presentation resources and formatting changes rather than domain changes.

## Follow-up: native recovery and theme operation

Removed single-character shortcuts and their unfocused custom modal. These keys
could interfere with assistive navigation, had duplicate initialisation, and the
modal contradicted the project's no-modal policy. Header Cmd/Ctrl+K search remains.

Theme initialisation and changes tolerate unavailable storage. The dark-mode
button exposes its pressed state, hides decorative SVGs from assistive technology,
has a 44px target, and is hidden when JavaScript is unavailable.

Markdown options retain native summary semantics and a plain Open markdown link.
Without JavaScript, the details element opens the link and hides copy buttons;
with JavaScript, the link also provides recovery from denied clipboard access.
Shared navigation names and labels now live in UI resources. Footer branding no
longer uses address semantics for text that is not contact information.

A fresh Node 24 build, generated-script check, calendar/locale tests, and agent
readiness checks pass after these changes. A standalone Playwright runtime check
was prepared using the cached Playwright package and each installed Chrome
executable. Both browser launches terminated before any test ran. No keyboard,
no-JavaScript, or theme runtime pass is claimed from that attempt. Continue with
another available browser surface or repair browser launching before completion.

## Runtime evidence through Chrome extension

The computer-use Chrome extension successfully opened this worktree's preview at
`http://localhost:4322/search/`. Searching for robotics exposed the expected post
and `1 post found.` in the native accessibility tree. At 375 × 812, collapsed
navigation links were absent from that tree. Tab from Toggle navigation focused
the search field. Enter opened the menu; Escape from Topics closed it and
restored focus to Toggle navigation. The temporary viewport was reset and the
review tab closed. This resolves the browser-access obstacle for ordinary UI
checks, although standalone Playwright launch failures remain.

Further inspection found that the mobile sections panel closed without returning
focus. Close and Escape now return to its toggle; choosing a section focuses the
destination heading. The nonfunctional toggle is hidden without JavaScript,
whilst normal article headings and fragment URLs remain readable. These changes
still require runtime verification. Removed nested time markup and its machine-
time-zone date title from post-list dates; FormattedDate supplies the sole time.

## Collection presentation and regression evidence

Archive year grouping uses UTC in HTML and Markdown, matching displayed calendar
dates. Page language attributes use the shared site locale rather than a separate
hardcoded language. Post and topic counts use contextual plural resources and
locale-aware numbers. Type headings and descriptions use explicit resources,
without capitalising identifiers or appending an English plural suffix. Domain
identifiers and canonical route segments remain unchanged. Archive and type lists
now use a single time element per displayed date.

The entire package test sequence passed using the installed Node 24 interpreter
and locally installed executables: middleware compile, Markdown smoke tests,
mention detection, Accept negotiation, graph snapshot, middleware negotiation,
end-to-end negotiation, agent readiness, client-script syntax, and locale tests.
Invoking those executables directly avoids pnpm's stalled policy verification;
this is evidence for the same test commands, not a successful pnpm invocation.

Remaining verification includes section-panel focus at runtime, clipboard failure
and no-JavaScript recovery, storage-denied theme operation, expanded text/RTL,
contrast, reduced motion, and visual layouts at required widths. Shared controls
have resource boundaries; remaining reusable content and generated labels need a
final localisation review. The goal is still active.

## Article interaction evidence

At 375 × 812 in Chrome, Enter on Sections opened its panel and focused the first
section link. Escape returned focus to Sections with aria-expanded false.
Selecting the first link focused `building-up-the-intuition` and navigated to its
fragment. Enter on the Markdown summary exposed both copy buttons and the Open
markdown recovery link. Escape from a copy button closed it and returned focus
to Markdown. No horizontal document overflow was present during these checks.

The native accessibility tree revealed copy-button labels appended to heading
names. Heading enhancement now preserves the original heading name independently
of the action's label. Read-only browser inspection verified both names on all
five headings in the representative article after rebuilding. The same page has
zero nested time elements after the sidebar date fix. Article sidebar, TOC, and
related labels now use UI resources; shared topic names use Intl.ListFormat;
TOC indentation uses logical CSS properties. Browser viewport restored afterwards.

These checks do not prove clipboard success/failure, no-JavaScript recovery,
storage denial, contrast, full zoom/RTL/text expansion, or all page layouts.

## No-script search and Markdown download

With script execution disabled and a 375px viewport, search retained all 15 static
posts, mobile navigation had opacity 1, the theme button was hidden, and the page
had no horizontal overflow. Native Markdown details opened and exposed its link
without the nonfunctional copy buttons.

Following Open markdown to a valid text/markdown response did not give Chrome a
readable page. HTTP inspection confirmed 200, text/markdown, and the correct post
body. Changed recovery to an explicitly labelled Download markdown link with the
native download attribute, and aligned failure messages with downloading the file
and copying its text. After rebuilding and disabling cache, browser inspection
confirmed the new label; clicking it produced a successful download event.
That final download check had scripts enabled. The complete no-script download
path remains to verify. An earlier download-observation timeout reset the tool
session; it was not counted as a test pass. Script/cache/viewport overrides were
restored, and the test tab closed.

## Motion, widths, and series presentation

On the representative article at 375, 768, and 1440px in Chrome, document width
stayed within the viewport. At 1440px, the main reading column measured 680px.
The 375px screenshot showed readable dark-mode text and wrapping title/topic
links, with navigation and the sections control visible. Computed colours were
background rgb(17,24,39), body rgb(243,244,246), muted rgb(156,163,175), and prose
links rgb(96,165,250). These observations cover this representative layout, not
all page families or expanded translations.

Emulated reduced motion yielded 0s navigation transitions on search and 0s on
the article reading-progress pseudo-element. Media and viewport overrides were
reset and the review tab closed.

Series messages now use complete progress/post functions with locale-aware
numbers; previous/next/updated copy is in article resources. SeriesNav accepts
only the post identifier and real typed series metadata, removing the fabricated
post and its any cast. No currently published series fixture exists to prove
that path's rendered output; it still needs representative verification.

## Expanded text and denied APIs

Removed mobile TOC no-wrap clipping: section labels wrap fully instead of becoming
indistinguishable truncated titles. Close has a 44px target. Text alignment,
indentation, margins, and leading borders use logical properties across reader
layouts. HTML direction is defined next to the site locale.

In a fresh Chrome article tab at 375px, temporarily setting document direction to
RTL and prepending long Arabic section labels produced wrapping links (44–61px
high), equal client/scroll widths, and no horizontal document overflow. These
synthetic labels test layout only; they are not reviewed translations.

At desktop width, temporarily making localStorage throw and clipboard.writeText
reject still allowed the theme button to update its pressed state. Markdown copy
reported: `Unable to copy. Download the markdown file and copy its text manually.`
This checks operation after storage becomes unavailable, not initial page loading
with storage denied. An attempt to inject before navigation was rejected by the
browser tool as unsupported; no pass is claimed for that scenario. All temporary
page mutations were cleared by reload, viewport reset, and tab closure.

Build, readiness, and generated browser-script syntax checks pass after the CSS
and direction changes. Full width/zoom checks across other page families and
storage-denied initialisation remain to verify.

## Series fixtures, initialisation, and page-family widths

A temporary two-part MDX-compatible Markdown series was built in this worktree.
Both rendered articles had H1 as their first heading, named series navigation,
correct Part 1/2 of 2 progress, and current-part/link markup. The series block was
moved below the article header, and its heading replaced by the series navigation
label. Fixtures were removed in a finally block and the actual content rebuilt.

A regression check executes the generated theme bootstrap with storage access
throwing. It verifies progressive-enhancement initialisation and the expected
light/dark theme for both system preferences. It now runs in the package test
sequence. This directly covers initial bootstrap denial; the earlier browser
check covers operation after storage becomes unavailable.

Chrome inspected 13 page families (home, about, contact, privacy, projects, now,
archive, blog index, topics index, types index, search, graph, and 404) at 375,
768, and 1440px. All 39 combinations had exactly one H1 and no horizontal document
overflow. This is a geometry/heading check, not a complete visual or contrast audit.
Viewport restored and test tab closed. The full local Node 24 test sequence passed
again, including the new storage-denial check.

## Recovery completion and text scaling

The full no-JavaScript Markdown download path passed in Chrome: script execution
was disabled, the document had no js class or generated heading-copy buttons,
native summary opened only Download markdown, and Enter on the link produced a
download event. A locator click initially failed because its evaluation timed out
with scripts disabled; using native keyboard activation resolved the test.

Using a temporary clipboard substitute on the loaded article, copy Markdown
produced the correct title/frontmatter and Markdown copied status; copy link
produced the canonical .md URL and Markdown link copied status. This verifies the
success branch/output without altering or reading the system clipboard. Native
clipboard permissions remain browser-controlled; denied access already has a
verified recovery branch. Reload removed the substitute.

At 375px with root font size doubled to 32px, the article and sections panel
remained within the document width; Close remained visible. Temporary scale,
script, cache, and viewport changes were restored and the tab closed.

Shared colour contrast against light/dark body surfaces measured respectively:
body 17.08/16.12, muted 4.55/6.99, and links 4.95/6.98. Tinted blockquote surfaces
reduce muted contrast, so blockquotes now use body text colour. These ratios do
not establish contrast for every custom surface or image. Biome/Lighthouse are
not cached; another registry connectivity check failed with DNS resolution.
They remain external verification limits, not successful checks.

Unused NewsletterSignup and Sidenote components are not imported by published
pages/posts; no live form submission or validation flow exists. Contact exposes
email/social links with full names/addresses from identity data. There are no
payments, currencies, app notifications, emails, or PDF generation paths to
localise in the shipped reader interface. Published prose remains authored
English content, separate from shared controls and semantic data exports.
