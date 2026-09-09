/**
 * Audits the built output against the agent-readiness rules this repo now holds
 * itself to. Reads `dist/`, so run it after a build (scripts/test-graph-page.ts
 * performs the build in `pnpm test`).
 *
 * Each block maps to one finding from the readiness audit, named in a comment,
 * so a regression says which check it broke.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildRouteManifest, MANIFEST_PATH, serialiseRouteManifest } from '../src/integrations/route-manifest';

const root = process.cwd();
const dist = resolve(root, 'dist');

assert.ok(existsSync(dist), 'dist/ is missing: run `astro build` before this script');

const read = (relativePath: string) => readFileSync(join(dist, relativePath), 'utf-8');

const stripped = (html: string) =>
	html
		.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const headings = (html: string) =>
	Array.from(html.matchAll(/<h([1-6])\b/g)).map((match) => Number(match[1]));

const jsonLdBlocks = (html: string) =>
	Array.from(html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)).map(
		(match) => JSON.parse(match[1]),
	);

/**
 * Pages the audit judges directly, or that carry substantive prose. These must
 * clear 500 characters of raw-HTML text.
 */
const SUBSTANTIVE_PAGES = new Set([
	'index.html',
	'about/index.html',
	'contact/index.html',
	'privacy/index.html',
	'404.html',
	'blog/agent-friendly-architecture/index.html',
]);

/**
 * Navigational index pages are deliberately terse: their job is to link on, not
 * to hold prose. They still have to say something, hence a lower floor rather
 * than an exemption.
 */
const INDEX_PAGE_MINIMUM = 250;

const PAGES = [
	'index.html',
	'about/index.html',
	'contact/index.html',
	'privacy/index.html',
	'blog/index.html',
	'archive/index.html',
	'projects/index.html',
	'now/index.html',
	'search/index.html',
	'graph/index.html',
	'topics/index.html',
	'type/index.html',
	'topics/ai/index.html',
	'type/note/index.html',
	'blog/agent-friendly-architecture/index.html',
	'404.html',
];

// --- Finding 1: content without JavaScript, one H1, sequential headings ---
for (const page of PAGES) {
	const html = read(page);
	const levels = headings(html);
	const h1Count = levels.filter((level) => level === 1).length;
	assert.equal(h1Count, 1, `${page} must have exactly one <h1>, found ${h1Count}`);
	assert.equal(levels[0], 1, `${page} must open with the <h1>, opened with h${levels[0]}`);

	for (let index = 1; index < levels.length; index += 1) {
		const jump = levels[index] - levels[index - 1];
		assert.ok(
			jump <= 1,
			`${page} skips from h${levels[index - 1]} to h${levels[index]}; heading levels must not jump`,
		);
	}

	const minimum = SUBSTANTIVE_PAGES.has(page) ? 500 : INDEX_PAGE_MINIMUM;
	const text = stripped(html);
	assert.ok(
		text.length >= minimum,
		`${page} renders only ${text.length} characters of text without JavaScript, needs at least ${minimum}`,
	);
}

// The homepage H1 must be real content, not an empty shell.
const home = read('index.html');
const homeH1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(home);
assert.ok(homeH1, 'the homepage must have an <h1>');
assert.ok(
	stripped(homeH1[1]).length > 3,
	`the homepage <h1> must contain text, got ${JSON.stringify(stripped(homeH1[1]))}`,
);

// --- Finding 2: agent-friendly 404 ---
const notFound = read('404.html');
const notFoundText = stripped(notFound);
assert.ok(notFoundText.length >= 500, '404.html needs at least 500 characters of recovery content');
for (const pointer of ['/llms.txt', '/sitemap-index.xml', '/about.llm', '/blog/', '/topics/', '/contact/']) {
	assert.ok(notFound.includes(`href="${pointer}"`), `404.html should link to ${pointer}`);
}
assert.ok(notFound.includes('name="robots" content="noindex"'), '404.html should not be indexed');
// The markdown-bodied 404 is exercised in scripts/test-middleware.ts.

// --- Finding 3: markdown negotiation, and the pieces it depends on ---
const manifestPath = resolve(root, MANIFEST_PATH);
assert.ok(existsSync(manifestPath), `${MANIFEST_PATH} is missing`);
assert.equal(
	readFileSync(manifestPath, 'utf-8'),
	serialiseRouteManifest(buildRouteManifest(dist)),
	`${MANIFEST_PATH} is stale. Run \`astro build\` and commit the regenerated file, or middleware negotiation will point at routes that no longer exist.`,
);

const manifest = buildRouteManifest(dist);
for (const [route, markdownFile] of Object.entries(manifest.markdownRoutes)) {
	assert.ok(
		existsSync(join(dist, markdownFile)),
		`${MANIFEST_PATH} maps ${route} to ${markdownFile}, which does not exist in dist/`,
	);
}
for (const required of ['/', '/about', '/contact', '/privacy', '/blog']) {
	assert.ok(manifest.markdownRoutes[required], `${required} must have a markdown variant`);
}

