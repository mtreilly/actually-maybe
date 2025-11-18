# AGENTS.md

**Design Philosophy & Development Standards for Actually Maybe**

This document defines the core design criteria and quality standards for anyone (human or AI agent) working on this codebase. These principles are non-negotiable and override convenience.

---

## Lodestar: Ease of Thought → Posted Blog

**The primary goal**: Make it as frictionless as possible to go from "I have a thought" to "It's published and accessible."

Everything else serves this goal. Features that add friction to writing or publishing are considered harmful, no matter how clever.

---

## Core Design Principles

### 1. Design Minimalism

**What it means:**
- Every pixel, every line of code, every feature must justify its existence
- When in doubt, remove rather than add
- Simplicity is a feature, not a compromise

**In practice:**
- No unnecessary UI elements (badges, widgets, social share buttons, view counters)
- No modal dialogs or pop-ups (use inline or page-based flows)
- No auto-playing anything (videos, carousels, animations)
- No "growth hacking" (email capture overlays, exit-intent popups, etc.)
- Clean URLs: `/blog/post-slug`, never `/blog/2024/11/18/post-slug/index.html`

**Examples:**

✅ **Good**: Post footer with subtle "Also discussed in:" section
❌ **Bad**: Sidebar with "Related", "Popular", "Recent", "Trending" sections

✅ **Good**: Single search field (Cmd+K)
❌ **Bad**: Search + filters + sort dropdown + view toggles

✅ **Good**: Dark mode toggle in footer
❌ **Bad**: Settings panel with 15 customization options

---

### 2. Hidden Complexity

**What it means:**
- Sophisticated systems under the hood, but invisible to readers and writers
- Build-time computation preferred over runtime
- Zero-config for common tasks

**In practice:**
- Complex features (knowledge graph, embeddings, RSS) run at build time
- Readers see plain HTML; no spinners, no loading states
- Writers drop MDX in `/src/content/blog/`, that's it—no metadata files, no manual linking, no database entries
- All "magic" happens in Astro integrations and build hooks

**Examples:**

✅ **Good**: Knowledge graph parses AST, builds connections, injects backlinks → writer never thinks about it
❌ **Bad**: Writer manually adds `relatedPosts: [...]` to frontmatter

✅ **Good**: Reading time auto-calculated from word count
❌ **Bad**: Writer manually adds `readingTime: "5 min"`

✅ **Good**: Image optimization happens automatically with Astro's `<Image />` component
❌ **Bad**: Writer runs `npm run optimize-images` before committing

---

### 3. Quality Software

**What it means:**
- Code is readable, maintainable, and correct
- No clever hacks or "temporary" workarounds
- Types are enforced; no `any` escapes
- Tests exist for non-trivial logic

**In practice:**
- TypeScript strict mode enabled (`strict: true`)
- Biome for linting + formatting (no ESLint/Prettier)
- All public APIs have explicit types
- Unit tests for utilities (`src/lib/`)
- E2E tests for critical flows (Playwright)

**Code standards:**

```typescript
// ✅ Good: Clear types, single responsibility
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// ❌ Bad: Any types, multiple responsibilities
export function processPost(post: any): any {
  const time = post.content.split(' ').length / 200;
  const slug = post.title.toLowerCase().replace(/ /g, '-');
  const image = post.image || '/default.jpg';
  return { ...post, time, slug, image };
}
```

**Git workflow:**
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Commit after each logical unit of work (not end of day)
- NO force-push to `main`
- Use `git diff` to debug; `git log` to trace history

---

### 4. Readability (Code)

**What it means:**
- Code is self-documenting
- Function names describe intent, not implementation
- Comments explain *why*, not *what*
- File structure mirrors mental model

**In practice:**

**File organization:**
```
src/
├── content/blog/           # Posts (MDX)
├── layouts/                # Page layouts
├── components/             # Reusable UI
├── lib/                    # Pure utilities (testable)
├── integrations/           # Astro build hooks
├── types/                  # TypeScript definitions
└── pages/                  # Routes
```

**Naming conventions:**
```typescript
// ✅ Good: Intent-revealing names
function buildKnowledgeGraph(posts: Post[]): Graph { ... }
function findRelatedPosts(postId: string, graph: Graph): Post[] { ... }

// ❌ Bad: Abbreviations, implementation details
function bldGraph(p: Post[]): Graph { ... }
function getPostsByEdgeTraversal(id: string, g: Graph): Post[] { ... }
```

**Function size:**
- Prefer small, single-purpose functions (<30 lines)
- Extract complex logic into named helpers
- If you need to scroll to understand, it's too long

---

### 5. Readability (Content & UI)

**What it means:**
- Text is scannable and accessible
- Visual hierarchy is clear
- No cognitive overload

