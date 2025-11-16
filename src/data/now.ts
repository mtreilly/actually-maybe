export type NowSection = {
	title: string;
	items: string[];
};

export const nowPage = {
	subtitle: "What I'm working on right now (updated Nov 2025)",
	lastUpdated: 'November 15, 2025',
	sections: <NowSection[]>[
		{
			title: 'Building',
			items: [
				'Minimal blog platform with organizational features (topics, types, archives)',
				'Claude Code IDE for local AI-assisted development',
				'Context-aided engineering tools and workflows',
			],
		},
		{
			title: 'Exploring',
			items: [
				'Agent-based development patterns and multi-agent workflows',
				'How LLMs can genuinely collaborate in development, not just autocomplete',
				'Vibe engineering: designing systems that understand context and intent',
				'Minimal design for complex information architecture',
			],
		},
		{
			title: 'Reading',
			items: [
				'Papers on prompt engineering and chain-of-thought reasoning',
				'Essays on minimalism in design and technology',
				'Open source code for architecture patterns',
			],
		},
		{
			title: 'Learning',
			items: [
				'Advanced Astro patterns for static site generation at scale',
				'Information architecture for 1000s of interconnected notes',
				'Building tools developers actually want to use',
			],
		},
	],
};
