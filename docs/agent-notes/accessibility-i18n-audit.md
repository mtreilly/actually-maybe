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