const vercelConfig = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf-8'));
const globalHeaders = vercelConfig.headers?.find(
	(entry: { source: string }) => entry.source === '/(.*)',
);
assert.ok(globalHeaders, 'vercel.json must set headers for every path');
const varyHeader = globalHeaders.headers.find(
	(header: { key: string }) => header.key.toLowerCase() === 'vary',
);
assert.ok(varyHeader, 'vercel.json must set a Vary header');
assert.ok(
	varyHeader.value
		.split(',')
		.some((token: string) => token.trim().toLowerCase() === 'accept'),
	'vercel.json Vary must include Accept',
);
assert.ok(
	existsSync(resolve(root, 'middleware.ts')),
	'middleware.ts must sit at the project root for Vercel to run it',
);

// The markdown variants must actually be markdown, with usable frontmatter.
for (const markdownFile of ['index.md', 'about.md', 'contact.md', 'privacy.md']) {
	const markdown = read(markdownFile);
	assert.ok(markdown.startsWith('---\n'), `${markdownFile} must open with YAML frontmatter`);
	assert.match(markdown, /^canonicalUrl: "https:\/\//m, `${markdownFile} must declare a canonical URL`);
	assert.match(markdown, /\n# /, `${markdownFile} must contain an H1`);
}

// --- Findings 5 and 7: JSON-LD identity, and Organization completeness ---
const homeGraph = jsonLdBlocks(home);
assert.equal(homeGraph.length, 1, 'the homepage should emit exactly one JSON-LD block');
assert.equal(homeGraph[0]['@context'], 'https://schema.org');

const nodes: Array<Record<string, unknown>> = homeGraph[0]['@graph'];
assert.ok(Array.isArray(nodes), 'JSON-LD must use an @graph');

const byType = (type: string) =>
	nodes.find((node) => {
		const nodeType = node['@type'];
		return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
	});

const website = byType('WebSite');
const person = byType('Person');
const organisation = byType('Organization');

for (const [label, node] of [['WebSite', website], ['Person', person], ['Organization', organisation]] as const) {
	assert.ok(node, `the homepage JSON-LD must include a ${label} node`);
	assert.ok(node.name, `${label} must have a name`);
	assert.ok(node.url, `${label} must have a url`);
	assert.ok(node.description, `${label} must have a description`);
}

assert.ok(Array.isArray(person?.sameAs) && person.sameAs.length >= 3, 'Person needs sameAs profiles');

const contactPoints = organisation?.contactPoint as Array<Record<string, string>> | undefined;
assert.ok(Array.isArray(contactPoints) && contactPoints.length > 0, 'Organization needs a contactPoint');
for (const point of contactPoints) {
	assert.equal(point['@type'], 'ContactPoint');
	assert.ok(point.contactType, 'each contactPoint needs a contactType');
	assert.ok(point.email, 'each contactPoint needs an email');
}

const address = organisation?.address as Record<string, string> | undefined;
assert.ok(address, 'Organization needs an address');
assert.equal(address['@type'], 'PostalAddress', 'Organization address must be a PostalAddress');
assert.ok(address.addressCountry, 'Organization address needs at least a country');

// Every page carries the identity graph, and blog posts add a BlogPosting.
for (const page of PAGES.filter((page) => page !== '404.html')) {
	const blocks = jsonLdBlocks(read(page));
	assert.equal(blocks.length, 1, `${page} should emit exactly one JSON-LD block`);
	const types = blocks[0]['@graph'].map((node: Record<string, unknown>) => node['@type']).flat();
	for (const required of ['WebSite', 'Person', 'Organization']) {
		assert.ok(types.includes(required), `${page} JSON-LD is missing ${required}`);
	}
}
assert.equal(jsonLdBlocks(read('404.html')).length, 0, '404.html should not claim an identity');

const post = jsonLdBlocks(read('blog/agent-friendly-architecture/index.html'))[0];
const posting = post['@graph'].find((node: Record<string, unknown>) => node['@type'] === 'BlogPosting');
assert.ok(posting, 'a blog post must emit a BlogPosting node');
for (const field of ['headline', 'datePublished', 'dateModified', 'author', 'url']) {
	assert.ok(posting[field], `BlogPosting is missing ${field}`);
}

// --- Finding 6: agent instructions with when-to-use guidance ---
const llmsTxt = read('llms.txt');
assert.ok(llmsTxt.startsWith('# '), 'llms.txt must open with an H1 (llmstxt.org)');
const llmsLines = llmsTxt.split('\n');
assert.ok(
	llmsLines.slice(1).find((line) => line.trim().length > 0)?.startsWith('> '),
	'llms.txt must follow the H1 with a blockquote summary (llmstxt.org)',
);
assert.match(llmsTxt, /^## When to use this site$/m, 'llms.txt must carry when-to-use guidance');
assert.match(llmsTxt, /^## How to call it$/m, 'llms.txt must say how an agent should call the site');
assert.match(llmsTxt, /^## Posts$/m, 'llms.txt must list the posts');
assert.match(llmsTxt, /^## Optional$/m, 'llms.txt should mark secondary material Optional');
assert.ok(
	llmsTxt.split('\n').filter((line) => /^- \[[^\]]+\]\(https:\/\/[^)]+\)/.test(line)).length >= 20,
	'llms.txt file lists must use `- [name](url)` entries',
);

for (const file of ['llms.txt', 'llm.txt', 'about.llm']) {
	assert.ok(existsSync(join(dist, file)), `${file} must be published`);
}

const aboutLlm = read('about.llm');
assert.match(aboutLlm, /^## When To Use This Site$/m, 'about.llm must carry when-to-use guidance');

const aiProfile = JSON.parse(read('.well-known/ai-profile'));
for (const field of ['name', 'url', 'contact', 'when_to_use', 'when_not_to_use', 'how_to_call']) {
	assert.ok(aiProfile[field], `.well-known/ai-profile is missing ${field}`);
}
assert.ok(Array.isArray(aiProfile.when_to_use) && aiProfile.when_to_use.length >= 3);
assert.equal(aiProfile.agent_instructions_url, 'https://actuallymaybe.com/llms.txt');

// --- Finding 4 support: crawler and brand discovery signals ---
const robots = read('robots.txt');
assert.match(robots, /^User-agent: \*$/m, 'robots.txt must declare a user-agent group');
assert.match(robots, /^Allow: \/$/m, 'robots.txt must allow crawling');
assert.match(
	robots,
	/^Sitemap: https:\/\/actuallymaybe\.com\/sitemap-index\.xml$/m,
	'robots.txt must point at the sitemap so the domain gets indexed',
);
assert.ok(robots.includes('/llms.txt'), 'robots.txt should point agents at llms.txt');

for (const page of PAGES) {
	const html = read(page);
	assert.ok(
		html.includes('<meta name="author" content="Micheál Reilly">'),
		`${page} should name the author consistently`,
	);
	assert.ok(html.includes('rel="canonical"'), `${page} needs a canonical URL`);
	assert.ok(
		html.includes('rel="llms-txt"'),
		`${page} should advertise llms.txt for discovery`,
	);
}

// --- Finding 8: trust anchor pages ---
for (const [page, minimumChars] of [
	['about/index.html', 500],
	['contact/index.html', 500],
	['privacy/index.html', 500],
] as const) {
	const text = stripped(read(page));
	assert.ok(
		text.length >= minimumChars,
		`${page} has ${text.length} characters of content, needs at least ${minimumChars}`,
	);
}

const contactHtml = read('contact/index.html');
assert.ok(contactHtml.includes('mailto:micheal@actuallymaybe.com'), 'the contact page must publish an email');
assert.ok(contactHtml.includes('href="/privacy/"'), 'the contact page must link to the privacy page');

const privacyHtml = read('privacy/index.html');
assert.ok(privacyHtml.includes('href="/contact/"'), 'the privacy page must link to the contact page');
assert.match(privacyHtml, /<time datetime="\d{4}-\d{2}-\d{2}"/, 'the privacy page must be dated');

// Trust anchors must be reachable from every page.
for (const page of PAGES) {
	const html = read(page);
	for (const link of ['/about', '/contact', '/privacy']) {
		assert.ok(html.includes(`href="${link}"`), `${page} should link to ${link} in the footer`);
	}
}

// --- Toolchain pins must agree, or Vercel installs with a different pnpm
//     than the one that wrote the lockfile ---
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const pinnedPnpm = /^pnpm@(\d+\.\d+\.\d+)$/.exec(packageJson.packageManager);
assert.ok(pinnedPnpm, 'package.json must pin an exact pnpm version in packageManager');
assert.ok(
	vercelConfig.installCommand.includes(`pnpm@${pinnedPnpm[1]}`),
	`vercel.json installCommand must install pnpm@${pinnedPnpm[1]}, the version that wrote pnpm-lock.yaml, got ${JSON.stringify(vercelConfig.installCommand)}`,
);
assert.ok(
	readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf-8').includes("lockfileVersion: '9.0'"),
	'pnpm-lock.yaml should stay on lockfileVersion 9.0',
);

// Vercel's build image offers Node 20.x, 22.x and 24.x only, so a floor above
// 24 would be unsatisfiable there and the deploy would fail.
const nodeEngine = packageJson.engines?.node ?? '';
const nodeFloor = /^>=(\d+)/.exec(nodeEngine);
assert.ok(nodeFloor, `engines.node must be a >= range, got ${JSON.stringify(nodeEngine)}`);
assert.ok(
	Number(nodeFloor[1]) <= 24,
	`engines.node floor is ${nodeFloor[1]}, but Vercel's build image tops out at Node 24`,
);

const workspaceSettings = readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf-8');
for (const pkg of ['esbuild', 'sharp']) {
	assert.match(
		workspaceSettings,
		new RegExp(`^\\s+${pkg}: true$`, 'm'),
		`pnpm-workspace.yaml must allow ${pkg} to run its install script, or the build fails`,
	);
}

// --- Sitemap covers the new pages ---
const sitemap = read('sitemap-0.xml');
for (const path of ['/contact/', '/privacy/']) {
	assert.ok(sitemap.includes(`https://actuallymaybe.com${path}`), `sitemap is missing ${path}`);
}

console.log(`agent readiness audit passed across ${PAGES.length} pages.`);
