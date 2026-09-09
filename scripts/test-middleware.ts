/**
 * Behaviour tests for the Vercel Routing Middleware in middleware.ts.
 *
 * The middleware returns sentinel responses that Vercel interprets:
 *   `x-middleware-next: 1`      -> pass through to the filesystem
 *   `x-middleware-rewrite: URL` -> serve that path instead
 * Everything else is a response we produce ourselves (406, markdown 404).
 *
 * Run after a build so the committed route manifest matches the real output.
 */

import assert from 'node:assert/strict';
import middleware from '../middleware';
import { VARY_VALUE } from '../src/lib/accept-negotiation';

const ORIGIN = 'https://actuallymaybe.com';

const call = (path: string, init: { accept?: string; method?: string } = {}) => {
	const headers = new Headers();
	if (init.accept !== undefined) headers.set('accept', init.accept);
	return middleware(new Request(new URL(path, ORIGIN), { method: init.method ?? 'GET', headers }));
};

const isPassThrough = (response: Response) => response.headers.get('x-middleware-next') === '1';
const rewriteTarget = (response: Response) => response.headers.get('x-middleware-rewrite');

const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

// --- HTML traffic is untouched, but always carries Vary ---
for (const path of ['/', '/about', '/about/', '/blog/', '/contact', '/privacy', '/graph']) {
	const response = call(path, { accept: BROWSER_ACCEPT });
	assert.ok(isPassThrough(response), `${path} should pass through for a browser Accept`);
	assert.equal(response.headers.get('Vary'), VARY_VALUE, `${path} should carry Vary`);
}

const noAccept = call('/');
assert.ok(isPassThrough(noAccept), 'a request with no Accept header passes through to HTML');
assert.equal(noAccept.headers.get('Vary'), VARY_VALUE);

// --- markdown requests are rewritten to the prebuilt sibling ---
const cases: Array<[string, string]> = [
	['/', '/index.md'],
	['/about', '/about.md'],
	['/about/', '/about.md'],
	['/contact', '/contact.md'],
	['/privacy', '/privacy.md'],
	['/blog', '/blog.md'],
	['/blog/agent-friendly-architecture', '/blog/agent-friendly-architecture.md'],
	['/blog/agent-friendly-architecture/', '/blog/agent-friendly-architecture.md'],
	['/topics/ai', '/topics/ai.md'],
	['/type/note', '/type/note.md'],
];

for (const [path, expected] of cases) {
	const response = call(path, { accept: 'text/markdown' });
	assert.equal(
		rewriteTarget(response),
		new URL(expected, ORIGIN).toString(),
		`${path} with Accept: text/markdown should rewrite to ${expected}`,
	);
	assert.equal(response.headers.get('Vary'), VARY_VALUE, `${path} markdown response should carry Vary`);
	assert.equal(
		response.headers.get('Link'),
		`<${expected}>; rel="alternate"; type="text/markdown"`,
		`${path} should advertise its markdown alternate`,
	);
}

// --- the Link alternate is advertised on the HTML variant too ---
const htmlWithAlternate = call('/about', { accept: BROWSER_ACCEPT });
assert.equal(
	htmlWithAlternate.headers.get('Link'),
	'</about.md>; rel="alternate"; type="text/markdown"',
);

// --- q-values reach the middleware, not just the parser ---
assert.equal(
	rewriteTarget(call('/about', { accept: 'text/html;q=0.4, text/markdown;q=0.9' })),
	new URL('/about.md', ORIGIN).toString(),
);
assert.ok(
	isPassThrough(call('/about', { accept: 'text/markdown;q=0.2, text/html;q=0.8' })),
	'a client preferring HTML gets HTML',
);

// --- 406 when we can produce nothing the client accepts ---
for (const accept of ['application/json', 'image/png', 'text/html;q=0, text/markdown;q=0']) {
	const response = call('/about', { accept });
	assert.equal(response.status, 406, `Accept: ${accept} should be 406`);
	assert.equal(response.headers.get('Vary'), VARY_VALUE);
	assert.match(response.headers.get('Content-Type') ?? '', /^text\/plain/);
}

// --- unknown paths: markdown clients get a markdown 404 with recovery links ---
const missing = call('/no-such-path-xyz', { accept: 'text/markdown' });
assert.equal(missing.status, 404);
assert.equal(missing.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
assert.equal(missing.headers.get('Vary'), VARY_VALUE);
const missingBody = await missing.text();
assert.match(missingBody, /^# 404 /, 'the markdown 404 starts with an H1');
assert.ok(missingBody.includes('/no-such-path-xyz'), 'the markdown 404 names the missing path');
for (const pointer of ['/llms.txt', '/sitemap-index.xml', '/about.llm', '/blog/', '/contact/']) {
	assert.ok(
		missingBody.includes(`${ORIGIN}${pointer}`),
		`the markdown 404 should point at ${pointer}`,
	);
}

// --- unknown paths for HTML clients fall through to dist/404.html ---
assert.ok(
	isPassThrough(call('/no-such-path-xyz', { accept: BROWSER_ACCEPT })),
	'HTML clients fall through so Vercel serves 404.html with a 404 status',
);

// --- an HTML-only page asked for as markdown still serves, it is not a 404 ---
assert.ok(
	isPassThrough(call('/graph', { accept: 'text/markdown' })),
	'/graph has no markdown variant but does exist, so it must not 404',
);

// --- machine-readable files pass through untouched ---
for (const path of ['/llms.txt', '/llm.txt', '/rss.xml', '/data/graph.json', '/.well-known/ai-profile']) {
	const response = call(path, { accept: 'text/markdown' });
	assert.ok(isPassThrough(response), `${path} should pass through, not 404`);
}

// --- non-safe methods are never negotiated ---
for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
	const response = call('/about', { accept: 'text/markdown', method });
	assert.ok(isPassThrough(response), `${method} should pass through untouched`);
	assert.equal(rewriteTarget(response), null, `${method} should never be rewritten`);
}

// --- HEAD negotiates like GET ---
assert.equal(
	rewriteTarget(call('/about', { accept: 'text/markdown', method: 'HEAD' })),
	new URL('/about.md', ORIGIN).toString(),
);

// --- the matcher must not swallow build assets ---
const matcher = new RegExp(`^${(await import('../middleware')).config.matcher[0]}$`);
for (const asset of ['/_astro/index.abc123.css', '/fonts/atkinson-regular.woff', '/favicon.svg']) {
	assert.equal(matcher.test(asset), false, `${asset} should be excluded from the matcher`);
}
for (const page of ['/', '/about', '/blog/agent-friendly-architecture', '/llms.txt']) {
	assert.equal(matcher.test(page), true, `${page} should be matched`);
}

console.log('middleware negotiation tests passed.');
