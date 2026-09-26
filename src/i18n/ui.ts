import { SITE_LOCALE } from "./format";

export const ui = {
	graph: {
		title: "Knowledge Graph",
		description: "Explore how posts connect through shared topics and ideas.",
		mostConnected: "Most connected posts",
		topics: "Topics & posts",
		postsLabel: "Posts",
		connectionsLabel: "Connections",
		topicsLabel: "Topics",
		averageLabel: "Avg connections/post",
		dataLink: "Graph JSON",
		unavailableDescription:
			"The graph is unavailable. You can still browse published writing from the blog and topic index.",
		emptyConnections:
			"No connections yet. Publish a few posts with overlapping topics to populate this list.",
		topicsDescription:
			"Posts are grouped by the topics they share. Expand a topic to browse its writing.",
	},
	series: {
		badge: "Part of a series",
		progress: (part: number, total?: number): string =>
			total === undefined
				? `Part ${new Intl.NumberFormat(SITE_LOCALE).format(part)}`
				: `Part ${new Intl.NumberFormat(SITE_LOCALE).format(part)} of ${new Intl.NumberFormat(SITE_LOCALE).format(total)}`,
		post: (part: number, title: string): string =>
			`Part ${new Intl.NumberFormat(SITE_LOCALE).format(part)}: ${title}`,
	},
	article: {
		breadcrumb: "Breadcrumb",
		groupedPosts: "Posts grouped by topic",
		updated: "Updated",
		previous: "Previous",
		next: "Next",
		navigation: "Navigation",
		allPosts: "All Posts",
		allTopics: "All Topics",
		relatedReading: "Related Reading",
		contents: "Table of Contents",
		topicConnections: "Topic connections",
		sharedTopics: (topics: string[]): string =>
			`Shared topics: ${new Intl.ListFormat(SITE_LOCALE).format(topics)}`,
	},
	collections: {
		emptyType: "No posts of this type yet.",
		connectionCount: (count: number): string =>
			new Intl.PluralRules(SITE_LOCALE).select(count) === "one"
				? "1 connection"
				: `${new Intl.NumberFormat(SITE_LOCALE).format(count)} connections`,
		postCount: (count: number): string =>
			new Intl.PluralRules(SITE_LOCALE).select(count) === "one"
				? "1 post"
				: `${new Intl.NumberFormat(SITE_LOCALE).format(count)} posts`,
		topicCount: (count: number): string =>
			new Intl.PluralRules(SITE_LOCALE).select(count) === "one"
				? "1 topic"
				: `${new Intl.NumberFormat(SITE_LOCALE).format(count)} topics`,
	},
	types: {
		note: { plural: "Notes", description: "Quick thoughts and observations" },
		essay: {
			plural: "Essays",
			description: "Long-form explorations and analysis",
		},
		guide: { plural: "Guides", description: "How-tos and tutorials" },
		link: {
			plural: "Links",
			description: "Links to external content with commentary",
		},
	},
	contents: { sections: "Sections", jump: "Jump to section", close: "Close" },
	navigation: {
		home: "Home",
		topics: "Topics",
		projects: "Projects",
		about: "About",
		search: "Search",
		toggle: "Toggle navigation",
		primary: "Main navigation",
		footer: "Site information",
		rss: "RSS Feed",
		archive: "Archive",
		contact: "Contact",
		privacy: "Privacy",
		builtWith: "Built with Astro.",
	},
	theme: { darkMode: "Dark mode" },
	copy: {
		menu: "Markdown",
		options: "Copy options",
		markdown: "Copy markdown",
		link: "Copy markdown link",
		downloadMarkdown: "Download markdown",
		code: "Copy code",
		button: "Copy",
		success: "Copied!",
		failure: "Copy failed. Select the text and copy it manually.",
		markdownSuccess: "Markdown copied",
		linkSuccess: "Markdown link copied",
		markdownFailure:
			"Unable to copy markdown. Download the markdown file and copy its text manually.",
		actionFailure:
			"Unable to copy. Download the markdown file and copy its text manually.",
		headingLabel: (heading: string): string => `Copy link to: ${heading}`,
		headingSuccess: "Heading link copied",
	},
	search: {
		indexTitle: "Every post",
		markdownIntro:
			"Browse every published post below. Open the search page for interactive title, description, and topic search. Cmd/Ctrl+K opens that page.",
		label: "Search posts",
		placeholder: "Search posts by title, description, or topic…",
		noResults: "No posts found. Try a different search.",
		results: (count: number): string =>
			new Intl.PluralRules(SITE_LOCALE).select(count) === "one"
				? "1 post found."
				: `${new Intl.NumberFormat(SITE_LOCALE).format(count)} posts found.`,
		allPosts: "Showing every post.",
	},
};

export function typeLabel(type: string): string {
	const entry = ui.types[type as keyof typeof ui.types];
	return entry?.plural ?? type;
}
