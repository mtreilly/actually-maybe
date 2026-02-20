export type Project = {
	name: string;
	description: string;
	url: string;
	status: 'Active' | 'In Progress' | 'Completed';
};

export const projects: Project[] = [
	{
		name: 'Agentic Tools & Vibe Engineering',
		description: 'Exploring what agentic tools can do under the rubric of vibe engineering—designing systems that understand context, intent, and workflow. Reference: Simon Willison\'s "Vibe Engineering" essay.',
		url: 'https://simonwillison.net/2025/Oct/7/vibe-engineering/',
		status: 'In Progress',
	},
	{
		name: 'Small Models Exploration',
		description: 'Building and experimenting with small language models to understand their capabilities and limitations across different domains.',
		url: '#',
		status: 'In Progress',
	},
	{
		name: 'Language Learning',
		description: 'Active language learning: French (B2), Polish (A2-B1), Spanish (A1). Exploring effective learning systems and spaced repetition.',
		url: '#',
		status: 'Active',
	},
	{
		name: 'Mountain to Climb',
		description: 'An interactive tool for exploring economic convergence between countries and regions—visualizing how long catch-up growth actually takes, what drives the timeline, and what development at scale implies.',
		url: 'https://mountaintoclimb.com',
		status: 'Active',
	},
	{
		name: 'Minimal Blog Platform',
		description: 'Scalable blog architecture with topics, types, and automatic discovery',
		url: 'https://github.com/mtreilly/actually-maybe',
		status: 'Active',
	},
];
