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

import { next, rewrite } from '@vercel/functions';
import manifest from './src/generated/route-manifest.json';
import {
	HTML_TYPE,
	MARKDOWN_TYPE,
	looksLikeFile,
	preferredType,
	routeKey,
	VARY_VALUE,
} from './src/lib/accept-negotiation';
import { buildNotFoundMarkdown } from './src/data/not-found';

export const config = {
	/**
	 * Skip hashed build assets, self-hosted fonts, and the favicon. Everything
	 * else, page routes and machine-readable files alike, is negotiated so the
	 * `Vary: Accept` header is never missing from a cacheable response.
	 */
	matcher: ['/((?!_astro/|fonts/|favicon\\.svg).*)'],
};

const markdownRoutes: Record<string, string> = manifest.markdownRoutes;
const htmlRoutes = new Set<string>(manifest.htmlRoutes);
const files = new Set<string>(manifest.files);

const markdownAlternateLink = (markdownPath: string) =>
	`<${markdownPath}>; rel="alternate"; type="text/markdown"`;

/** 406: we cannot produce anything this client said it would take. */
const notAcceptable = () =>
	new Response(
		`406 Not Acceptable\n\nThis URL can be served as ${HTML_TYPE} or ${MARKDOWN_TYPE}.\nSend one of those in the Accept header, or omit Accept entirely.\n`,
		{
			status: 406,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				Vary: VARY_VALUE,
				'Cache-Control': 'public, max-age=0, must-revalidate',
			},
		},
	);

/** 404 with a markdown body, for agents that asked for markdown. */
const markdownNotFound = (request: Request, pathname: string) =>
	new Response(buildNotFoundMarkdown(new URL(request.url).origin, pathname), {
		status: 404,
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			Vary: VARY_VALUE,
			'Cache-Control': 'public, max-age=0, must-revalidate',
		},
	});

export default function middleware(request: Request): Response {
	// Negotiation is only meaningful for safe, body-less reads.
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		return next();
	}

	const { pathname } = new URL(request.url);
	const key = routeKey(pathname);
	const markdownPath = markdownRoutes[key];
	const chosen = preferredType(request.headers.get('accept'));

	if (chosen === null) {
		return notAcceptable();
	}

	const headers: Record<string, string> = { Vary: VARY_VALUE };
	if (markdownPath) {
		headers.Link = markdownAlternateLink(markdownPath);
	}

	if (chosen === MARKDOWN_TYPE) {
		if (markdownPath) {
			return rewrite(new URL(markdownPath, request.url), { headers });
		}
		// No markdown variant. Distinguish "page exists, HTML only" from a genuine
		// 404 so an agent asking for markdown still gets a usable recovery body.
		const exists = htmlRoutes.has(key) || files.has(pathname) || looksLikeFile(pathname);
		if (!exists) {
			return markdownNotFound(request, pathname);
		}
	}

	return next({ headers });
}
