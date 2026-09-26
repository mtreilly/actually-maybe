import { AUTHOR_NAME, CONTACT_EMAIL, SOCIAL_PROFILES } from "./identity";

// Structured types for clear semantics
export type CurrentlyItem = {
	category: "building" | "exploring" | "writing-about";
	text: string;
	icon?: string;
};

export type ElsewhereLink = {
	platform: "email" | "github" | "bluesky" | "x" | "linkedin" | "rss";
	url: string;
	rel?: string;
};

export type AboutIntroSection = {
	sectionId: "intro";
	type: "narrative";
	paragraphs: Array<{
		text: string;
		highlight?: string; // Key term being defined
	}>;
};

export type CurrentlySection = {
	sectionId: "currently";
	type: "status";
	title: string;
	items: CurrentlyItem[];
};

export type ElsewhereSection = {
	sectionId: "elsewhere";
	type: "social-links";
	title: string;
	links: ElsewhereLink[];
};

export type WritingSection = {
	sectionId: "writing";
	type: "call-to-action";
	title: string;
	url: string;
	label: string;
};

export const aboutProfile = {
	name: AUTHOR_NAME,
	subtitle:
		"Software engineer exploring AI, learning systems, institutions, and economic history.",
	tagline: "Software development, AI, and understanding how systems work",
	bio: "Software engineer interested in AI, learning, institutional design, and how technology intersects with economics and politics.",

	intro: {
		sectionId: "intro",
		type: "narrative",
		paragraphs: [
			{
				text: "I'm a software engineer interested in how technology shapes and is shaped by institutions, economics, and human learning. I work on problems across several domains: building AI-assisted development tools, understanding how to learn effectively, and thinking through the implications of technological change.",
			},
			{
				text: "My interests span software development, hardware, European politics and institutions, economic history, AI systems, and learning—both how humans learn and how to design better learning systems. I write about these topics and their intersections on this blog.",
			},
		],
	} as AboutIntroSection,

	currently: {
		sectionId: "currently",
		type: "status",
		title: "Currently",
		items: [
			{
				category: "building",
				text: "Software tools and exploring AI-assisted workflows",
			},
			{
				category: "exploring",
				text: "Institutional design, learning systems, and technology's role in economic change",
			},
			{
				category: "writing-about",
				text: "Software development, AI, learning, institutions, and economic history",
			},
		],
	} as CurrentlySection,

	elsewhere: {
		sectionId: "elsewhere",
		type: "social-links",
		title: "Find me elsewhere",
		links: [
			{ platform: "email", url: `mailto:${CONTACT_EMAIL}`, rel: "me" },
			...SOCIAL_PROFILES.map(({ platform, url }) => ({
				platform,
				url,
				rel: "me",
			})),
			{ platform: "rss", url: "/rss.xml" },
		],
	} as ElsewhereSection,

	writing: {
		sectionId: "writing",
		type: "call-to-action",
		title: "Writing",
		url: "/blog/",
		label: "View all posts →",
	} as WritingSection,
};