**In practice:**

**Typography:**
- Body text: 18-20px, line-height 1.6-1.8
- Max width: 680px (60-75 characters/line)
- Sufficient contrast (WCAG AA minimum: 4.5:1)
- System font stack (no custom web fonts unless necessary)

**Hierarchy:**
```astro
<!-- ✅ Good: Clear structure -->
<article>
  <header>
    <h1>Post Title</h1>
    <time>Nov 18, 2024</time>
  </header>

  <div class="content">
    <p>First paragraph...</p>
    <h2>Section heading</h2>
    <p>Section content...</p>
  </div>

  <footer>
    <nav>Related posts...</nav>
  </footer>
</article>

<!-- ❌ Bad: Flat, unclear -->
<div>
  <div class="title">Post Title</div>
  <div class="date">Nov 18, 2024</div>
  <div class="text">First paragraph...</div>
  <div class="heading">Section heading</div>
  <div class="text">Section content...</div>
  <div class="related">Related posts...</div>
</div>
```

**Accessibility:**
- Semantic HTML always (`<nav>`, `<article>`, `<aside>`, not `<div role="navigation">`)
- All interactive elements keyboard-accessible (Tab, Enter, Esc)
- ARIA labels where needed (`aria-label`, `aria-labelledby`)
- Focus indicators visible (never `outline: none` without replacement)
- Alt text for all images (or `alt=""` if decorative)
- Color not the only indicator (use icons/text too)

---

## Technology Choices (and Why)

### Core Stack

| Technology | Why | Alternatives Rejected |
|------------|-----|----------------------|
| **Astro** | Static-first, MDX native, fast builds | Next.js (overkill), Gatsby (deprecated), Hugo (no TypeScript) |
| **TypeScript** | Type safety, better DX | JavaScript (error-prone) |
| **Tailwind CSS v4** | Utility-first, minimal CSS shipped | Styled-components (runtime cost), plain CSS (hard to maintain) |
| **MDX** | Markdown + components, flexible | Plain Markdown (limited), CMS (adds friction) |
| **Biome** | Fast, all-in-one linter + formatter | ESLint + Prettier (slow, config hell) |
| **pnpm** | Fast, efficient disk usage | npm (slow), yarn (abandoned) |
| **Vercel** | Zero-config deployment, edge functions | Netlify (fine), self-hosted (more maintenance) |

### Forbidden Technologies

**Do NOT add these without explicit justification:**

- ❌ **React/Vue/Svelte** for static content (Astro components only)
- ❌ **CSS-in-JS** libraries (runtime overhead)
- ❌ **jQuery** (2024, really?)
- ❌ **Moment.js** (use `day.js` or native `Date`)
- ❌ **Lodash** (use native ES6+ methods)
- ❌ **Database** for static content (MDX files are the database)
- ❌ **GraphQL** for simple queries (overkill)
- ❌ **Redux/MobX** for client state (Zustand or React Context if needed)
- ❌ **Barrel files** (import directly: `import { X } from './x'`)

---

## Feature Development Guidelines

### Before Adding a Feature

Ask these questions in order:

1. **Does this reduce friction from thought → published?**
   - If no → reject immediately
   - If yes → continue

2. **Can readers accomplish their goal WITHOUT this feature?**
   - If yes → feature is likely unnecessary
   - If no → continue

3. **Can this be automated at build time?**
   - If yes → build-time only, no runtime code
   - If no → continue

4. **Does this require JavaScript in the browser?**
   - If yes → provide no-JS fallback or reject
   - If no → continue

5. **Will this still make sense in 5 years?**
   - If no → probably following a trend, reject
   - If yes → proceed

### Feature Design Checklist

Before implementing:

- [ ] Sketched UI (even rough wireframe)
- [ ] Identified build-time vs runtime logic
- [ ] Planned no-JS fallback (if JS required)
- [ ] Considered accessibility (keyboard nav, screen readers)
- [ ] Checked mobile responsive design (320px+)
- [ ] Estimated maintenance burden (prefer zero-maintenance)
- [ ] Written a one-sentence "why" statement

### Implementation Checklist

Before merging:

