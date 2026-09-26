/**
 * Recovery routes offered on a 404. Shared by src/pages/404.astro and the
 * markdown 404 body that middleware.ts returns to agents, so the HTML and
 * markdown variants of the same status page never drift.
 */

export type RecoveryLink = {
	href: string;
	label: string;
	note: string;
};

export const NOT_FOUND_TITLE = "Page not found";

export const NOT_FOUND_MESSAGE =
	"That URL does not exist on this site. Nothing was moved: it was most likely mistyped, or it is a link to a page that never existed. Here is where to look instead.";

export const HUMAN_RECOVERY_LINKS: RecoveryLink[] = [
	{ href: "/", label: "Home", note: "The ten most recent posts." },
	{ href: "/blog/", label: "All posts", note: "Every post, newest first." },
	{ href: "/archive/", label: "Archive", note: "Every post grouped by year." },
	{ href: "/topics/", label: "Topics", note: "Browse by subject." },
	{
		href: "/search/",
		label: "Search",
		note: "Full-text search across every post.",
	},
	{ href: "/about/", label: "About", note: "Who writes this and why." },
	{ href: "/contact/", label: "Contact", note: "Report a broken link here." },
];

export const AGENT_RECOVERY_LINKS: RecoveryLink[] = [
	{
		href: "/llms.txt",
		label: "llms.txt",
		note: "Curated index, plus when-to-use guidance.",
	},
	{
		href: "/sitemap-index.xml",
		label: "sitemap-index.xml",
		note: "Every canonical URL on the site.",
	},
	{
		href: "/data/graph.json",
		label: "data/graph.json",
		note: "Posts, topics, and the edges between them.",
	},
	{
		href: "/about.llm",
		label: "about.llm",
		note: "Author context as plain text.",
	},
	{
		href: "/.well-known/ai-profile",
		label: ".well-known/ai-profile",
		note: "The same profile as JSON.",
	},
	{ href: "/rss.xml", label: "rss.xml", note: "Feed of recent posts." },
];

/**
 * The markdown body served with a 404 when the client prefers text/markdown.
 * Kept deliberately short: an agent needs the status and the next hop, not prose.
 */
export const buildNotFoundMarkdown = (origin: string, pathname: string) => {
	const absolute = (href: string) => new URL(href, origin).toString();
	const list = (links: RecoveryLink[]) =>
		links
			.map((link) => `- [${link.label}](${absolute(link.href)}): ${link.note}`)
			.join("\n");

	return [
		`# 404 ${NOT_FOUND_TITLE}`,
		"",
		`\`${pathname}\` does not exist on ${new URL("/", origin).host}. This is a real 404: every path that returns 200 on this site is a real page.`,
		"",
		"## Machine-readable entry points",
		list(AGENT_RECOVERY_LINKS),
		"",
		"## Pages",
		list(HUMAN_RECOVERY_LINKS),
		"",
		"Append `.md` to any of the page URLs above, or send `Accept: text/markdown`, to get markdown instead of HTML.",
		"",
	].join("\n");
};
