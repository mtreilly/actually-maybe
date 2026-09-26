# Actually Maybe

A static personal blog built with Astro, TypeScript, and Markdown/MDX. The aim is
simple: write a thought, publish it, and make it readable by people and agents.
Read [AGENTS.md](AGENTS.md) for project standards and
[the architecture guide](.gravity/README.md) before changing shared boundaries.

## Write and publish

Put posts in `src/content/blog/`. The effective schema is `src/content.config.ts`.

```yaml
---
title: "A thought"
description: "A short summary."
pubDate: 2026-09-26
topics: ["learning"]
type: "note"
draft: true
---
```

Omit `draft` or set it to false to publish. Drafts remain in the authored collection
but are excluded from public HTML, Markdown, indexes, feeds, graph data, and sitemap.
Supported types are note, essay, guide, and link. Optional series metadata uses
`series: { name: "Learning Theory", part: 1, total: 3 }`.

The build computes reading time, topic connections, RSS, sitemap, and portable
representations automatically. No manual related-post metadata is required.

## Reading and portable access

Every content page has a Markdown sibling: `/index.md`, `/about.md`, `/contact.md`,
`/privacy.md`, `/blog/post-slug.md`, `/topics/topic.md`, `/type/guide.md`, `/graph.md`,
and the other page routes. Empty supported type collections have Markdown too.
Search HTML and Markdown both include the complete published-post index; HTML
adds interactive title, description, and topic search when JavaScript is available.
Home HTML and Markdown select the same ten latest posts in the same order.

The article's Markdown menu copies text or a link and offers a native download.
Cmd/Ctrl+Shift+M copies the current article's Markdown. Cmd/Ctrl+K opens `/search/`.
There is no command palette or assistant launcher UI.

On Vercel, canonical content URLs also negotiate Markdown with
`Accept: text/markdown`. Root `middleware.ts` uses the generated route manifest;
local Astro preview serves explicit `.md` files but does not run that middleware.
Markdown responses use `text/markdown`. Error pages and non-page files are separate
outputs; do not append `.md` to RSS, JSON, or identity endpoints.

Agents can start with `/llms.txt`, `/about.llm`, `/.well-known/ai-profile`, or
`/data/graph.json`. Shared name, contact details, social profiles, and site origin
live in `src/data/identity.ts`; narrative biographies remain separate.
See [knowledge graph usage](docs/knowledge-graph-usage.md) for graph semantics.

## Develop and verify

Use the pinned Node major and package manager before working:

```bash
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

| Command | Purpose |
| --- | --- |
| `pnpm build` | Produce static output and regenerate the tracked route manifest |
| `pnpm preview` | Preview static output locally |
| `pnpm test` | Compile middleware; test policies, content lifecycle, portable outputs, negotiation, and existing readiness checks |
| `pnpm typecheck:middleware` | Verify the independent middleware compilation boundary |
| `pnpm astro check` | Astro diagnostics, when the optional checking tool is installed |

Build tests run serially and use temporary content/identity probes with finally-block
restoration and baseline rebuilds. Do not run concurrent mutation tests in one checkout.
Commit `src/generated/route-manifest.json` after route or client-asset changes.
Biome is the formatter/linter; see the existing audit notes for verification limits.

The reading styles began with Astro's Bear Blog-based starter.
