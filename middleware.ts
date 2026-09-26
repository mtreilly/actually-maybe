/**
 * Vercel Routing Middleware: markdown content negotiation on canonical URLs.
 *
 * This site is `output: 'static'`, so Astro middleware only runs at build time
 * and cannot negotiate per request. Vercel's Routing Middleware runs at the
 * edge ahead of the filesystem handler, which is the one place a static
 * deployment can honour an `Accept` header. Vercel also documents Routing
 * Middleware (not `vercel.json` rewrites) as the supported way to rewrite paths
 * on an Astro project.
 *
 * Behaviour, per acceptmarkdown.com:
 *   - `Accept: text/markdown` on a page URL is rewritten to the prebuilt
 *     `.md` sibling, which already carries `Content-Type: text/markdown`
 *   - every negotiated response carries `Vary: Accept` so a CDN cannot serve
 *     the HTML variant to an agent that asked for markdown
 *   - a client that accepts neither variant gets `406`
 *   - q-values, wildcard specificity, and `q=0` rejections are honoured
 *     (see src/lib/accept-negotiation.ts)
 *
 * Anything not covered above passes through untouched, so browser traffic and
 * asset requests behave exactly as they did before.
 */

// Vercel compiles this file on its own, outside the Astro/Vite module graph and
// with `module: nodenext`, so the imports below need the shapes NodeNext wants:
// a `with { type: 'json' }` attribute on the JSON import, and explicit `.js`
// extensions on relative ones (TypeScript resolves those to the `.ts` sources,
// and so does tsx, which runs the tests). Without these, `vercel build` reports
// TS1543 and TS2835.
import { next, rewrite } from "@vercel/functions";
import { buildNotFoundMarkdown } from "./src/data/not-found.js";
import manifest from "./src/generated/route-manifest.json" with {
	type: "json",
};
import {
	HTML_TYPE,
	looksLikeFile,
	MARKDOWN_TYPE,
	preferredType,
	routeKey,
	VARY_VALUE,
} from "./src/lib/accept-negotiation.js";

export const config = {
	/**
	 * The `middleware.ts` file convention defaults to the Edge runtime, which
	 * Vercel has deprecated. Same Request/Response API and the same
	 * `@vercel/functions` helpers, so nothing below changes.
	 */
	runtime: "nodejs",

	/**
	 * Skip hashed build assets, self-hosted fonts, and the favicon. Everything
	 * else, page routes and machine-readable files alike, is negotiated so the
	 * `Vary: Accept` header is never missing from a cacheable response.
	 */
	matcher: ["/((?!_astro/|fonts/|favicon\\.svg).*)"],
};

const markdownRoutes: Record<string, string> = manifest.markdownRoutes;
const htmlRoutes = new Set<string>(manifest.htmlRoutes);
const files = new Set<string>(manifest.files);

/**
 * Discovery links advertised on every response. These used to live in
 * astro.config.mjs under a `headers` key that is not part of Astro's config
 * schema, so they were silently dropped and never reached the wire. They are
 * emitted here rather than from vercel.json so a single Link header can also
 * carry the per-page markdown alternate below.
 */
const DISCOVERY_LINKS = [
	'</llms.txt>; rel="llms-txt"; type="text/plain"',
	'</about.llm>; rel="llm-context"; type="text/plain"',
	'</.well-known/ai-profile>; rel="ai-profile"; type="application/json"',
];

const linkHeader = (markdownPath?: string) => {
	const links = [...DISCOVERY_LINKS];
	if (markdownPath) {
		links.unshift(`<${markdownPath}>; rel="alternate"; type="text/markdown"`);
	}
	return links.join(", ");
};

/** 406: we cannot produce anything this client said it would take. */
const notAcceptable = () =>
	new Response(
		`406 Not Acceptable\n\nThis URL can be served as ${HTML_TYPE} or ${MARKDOWN_TYPE}.\nSend one of those in the Accept header, or omit Accept entirely.\n`,
		{
			status: 406,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				Vary: VARY_VALUE,
				"Cache-Control": "public, max-age=0, must-revalidate",
			},
		},
	);

/** 404 with a markdown body, for agents that asked for markdown. */
const markdownNotFound = (request: Request, pathname: string) =>
	new Response(buildNotFoundMarkdown(new URL(request.url).origin, pathname), {
		status: 404,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			Vary: VARY_VALUE,
			"Cache-Control": "public, max-age=0, must-revalidate",
		},
	});

export default function middleware(request: Request): Response {
	// Negotiation is only meaningful for safe, body-less reads.
	if (request.method !== "GET" && request.method !== "HEAD") {
		return next();
	}

	const { pathname } = new URL(request.url);
	const key = routeKey(pathname);
	const markdownPath = markdownRoutes[key];
	const chosen = preferredType(request.headers.get("accept"));

	if (chosen === null) {
		return notAcceptable();
	}

	const headers: Record<string, string> = {
		Vary: VARY_VALUE,
		Link: linkHeader(markdownPath),
	};

	if (chosen === MARKDOWN_TYPE) {
		if (markdownPath) {
			return rewrite(new URL(markdownPath, request.url), { headers });
		}
		// No markdown variant. Distinguish "page exists, HTML only" from a genuine
		// 404 so an agent asking for markdown still gets a usable recovery body.
		const exists =
			htmlRoutes.has(key) || files.has(pathname) || looksLikeFile(pathname);
		if (!exists) {
			return markdownNotFound(request, pathname);
		}
	}

	return next({ headers });
}
