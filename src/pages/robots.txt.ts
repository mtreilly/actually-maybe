/**
 * /robots.txt. The site had none, so crawlers had no sitemap pointer and agents
 * had no signal that markdown variants exist. Everything is allowed: this is a
 * public blog, and blocking AI crawlers here would defeat the point of serving
 * markdown at all.
 */

import type { APIRoute } from "astro";
import { SITE_ORIGIN } from "../data/identity";
import { VARY_VALUE } from "../lib/accept-negotiation";

export const GET: APIRoute = ({ site, url }) => {
	const origin = site?.origin ?? url.origin ?? SITE_ORIGIN;
	const absolute = (path: string) => new URL(path, origin).toString();

	const body = `# actuallymaybe.com
# Crawling and fetching are welcome, agents included. Please keep to a
# reasonable request rate and identify yourself in the User-Agent string.
# Agent instructions, including when to use this site: ${absolute("/llms.txt")}

User-agent: *
Allow: /

Sitemap: ${absolute("/sitemap-index.xml")}
`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			Vary: VARY_VALUE,
		},
	});
};
