export type Project = {
	name: string;
	description: string;
	url: string;
	status: 'Active' | 'In Progress' | 'Completed';
};

export const projects: Project[] = [
	{
		name: 'Claude Code',
		description: 'IDE for local AI-assisted development with your LLM',
		url: 'https://github.com/anthropics/claude-code',
		status: 'Active',
	},
	{
		name: 'Vibe Engineering Tools',
		description: 'Exploring how to build tools that understand context and amplify developer workflow',
		url: '#',
		status: 'In Progress',
	},
	{
		name: 'Context-Aided Engineering',
		description: 'Research and patterns for AI-assisted development that actually collaborates',
		url: '#',
		status: 'In Progress',
	},
	{
		name: 'Minimal Blog Platform',
		description: 'Scalable blog architecture with topics, types, and automatic discovery',
		url: 'https://github.com/micheal/actuallymaybe',
		status: 'Active',
	},
];
