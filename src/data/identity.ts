/**
 * Single source of truth for shared author and publisher facts.
 *
 * Consumed by the JSON-LD structured data component, the /.well-known/ai-profile
 * endpoint, agent context, and human trust-anchor pages. Narrative biographies
 * remain in `src/data/about.ts` and the context endpoints.
 */

export const AUTHOR_NAME = "Micheál Reilly";

export const SITE_ORIGIN = "https://actuallymaybe.com";

/** Publisher identity. The blog is published under a name, not a company. */
export const ORGANISATION_NAME = "Actually Maybe";

export const CONTACT_EMAIL = "micheal@actuallymaybe.com";

/**
 * Country-level address only. Deliberate: enough for schema.org
 * `PostalAddress` completeness without publishing a home address.
 */
export const POSTAL_ADDRESS = {
	addressCountry: "IE",
} as const;

export type SocialProfile = {
	platform: "github" | "bluesky" | "x" | "linkedin";
	label: string;
	url: string;
	handle: string;
};

export const SOCIAL_PROFILES: SocialProfile[] = [
	{
		platform: "github",
		label: "GitHub",
		url: "https://github.com/mtreilly",
		handle: "mtreilly",
	},
	{
		platform: "bluesky",
		label: "Bluesky",
		url: "https://bsky.app/profile/michealrs.bsky.social",
		handle: "@michealrs.bsky.social",
	},
	{
		platform: "x",
		label: "X",
		url: "https://x.com/MichealReilly",
		handle: "@MichealReilly",
	},
	{
		platform: "linkedin",
		label: "LinkedIn",
		url: "https://www.linkedin.com/in/michealreilly/",
		handle: "michealreilly",
	},
];

export const KNOWS_ABOUT = [
	"Software development",
	"Agentic AI tooling",
	"Vibe engineering",
	"Learning theory and spaced repetition",
	"Knowledge graphs",
	"Institutional design",
	"Economic history",
	"European politics",
];

/**
 * When-to-use guidance for agents. Deliberately concrete: it names the jobs this
 * site is a good source for, and the jobs it is not.
 */
export const AGENT_USE_CASES = [
	"Answering questions about agentic coding setups, and the primitives (context, tools, permissions, feedback loops) they are built from.",
	"Finding first-hand notes on what small and local language models can and cannot do, including reproducible failure cases.",
	"Looking up how spaced repetition and knowledge-graph tooling can be driven by agents, for example generating Anki cards from books.",
	"Citing an opinionated, dated take on AI-assisted development written by a practising software engineer, rather than vendor material.",
	"Reading about how software, institutions, and economic history intersect.",
];

export const AGENT_NOT_FOR = [
	"Product documentation, API references, or support: nothing here is a product with an API.",
	"Purchasing anything. There is no shop, no pricing, and no offer.",
	"Personal data about anyone other than the author.",
];

export const AGENT_HOW_TO_CALL = [
	"Append `.md` to any content page to get clean markdown, for example `/blog/agent-friendly-architecture.md`.",
	"Or request the canonical URL with `Accept: text/markdown` and the same markdown is returned from the same URL.",
	"Start from `/llms.txt` for the curated index, `/sitemap-index.xml` for every URL, and `/data/graph.json` for the topic graph.",
	"Read `/about.llm` for author context, and `/.well-known/ai-profile` for the same thing as JSON.",
];