- [ ] TypeScript types defined (no `any`)
- [ ] Biome passes (`pnpm biome check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Tested without JavaScript
- [ ] Tested on mobile (375px, 768px)
- [ ] Tested keyboard navigation
- [ ] Tested dark mode
- [ ] No console errors/warnings
- [ ] Lighthouse score >90 (performance, accessibility)
- [ ] Git commit message follows conventional format

---

## Writing & Content Guidelines

### Frontmatter Schema

**Required fields:**
```yaml
---
title: "Post Title"
description: "One-sentence summary (max 160 chars)"
pubDate: 2024-11-18
topics: ["ai", "learning"]  # lowercase, plural
type: "note"  # note | essay | guide | link
---
```

**Optional fields:**
```yaml
heroImage: "./hero.jpg"  # relative to post file
series: "Learning Theory"  # multi-part posts
draft: true  # exclude from build
```

### Writing Style

**Principles:**
- Write like you talk (casual but precise)
- Short sentences preferred (10-20 words)
- Active voice over passive
- Concrete examples over abstract theory
- Code snippets over prose explanations (when appropriate)

**Formatting:**
- Use `##` for main sections (never `#` in post body, that's the title)
- Code blocks always have language: ` ```typescript `
- Links descriptive: `[knowledge graph spec](./spec.md)`, not `[click here](./spec.md)`
- Lists for scannability (like this one)

---

## Performance Budgets

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | <1.5s | 2s |
| Largest Contentful Paint | <2s | 3s |
| Time to Interactive | <3s | 4s |
| Cumulative Layout Shift | <0.05 | 0.1 |
| Total JavaScript | <50KB | 100KB |
| Total CSS | <30KB | 50KB |
| Image sizes (hero) | <100KB | 200KB |
| Build time (50 posts) | <30s | 60s |

**Measurement:**
```bash
pnpm build
pnpm preview
npx lighthouse http://localhost:4321 --view
```

---

## Workflow for AI Agents

### Issue Tracking with `bd` (beads)

This project uses [`bd`](https://github.com/steveyegge/beads) for issue tracking, not markdown TODOs.

**Common commands:**
```bash
bd                    # List all issues
bd new "Task title"   # Create new issue
bd show 42            # View issue #42
bd edit 42            # Edit issue
bd close 42           # Mark done
bd grep "keyword"     # Search issues
```

**Workflow:**
1. User assigns task → check for related `bd` issues
2. Create `bd` issue if starting multi-step work
3. Update issue with progress/blockers
4. Close issue when complete
5. Reference in commit: `feat: implement X (closes #42)`

### Multi-Agent Collaboration

If multiple agents work on this project:

**Communication:**
- Use `bd` issues for task tracking
- Leave notes in `docs/agent-notes/` (create dir if needed)
- Update this AGENTS.md if you discover new patterns

**Parallel work:**
- Use git worktrees for separate branches
- Run dev server on different ports (`--port 4322`)
- Coordinate via shared `SHARED.md` in project root

---

## Examples of Applying Principles

### Example 1: Adding Post Reactions

**Proposal**: Let readers react with emoji (👍 ❤️ 🎉)

**Analysis:**
1. ❌ Does NOT reduce friction from thought → published (adds complexity for writer)
2. ✅ Readers CAN accomplish goal without this (they can comment elsewhere)
3. ❌ Cannot be build-time (needs user interaction tracking)
4. ❌ Requires JavaScript + backend (Vercel KV or similar)
5. ❓ Will this matter in 5 years? (Trends change)

**Decision**: REJECT. Adds maintenance burden, requires backend, doesn't serve lodestar.

**Alternative**: If reader engagement is important, add simple "Discuss on Twitter/Mastodon" link.

---

### Example 2: Auto-Generated Table of Contents

**Proposal**: Show TOC on long posts

**Analysis:**
1. ✅ Helps readers navigate (indirectly helps writer know if post is structured well)
2. ✅ Readers can still scroll, but TOC improves UX
3. ✅ Can extract headings at build time (MDX AST)
4. ✅ No JavaScript required (pure HTML links)
5. ✅ TOCs are timeless

**Decision**: ACCEPT. Build at compile time, render as HTML.

**Implementation**:
```typescript
// In BlogPost.astro layout
const headings = await getHeadings(entry);

<aside class="toc">
  <nav aria-label="Table of contents">
    <ul>
      {headings.map(h => (
        <li><a href={`#${h.slug}`}>{h.text}</a></li>
      ))}
    </ul>
  </nav>
