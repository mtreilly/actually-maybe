# The current system

## Publish a thought

`src/content/blog/` contains 15 authored Markdown posts. The only effective schema,
`src/content.config.ts`, validates metadata, calendar dates, post types, and optional
ordered series. `draft` defaults to false. Every public collection consumer uses
`src/lib/published-posts.ts`; direct routes and all discovery outputs exclude drafts.
HTML renders Astro content; Markdown exports transform source bodies. There are no
baseline MDX posts, so full future component-export fidelity remains unproven.

## Read and discover

The blog route owns chronological neighbours and passes shared related-reading
selections to the article layout. Sidebar and Markdown further reading use the same
ranking with presentation-specific limits. The footer exposes graph topic connections.
Series navigation remains separate. `PostItem` accepts the heading level of its host.

Lists and archives retain local grouping. Home and home Markdown share the latest-ten
selection. Supported post types have one vocabulary, including addressable empty
collections. Search renders a full static index; Fuse enhances that DOM. Cmd/Ctrl+K
navigates to search, with no command palette. Search Markdown contains the same index.

## Connect ideas

The graph loader obtains current published entries, projects portable nodes, and
reuses its in-memory graph only if that projection is unchanged. `graph-utils.ts`
builds shared-topic edges, topic indexes, and statistics. The graph represents topic
overlap, not authored references or backlinks. Shared graph-view selections drive
HTML and Markdown topic groups and connected-post lists.

The JSON endpoint alone writes public graph JSON. The integration's build-finalisation
hook reads that completed output to regenerate editorial mention suggestions. It does
not parse internal Astro storage, own an earlier snapshot, or overwrite graph JSON.

## Identity and portable access

`identity.ts` owns author name, contact/postal facts, social URLs, origin, and agent
guidance. Human profile, structured data, and machine endpoints derive these facts;
biographies remain audience-specific. All 79 inventoried content pages have Markdown
siblings. The deliberate standalone 404 HTML output is outside that content inventory.

The manifest scanner records real built routes for root middleware. That separately
compiled request boundary selects prebuilt formats using Accept negotiation. Static
endpoint GET handlers execute at build time, not as a live content API.

## State and failure

Authored files are source state; `.astro` and output directories are derived state.
The generated route manifest is committed for middleware deployment. Theme preference
is optional localStorage; interaction state stays local to DOM scripts. Layout/head
can tolerate graph failure, whilst finalisation needs valid JSON to generate suggestions.
Tests inspect graph data and projections, so successful HTML alone is insufficient.
