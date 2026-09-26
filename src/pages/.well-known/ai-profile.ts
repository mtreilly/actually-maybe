import type { APIRoute } from "astro";
import {
	AGENT_HOW_TO_CALL,
	AGENT_NOT_FOR,
	AGENT_USE_CASES,
	AUTHOR_NAME,
	CONTACT_EMAIL,
	POSTAL_ADDRESS,
	SITE_ORIGIN,
	SOCIAL_PROFILES,
} from "../../data/identity";
import { VARY_VALUE } from "../../lib/accept-negotiation";

const profile = {
	name: AUTHOR_NAME,
	description:
		"Software engineer interested in AI, learning systems, institutions, and economic history",
	url: SITE_ORIGIN,
	about_url: new URL("/about", SITE_ORIGIN).toString(),
	llm_context_url: new URL("/about.llm", SITE_ORIGIN).toString(),
	contact: CONTACT_EMAIL,
	address: {
		country: POSTAL_ADDRESS.addressCountry,
	},
	agent_instructions_url: new URL("/llms.txt", SITE_ORIGIN).toString(),
	contact_url: new URL("/contact", SITE_ORIGIN).toString(),
	privacy_url: new URL("/privacy", SITE_ORIGIN).toString(),
	when_to_use: AGENT_USE_CASES,
	when_not_to_use: AGENT_NOT_FOR,
	how_to_call: AGENT_HOW_TO_CALL,
	profiles: Object.fromEntries(
		SOCIAL_PROFILES.map((profile) => [profile.platform, profile.url]),
	),
	interests: [
		"software development",
		"AI systems",
		"hardware",
		"learning theory",
		"institutional design",
		"economic history",
		"european politics",
		"vibe engineering",
	],
	languages: {
		english: "native",
		french: "B2",
		polish: "A2-B1",
		spanish: "A1",
	},
	current_projects: [
		"Agentic tools & vibe engineering",
		"Small models exploration",
		"Language learning",
		"Blog & writing",
	],
	unique_interests: [
		"Export juggling",
		"Punctuation innovation and experimentation",
	],
};

export const GET: APIRoute = () =>
	new Response(JSON.stringify(profile, null, 2), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			Vary: VARY_VALUE,
		},
	});
