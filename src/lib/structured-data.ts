/**
 * JSON-LD structured data builder.
 *
 * Emits a single `@graph` so the stable identity nodes (WebSite, Person,
 * Organization) are declared once and referenced by `@id` from the per-page node.
 * Pure functions, so `scripts/test-agent-readiness.ts` can assert on the shape
 * without rendering Astro.
 */

import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { aboutProfile } from "../data/about";
import {
	CONTACT_EMAIL,
	KNOWS_ABOUT,
	ORGANISATION_NAME,
	POSTAL_ADDRESS,
	SOCIAL_PROFILES,
} from "../data/identity";

export const WEBSITE_ID = "#website";
export const PERSON_ID = "#person";
export const ORGANISATION_ID = "#organization";

type JsonLdNode = Record<string, unknown>;

export type StructuredDataPage =
	| { kind: "home" }
	| { kind: "about" }
	| { kind: "contact" }
	| { kind: "privacy" }
	| { kind: "collection"; name: string; description: string; path: string }
	| { kind: "page"; name: string; description: string; path: string }
	| {
			kind: "post";
			name: string;
			description?: string;
			path: string;
			datePublished: Date;
			dateModified?: Date;
			topics?: string[];
			articleSection?: string;
			imageUrl?: string;
			wordCount?: number;
	  };

const absolute = (origin: string, path: string) =>
	new URL(path, origin).toString();

const nodeId = (origin: string, fragment: string) =>
	`${absolute(origin, "/")}${fragment}`;

/** Identity nodes. Identical on every page so agents can dedupe by `@id`. */
const buildIdentityNodes = (origin: string): JsonLdNode[] => {
	const sameAs = SOCIAL_PROFILES.map((profile) => profile.url);

	const person: JsonLdNode = {
		"@type": "Person",
		"@id": nodeId(origin, PERSON_ID),
		name: aboutProfile.name,
		url: absolute(origin, "/about/"),
		description: aboutProfile.bio,
		jobTitle: "Software Engineer",
		email: `mailto:${CONTACT_EMAIL}`,
		knowsAbout: KNOWS_ABOUT,
		knowsLanguage: ["en", "fr", "pl", "es"],
		sameAs,
		address: {
			"@type": "PostalAddress",
			...POSTAL_ADDRESS,
		},
	};

	const organisation: JsonLdNode = {
		"@type": "Organization",
		"@id": nodeId(origin, ORGANISATION_ID),
		name: ORGANISATION_NAME,
		alternateName: "actuallymaybe.com",
		url: absolute(origin, "/"),
		description: SITE_DESCRIPTION,
		logo: absolute(origin, "/favicon.svg"),
		email: `mailto:${CONTACT_EMAIL}`,
		founder: { "@id": nodeId(origin, PERSON_ID) },
		sameAs,
		address: {
			"@type": "PostalAddress",
			...POSTAL_ADDRESS,
		},
		contactPoint: [
			{
				"@type": "ContactPoint",
				contactType: "customer support",
				email: CONTACT_EMAIL,
				url: absolute(origin, "/contact/"),
				availableLanguage: ["English", "French"],
			},
			{
				"@type": "ContactPoint",
				contactType: "technical support",
				email: CONTACT_EMAIL,
				url: absolute(origin, "/contact/"),
				availableLanguage: ["English"],
			},
		],
	};

	const website: JsonLdNode = {
		"@type": "WebSite",
		"@id": nodeId(origin, WEBSITE_ID),
		name: SITE_TITLE,
		alternateName: ORGANISATION_NAME,
		url: absolute(origin, "/"),
		description: SITE_DESCRIPTION,
		inLanguage: "en-IE",
		author: { "@id": nodeId(origin, PERSON_ID) },
		publisher: { "@id": nodeId(origin, ORGANISATION_ID) },
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${absolute(origin, "/search/")}?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return [website, person, organisation];
};

const buildPageNode = (
	origin: string,
	page: StructuredDataPage,
): JsonLdNode => {
	const common = {
		isPartOf: { "@id": nodeId(origin, WEBSITE_ID) },
		inLanguage: "en-IE",
		publisher: { "@id": nodeId(origin, ORGANISATION_ID) },
	};

	switch (page.kind) {
		case "home":
			return {
				"@type": ["WebPage", "ProfilePage"],
				"@id": absolute(origin, "/"),
				url: absolute(origin, "/"),
				name: SITE_TITLE,
				description: SITE_DESCRIPTION,
				mainEntity: { "@id": nodeId(origin, PERSON_ID) },
				about: { "@id": nodeId(origin, PERSON_ID) },
				...common,
			};
		case "about":
			return {
				"@type": ["AboutPage", "ProfilePage"],
				"@id": absolute(origin, "/about/"),
				url: absolute(origin, "/about/"),
				name: `About ${aboutProfile.name}`,
				description: aboutProfile.subtitle,
				mainEntity: { "@id": nodeId(origin, PERSON_ID) },
				...common,
			};
		case "contact":
			return {
				"@type": "ContactPage",
				"@id": absolute(origin, "/contact/"),
				url: absolute(origin, "/contact/"),
				name: `Contact ${aboutProfile.name}`,
				description: `How to reach ${aboutProfile.name}, and what to expect.`,
				mainEntity: { "@id": nodeId(origin, ORGANISATION_ID) },
				...common,
			};
		case "privacy":
			return {
				"@type": "WebPage",
				"@id": absolute(origin, "/privacy/"),
				url: absolute(origin, "/privacy/"),
				name: "Privacy",
				description: `What ${ORGANISATION_NAME} does and does not collect.`,
				about: { "@id": nodeId(origin, ORGANISATION_ID) },
				...common,
			};
		case "collection":
			return {
				"@type": "CollectionPage",
				"@id": absolute(origin, page.path),
				url: absolute(origin, page.path),
				name: page.name,
				description: page.description,
				...common,
			};
		case "page":
			return {
				"@type": "WebPage",
				"@id": absolute(origin, page.path),
				url: absolute(origin, page.path),
				name: page.name,
				description: page.description,
				...common,
			};
		case "post": {
			const node: JsonLdNode = {
				"@type": "BlogPosting",
				"@id": absolute(origin, page.path),
				url: absolute(origin, page.path),
				headline: page.name,
				name: page.name,
				datePublished: page.datePublished.toISOString(),
				dateModified: (page.dateModified ?? page.datePublished).toISOString(),
				author: { "@id": nodeId(origin, PERSON_ID) },
				mainEntityOfPage: { "@id": absolute(origin, page.path) },
				...common,
			};
			if (page.description) node.description = page.description;
			if (page.topics?.length) node.keywords = page.topics;
			if (page.articleSection) node.articleSection = page.articleSection;
			if (page.imageUrl) node.image = page.imageUrl;
			if (page.wordCount) node.wordCount = page.wordCount;
			return node;
		}
	}
};

export const buildStructuredData = ({
	origin,
	page,
}: {
	origin: string;
	page: StructuredDataPage;
}) => ({
	"@context": "https://schema.org",
	"@graph": [...buildIdentityNodes(origin), buildPageNode(origin, page)],
});
