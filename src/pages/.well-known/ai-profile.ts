import type { APIRoute } from 'astro';
import {
	AGENT_HOW_TO_CALL,
	AGENT_NOT_FOR,
	AGENT_USE_CASES,
	POSTAL_ADDRESS,
} from '../../data/identity';

const profile = {
	name: 'Micheál Reilly',
	description: 'Software engineer interested in AI, learning systems, institutions, and economic history',
	url: 'https://actuallymaybe.com',
	about_url: 'https://actuallymaybe.com/about',
	llm_context_url: 'https://actuallymaybe.com/about.llm',
	contact: 'micheal@actuallymaybe.com',
	address: {
		country: POSTAL_ADDRESS.addressCountry,
	},
	agent_instructions_url: 'https://actuallymaybe.com/llms.txt',
	contact_url: 'https://actuallymaybe.com/contact',
	privacy_url: 'https://actuallymaybe.com/privacy',
	when_to_use: AGENT_USE_CASES,
	when_not_to_use: AGENT_NOT_FOR,
	how_to_call: AGENT_HOW_TO_CALL,
	profiles: {
		github: 'https://github.com/mtreilly',
		linkedin: 'https://www.linkedin.com/in/michealreilly/',
		bluesky: 'https://bsky.app/profile/michealrs.bsky.social',
		x: 'https://x.com/MichealReilly',
	},
	interests: [
		'software development',
		'AI systems',
		'hardware',
		'learning theory',
		'institutional design',
		'economic history',
		'european politics',
		'vibe engineering',
	],
	languages: {
		english: 'native',
		french: 'B2',
		polish: 'A2-B1',
		spanish: 'A1',
	},
	current_projects: [
		'Agentic tools & vibe engineering',
		'Small models exploration',
		'Language learning',
		'Blog & writing',
	],
	unique_interests: [
		'Export juggling',
		'Punctuation innovation and experimentation',
	],
};

export const GET: APIRoute = () =>
	new Response(JSON.stringify(profile, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			Vary: 'Accept',
		},
	});
