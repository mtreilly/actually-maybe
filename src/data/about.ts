// Structured types for clear semantics
export type CurrentlyItem = {
	category: 'building' | 'exploring' | 'writing-about';
	text: string;
	icon?: string;
};

export type ElsewhereLink = {
	platform: 'email' | 'github' | 'bluesky' | 'x' | 'rss';
	url: string;
	rel?: string;
};

export type AboutIntroSection = {
	sectionId: 'intro';
	type: 'narrative';
	paragraphs: Array<{
		text: string;
		highlight?: string; // Key term being defined
	}>;
};

export type CurrentlySection = {
	sectionId: 'currently';
	type: 'status';
	title: string;
	items: CurrentlyItem[];
};

export type ElsewhereSection = {
	sectionId: 'elsewhere';
	type: 'social-links';
	title: string;
	links: ElsewhereLink[];
};

export type WritingSection = {
	sectionId: 'writing';
	type: 'call-to-action';
	title: string;
	url: string;
	label: string;
};

export const aboutProfile = {
	name: 'Micheál Reilly',
	subtitle: 'Building AI-powered tools for vibe engineering and context-aided development.',
	tagline: 'AI-assisted development & minimalist design',
	bio: 'Software engineer focused on developer experience with large language models.',

	intro: {
		sectionId: 'intro',
		type: 'narrative',
		paragraphs: [
			{
				text: "I'm a software engineer focused on AI-assisted development and the emerging field of vibe engineering — designing systems that understand and amplify context, intent, and workflow.",
				highlight: 'vibe engineering',
			},
			{
				text: 'I build tools that help developers work more effectively with AI, exploring how large language models can become genuine collaborators in the development process rather than just autocomplete on steroids.',
			},
		],
	} as AboutIntroSection,

	currently: {
		sectionId: 'currently',
		type: 'status',
		title: 'Currently',
		items: [
			{ category: 'building', text: 'Tools for context-aided engineering workflows' },
			{
				category: 'exploring',
				text: 'Agent-based development patterns and AI collaboration',
			},
			{
				category: 'writing-about',
				text: 'AI engineering, developer experience, and minimalist design',
			},
		],
	} as CurrentlySection,

	elsewhere: {
		sectionId: 'elsewhere',
		type: 'social-links',
		title: 'Find me elsewhere',
		links: [
			{ platform: 'email', url: 'mailto:micheal@actuallymaybe.com', rel: 'me' },
			{ platform: 'github', url: 'https://github.com/mtreilly', rel: 'me' },
			{
				platform: 'bluesky',
				url: 'https://bsky.app/profile/michealrs.bsky.social',
				rel: 'me',
			},
			{ platform: 'x', url: 'https://x.com/MichealReilly', rel: 'me' },
			{ platform: 'rss', url: '/rss.xml' },
		],
	} as ElsewhereSection,

	writing: {
		sectionId: 'writing',
		type: 'call-to-action',
		title: 'Writing',
		url: '/blog/',
		label: 'View all posts →',
	} as WritingSection,
};
