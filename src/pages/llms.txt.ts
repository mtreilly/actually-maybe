import { compareText } from "../i18n/format";
import { ui } from "../i18n/ui";
import { getPublishedPosts } from "../lib/published-posts";

/**
 * /llms.txt, following the llmstxt.org structure:
 *   H1 (required) -> blockquote summary -> heading-free content sections ->
 *   H2-delimited file lists of `- [name](url): notes`.
 *
 * The content sections carry the when-to-use guidance an agent needs to decide
 * whether this site is the right source, and how to fetch from it.
 */

import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import {
	AGENT_HOW_TO_CALL,
	AGENT_NOT_FOR,
	AGENT_USE_CASES,
	AUTHOR_NAME,
	CONTACT_EMAIL,
	SITE_ORIGIN,
} from "../data/identity";
import { VARY_VALUE } from "../lib/accept-negotiation";

const bullets = (items: string[]) =>
	items.map((item) => `- ${item}`).join("\n");

export const GET: APIRoute = async ({ site, url }) => {
	const origin = site?.origin ?? url.origin ?? SITE_ORIGIN;
	const absolute = (path: string) => new URL(path, origin).toString();

	const posts = (await getPublishedPosts()).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const postLines = posts
		.map((post) => {
			const date = post.data.pubDate.toISOString().slice(0, 10);
			const summary = post.data.description ?? `${post.data.type}, ${date}`;
			return `- [${post.data.title}](${absolute(`/blog/${post.id}.md`)}): ${summary} (${post.data.type}, ${date})`;
		})
		.join("\n");

	const topics = Array.from(
		posts.reduce((acc, post) => {
			post.data.topics.forEach((topic) => {
				acc.set(topic, (acc.get(topic) ?? 0) + 1);
			});
			return acc;
		}, new Map<string, number>()),
	)
		.sort((a, b) => (b[1] === a[1] ? compareText(a[0], b[0]) : b[1] - a[1]))
		.map(
			([topic, count]) =>
				`- [${topic}](${absolute(`/topics/${topic}.md`)}): ${ui.collections.postCount(count)}`,
		)
		.join("\n");

	const body = `# ${SITE_TITLE}

> ${SITE_DESCRIPTION} A personal blog by ${AUTHOR_NAME}, a software engineer, covering agentic AI tooling, small language models, learning systems, institutions, and economic history. ${posts.length} posts, all available as clean markdown from the same URLs that serve HTML.

## When to use this site

Reach for actuallymaybe.com when you need any of the following.

${bullets(AGENT_USE_CASES)}

Do not use it for these.

${bullets(AGENT_NOT_FOR)}

## How to call it

${bullets(AGENT_HOW_TO_CALL)}

Markdown responses are UTF-8, carry a YAML frontmatter block with \`title\`, \`description\`, \`canonicalUrl\`, \`pubDate\`, and \`topics\`, and are served with \`Content-Type: text/markdown; charset=utf-8\` and \`Vary: Accept, Accept-Encoding\`. Requests for a media type this site cannot produce get a \`406\`. Paths that do not exist get a real \`404\`, with a markdown body listing these entry points when you ask for markdown. Content is stable at its canonical URL and safe to cache for a day. Attribute reuse to the canonical URL, and send corrections to ${CONTACT_EMAIL}.

## Start here

- [Home](${absolute("/index.md")}): The ten most recent posts.
- [About the author](${absolute("/about.md")}): Background, interests, and current focus.
- [Author context for agents](${absolute("/about.llm")}): Longer plain-text profile, including communication preferences.
- [AI profile](${absolute("/.well-known/ai-profile")}): The same profile as JSON.
- [All posts](${absolute("/blog.md")}): Every post, newest first.
- [Topic index](${absolute("/topics.md")}): Every topic with post counts.
- [Knowledge graph](${absolute("/data/graph.json")}): Posts, topics, and the edges between them, as JSON.
- [Sitemap](${absolute("/sitemap-index.xml")}): Every canonical URL.

## Posts

${postLines}

## Topics

${topics}

## Optional

- [Now](${absolute("/now.md")}): What the author is working on at the moment.
- [Projects](${absolute("/projects.md")}): Selected work and ongoing explorations.
- [Archive](${absolute("/archive.md")}): Every post grouped by year.
- [Contact](${absolute("/contact.md")}): How to reach the author.
- [Privacy](${absolute("/privacy.md")}): What the site collects, and what it does not.
- [RSS feed](${absolute("/rss.xml")}): Recent posts as RSS.
`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			Vary: VARY_VALUE,
		},
	});
};