</aside>
```

---

### Example 3: Knowledge Graph Feature

**Proposal**: Auto-link related posts

**Analysis:**
1. ✅ Reduces friction (writer doesn't manually link, readers discover related ideas)
2. ✅ Readers benefit from discovery
3. ✅ Build-time graph generation (AST parsing)
4. ✅ No JavaScript for core functionality (HTML links)
5. ✅ Evergreen feature (connections always relevant)

**Decision**: ACCEPT. Aligns perfectly with all principles.

**See**: `/docs/plans/knowledge-graph-implementation.md`

---

## Decision-Making Authority

**Hierarchy (in order):**

1. **Lodestar** (ease of thought → posted blog)
2. **Design minimalism** (when in doubt, remove)
3. **Hidden complexity** (automate, don't expose)
4. **Quality** (do it right, not fast)
5. **This document** (AGENTS.md)
6. **Global CLAUDE.md** (`~/.claude/CLAUDE.md`)
7. **Project README** (if it exists)

If conflict arises, higher authority wins.

---

## Anti-Patterns to Avoid

### ❌ Configuration Bikeshedding

**Bad**:
```typescript
export const config = {
  postsPerPage: 10,
  excerptLength: 150,
  dateFormat: 'MMM DD, YYYY',
  showReadingTime: true,
  showTableOfContents: true,
  tocMinHeadings: 3,
  // ... 50 more options
}
```

**Good**: Sensible defaults, no config file. If you need to change it, change the code.

---

### ❌ Premature Abstraction

**Bad**:
```typescript
// Generic content processor for future blog/docs/wiki
abstract class ContentProcessor<T extends Content> {
  abstract process(content: T): ProcessedContent<T>;
}
```

**Good**: Solve the problem you have now (blog posts), not imaginary future problems.

---

### ❌ "Just In Case" Features

**Bad**: "Let's add a newsletter signup form, we might want it later"

**Good**: Add newsletter form when you're ready to send newsletters (i.e., when you have content).

---

### ❌ Clever Over Clear

**Bad**:
```typescript
const p = posts.filter(p => p.t.some(t => ts.has(t)));
```

**Good**:
```typescript
const matchingPosts = posts.filter(post =>
  post.topics.some(topic => selectedTopics.has(topic))
);
```

---

## When to Break the Rules

**Legitimate reasons:**
1. **Accessibility requirement** (e.g., adding ARIA attributes increases verbosity but improves a11y)
2. **Performance critical path** (e.g., inlining critical CSS increases file size but speeds up FCP)
3. **Legal/security requirement** (e.g., GDPR compliance adds UI complexity)

**Invalid reasons:**
1. "It's trendy"
2. "My last project did it this way"
3. "The library recommends it"
4. "It's only a few lines"

---

## Quality Checklist (Self-Review)

Before considering work "done":

**Code:**
- [ ] No TypeScript `any` or `@ts-ignore` (unless truly necessary)
- [ ] No copy-pasted code blocks >10 lines (extract to function)
- [ ] No hardcoded strings visible to users (extract to component or i18n)
- [ ] No magic numbers (use named constants: `const WORDS_PER_MINUTE = 200`)
- [ ] No commented-out code (delete it, git remembers)
- [ ] Functions have clear names and single responsibility
- [ ] File is <300 lines (if longer, split into modules)

**UI:**
- [ ] Works without JavaScript (or graceful degradation)
- [ ] Keyboard accessible (Tab, Enter, Esc)
- [ ] Mobile responsive (test 375px, 768px, 1440px)
- [ ] Dark mode styled correctly
- [ ] No layout shift on load (CLS <0.1)
- [ ] Images have alt text
- [ ] Focus states visible

**Content:**
- [ ] Frontmatter complete (title, description, pubDate, topics, type)
- [ ] No typos (run spell-check)
- [ ] Code blocks have language specified
- [ ] Links are descriptive (not "click here")
- [ ] One idea per paragraph (scannable)

**Performance:**
- [ ] Build succeeds in <60s
- [ ] No console errors/warnings
- [ ] Lighthouse >90 (performance, accessibility)
- [ ] Images optimized (<200KB)

**Git:**
- [ ] Commit message follows convention: `type: description`
- [ ] Changes are atomic (one logical unit per commit)
- [ ] No unrelated changes in commit
- [ ] No merge conflicts

---

## Resources & References

**Essential Reading:**
- [Brutalist Web Design](https://brutalist-web.design/) - Minimalism philosophy
- [The Unreasonable Effectiveness of Simple HTML](https://shkspr.mobi/blog/2021/01/the-unreasonable-effectiveness-of-simple-html/) - Hidden complexity
- [Hemingway Editor](https://hemingwayapp.com/) - Writing clarity
- [WAVE Accessibility Checker](https://wave.webaim.org/) - Accessibility testing

**Astro Docs:**
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [MDX Integration](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [Build Hooks](https://docs.astro.build/en/reference/integrations-reference/)

**Tools:**
- `bd` (beads): https://github.com/steveyegge/beads
- Lighthouse CLI: `npx lighthouse <url> --view`
- axe DevTools: https://www.deque.com/axe/devtools/

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-18 | Initial version | AI Agent (Claude) |

---

*This document is living. If you discover patterns or anti-patterns while working on this codebase, update this file and commit with:*

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with [discovery]"
```

**Questions?** Open a `bd` issue or add to `docs/agent-notes/questions.md`.
