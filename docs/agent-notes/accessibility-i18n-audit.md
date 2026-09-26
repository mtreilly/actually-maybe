# Accessibility and localisation audit

Worktree: `../actually-maybe-accessibility-i18n`.
Branch: `quality/accessibility-i18n`. Issue: `actually-maybe-zxb`.

The implementation and verification below follow both quality-goal documents.
Completion remains unproven because the project-wide lint and Lighthouse gates
are not satisfied. No merge or deployment has been performed.

## Accessibility requirements and evidence

| Concern | Change or scope | Evidence |
| --- | --- | --- |
| Keyboard navigation | Closed mobile navigation is inert; Escape restores toggle focus. Removed single-character shortcuts and their unfocused modal. Cmd/Ctrl+K remains. | Chrome at 375px: Tab skips closed links; Enter opens; Escape from Topics returns to toggle. |
| Article navigation | Section close/Escape returns focus; selecting a section focuses its heading. | Chrome keyboard checks on representative article. |
| Semantics | Exactly one first H1; related content is an H2 section; sidebar/TOC labels are text in navigation; series follows article header. No nested time elements. | All 80 generated HTML pages pass heading regression; representative article has zero nested time elements. |
| Names and descriptions | Theme exposes pressed state; decorative SVG hidden. Heading copy actions are labelled buttons and preserve heading names. Footnote preview describes reference without replacing original description. | Native AX tree and browser DOM inspection; five article heading/button names checked. |
| Dynamic states and recovery | Search announces results. Copy success/failure announces status with manual recovery advice. Native Markdown download works without scripts. | Expected robotics result and status; copy output/status checked using clipboard substitute; denied clipboard checked; no-script Enter generated download event. |
| Forms | No shipped form exists. NewsletterSignup and Sidenote are unused by published routes/posts. Contact uses email/social links. | Import/content search and contact-page source. No external submission performed. |
| Focus visibility and targets | Visible focus across controls, code buttons visible on keyboard/touch, mobile nav/theme/section Close enlarged. | Keyboard operation verified; Close remains visible with doubled text. |
| Contrast | Body/link/muted text checked on both main surfaces; tinted blockquotes now use body colour. | Light ratios 17.08/4.95/4.55; dark 16.12/6.98/6.99. Does not prove every custom surface/image. |
| Layout and text size | Logical alignment/spacing; long TOC labels wrap. | 13 page families at 375/768/1440px: all 39 combinations one H1/no document overflow. Article at 200% root text and 375px fits. Desktop main 680px. |
| Motion | Reduced-motion removes transitions/animations. | Chrome emulation: search nav and article progress transitions 0s. |
| Temporary previews | Pointer can travel into footnote preview; focused reference keeps it visible; Escape removes it; long preview scrolls within viewport. | Final Chrome checks: focus retention, pointer-only enter/exit, native footnote jump. At 320×400, long preview bounds 10–390px and wheel scrolling advances 400px. |
| Cognitive load | Native summary, ordinary links, clear recovery messages, no shortcut modal. | Runtime menu and no-script checks. |

## Internationalisation requirements and evidence

| Concern | Boundary or scope | Evidence |
| --- | --- | --- |
| UI and accessibility copy | Meaningful resources for shared navigation, search, copy, theme, article, series, collections, and type labels. Author prose remains content. | `src/i18n/ui.ts`, shared components and scripts. |
| Grammar and pluralisation | Full messages for search/collection/connection counts and series progress; explicit type plural labels; no identifier capitalisation or appended s. | Resources and rendered two-part series fixture. |
| Dates and time zones | Shared Irish English date formatter uses UTC calendar days. Archive HTML/Markdown group by UTC year. | Tests in opposite time zones and German date locale; rendered dates. |
| Numbers and lists | Intl number/unit/list formatting, explicit collation locale. | German grouping/decimal, Swedish/German sorting, Arabic numbering tests. Graph JSON keeps numeric values. |
| Language and direction | Site locale/direction are presentation constants, used by every HTML page. Logical text alignment/spacing. | Source scan; synthetic Arabic expanded labels at 375px RTL wrap without overflow. |
| Names and addresses | Identity data retains full names, email, postal address, and profiles. No parsing into cultural name components. | `src/data/identity.ts`, contact and structured-data output tests. |
| Exports | Markdown HTML equivalents share count resources; ISO dates, route/domain identifiers, graph numbers remain semantic. | Markdown and negotiation regression suite. |
| Unsupported product paths | No payment/currency, application email/notification, or PDF generation flow exists. No language-bearing UI images were added. | Route/component/data review. Blog images/prose remain authored content. |
| Translation context | Resources group copy by interaction and accept semantic parameters. Adding a language requires translated resources/content plus locale/direction changes, not domain/schema changes. | Resource and formatting APIs. No claim of a reviewed second-language translation. |

## Validation

A fresh build and the complete package test sequence pass with installed Node
24.21.0 and local executables. Commands cover middleware TypeScript compilation,
Markdown smoke tests, mention detection, Accept parsing, graph snapshot,
middleware and end-to-end negotiation, agent readiness, generated browser-script
syntax, locale formatting, storage-denied theme bootstrap, and all-page headings.
Direct executables were used because pnpm policy verification stalled.

The generated theme bootstrap was executed with storage access throwing for both
system themes. It still enables progressive enhancement and selects the expected
theme. Chrome also verified theme operation after storage becomes unavailable.
Copy success tests use a temporary clipboard substitute and verify actual Markdown
and canonical URL output; they do not read or overwrite the system clipboard.
Native clipboard permission behaviour remains browser-controlled.

Temporary two-part series fixtures verified H1 order, named navigation, progress,
current-part markup, and ordinary links. Fixtures were removed in a finally block
and actual content rebuilt. Temporary browser mutations and emulation overrides
were cleared, and review tabs closed.

Biome 2.5.14 was located at `/opt/homebrew/bin/biome`. All 45 changed supported
files pass with exit 0 after safe formatting and callback cleanup. There are 221
warnings, largely template-use false positives from Astro's partial support;
unsafe unused-value removal was not applied. No claim of zero warnings is made.

## Remaining project gates and limitations

- Repository-wide Biome fails outside this patch. A clean archive of main reports
  117 errors and 202 warnings. The worktree's source check also fails; build-output
  scans are irrelevant. The changed-file check passes. This audit does not silently
  fix unrelated baseline code or claim the project-wide gate passed.
- Lighthouse is not installed/cached. Registry DNS fails. The available DevTools
  Lighthouse connector cannot connect: Target closed. Its audit excludes
  performance in any case. No Lighthouse >90 score is claimed.
- Standalone Playwright cannot launch either installed Chrome binary. Runtime
  checks used the functioning Chrome extension instead.
- Browser coverage is Chrome and representative interactions. No human screen-
  reader session, second-language content review, exhaustive image contrast audit,
  or cross-browser certification is claimed.

These limits are explicit evidence gaps. The goal remains active pending the
required project gates and a final completion decision; the issue stays open.
