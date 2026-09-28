/**
 * End-to-end negotiation test over real HTTP.
 *
 * Verifying the deployed behaviour needs `vercel dev` (and therefore Vercel
 * credentials), so this replays Vercel's documented middleware protocol locally
 * instead: run middleware.ts first, honour the sentinel it returns
 * (`x-middleware-next: 1` to continue, `x-middleware-rewrite: <url>` to serve a
 * different path), merge its headers onto the origin response, then serve from
 * `dist/` the way Vercel's filesystem handler does, including 404.html for
 * unmatched paths.
 *
 * It catches what the unit tests cannot: wrong content types on the rewritten
 * file, a 404 that answers 200, and headers lost between the two layers.
 *
 * Run after a build.
 */

import assert from "node:assert/strict";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import {
	createServer,
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import middleware from "../middleware";
import { VARY_VALUE } from "../src/lib/accept-negotiation";

const dist = resolve(process.cwd(), "dist");
assert.ok(existsSync(dist), "dist/ is missing: run `astro build` first");

/**
 * vercel.json `headers` entries, applied the way Vercel's routing layer does,
 * so the harness exercises the deployed configuration rather than an idealised
 * one. Only the two source shapes this project uses are supported: an exact
 * path, and the `/(.*)` catch-all.
 */
type HeaderRule = {
	source: string;
	headers: Array<{ key: string; value: string }>;
};

const headerRules: HeaderRule[] = JSON.parse(
	readFileSync(resolve(process.cwd(), "vercel.json"), "utf-8"),
).headers;

const configuredHeaders = (pathname: string): Record<string, string> => {
	const out: Record<string, string> = {};
	for (const rule of headerRules) {
		const applies = rule.source === "/(.*)" || rule.source === pathname;
		if (!applies) continue;
		for (const { key, value } of rule.headers) out[key.toLowerCase()] = value;
	}
	return out;
};

/** Mirrors the content types Vercel infers for this build output. */
const CONTENT_TYPES: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".md": "text/markdown; charset=utf-8",
	".txt": "text/plain; charset=utf-8",
	".llm": "text/plain; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".svg": "image/svg+xml",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".woff": "font/woff",
};

/** Resolve a request path to a file in dist, the way a static host would. */
const resolveFile = (pathname: string): string | null => {
	const relative = normalize(decodeURIComponent(pathname)).replace(
		/^(\.\.[/\\])+/,
		"",
	);
	const candidates = [
		join(dist, relative),
		join(dist, relative, "index.html"),
		join(dist, `${relative}.html`),
	];
	for (const candidate of candidates) {
		if (!candidate.startsWith(dist)) continue;
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return null;
};

const startServer = (): Promise<{ server: Server; base: string }> =>
	new Promise((resolvePromise) => {
		const server = createServer(
			(request: IncomingMessage, response: ServerResponse) => {
				const url = new URL(request.url ?? "/", "http://127.0.0.1");
				const headers = new Headers();
				for (const [key, value] of Object.entries(request.headers)) {
					if (typeof value === "string") headers.set(key, value);
				}

				const middlewareResponse = middleware(
					new Request(
						new URL(url.pathname + url.search, "https://actuallymaybe.com"),
						{
							method: request.method,
							headers,
						},
					),
				);

				const extraHeaders = new Headers(middlewareResponse.headers);
				const rewrite = extraHeaders.get("x-middleware-rewrite");
				const passThrough = extraHeaders.get("x-middleware-next") === "1";
				extraHeaders.delete("x-middleware-rewrite");
				extraHeaders.delete("x-middleware-next");

				// The middleware answered outright (406, markdown 404).
				if (!rewrite && !passThrough) {
					response.writeHead(
						middlewareResponse.status,
						Object.fromEntries(middlewareResponse.headers.entries()),
					);
					middlewareResponse
						.text()
						.then((body) => response.end(body))
						.catch(() => response.end());
					return;
				}

				const targetPath = rewrite ? new URL(rewrite).pathname : url.pathname;
				const file = resolveFile(targetPath);
				const outgoing: Record<string, string> = {};
				for (const [key, value] of extraHeaders.entries())
					outgoing[key] = value;
				// vercel.json headers are applied by the routing layer, so they land
				// after the middleware's own.
				Object.assign(outgoing, configuredHeaders(url.pathname));

				if (!file) {
					// Vercel serves 404.html with a real 404 status for a static deployment.
					const fallback = join(dist, "404.html");
					outgoing["content-type"] = CONTENT_TYPES[".html"];
					response.writeHead(404, outgoing);
					if (existsSync(fallback)) {
						createReadStream(fallback).pipe(response);
					} else {
						response.end();
					}
					return;
				}

				outgoing["content-type"] =
					configuredHeaders(url.pathname)["content-type"] ??
					CONTENT_TYPES[extname(file)] ??
					"application/octet-stream";
				response.writeHead(200, outgoing);
				createReadStream(file).pipe(response);
			},
		);

		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			const port = typeof address === "object" && address ? address.port : 0;
			resolvePromise({ server, base: `http://127.0.0.1:${port}` });
		});
	});

const { server, base } = await startServer();

const get = (path: string, accept?: string) =>
	fetch(`${base}${path}`, {
		headers: accept === undefined ? {} : { accept },
		redirect: "manual",
	});

const BROWSER_ACCEPT =
	"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

try {
	// --- HTML is unchanged for browsers, and carries Vary ---
	for (const path of [
		"/",
		"/about",
		"/about/",
		"/contact",
		"/privacy",
		"/blog/",
		"/graph",
		"/type/note",
		"/search",
	]) {
		const response = await get(path, BROWSER_ACCEPT);
		assert.equal(response.status, 200, `${path} should be 200 for a browser`);
		assert.match(
			response.headers.get("content-type") ?? "",
			/^text\/html/,
			`${path} should still serve HTML to a browser`,
		);
		assert.equal(
			response.headers.get("vary"),
			VARY_VALUE,
			`${path} should carry Vary`,
		);
		const body = await response.text();
		assert.ok(body.includes("<h1"), `${path} should contain an h1 in raw HTML`);
	}

	// --- acceptmarkdown check 1 and 2: markdown served, Vary: Accept present ---
	for (const path of [
		"/",
		"/about",
		"/contact",
		"/privacy",
		"/blog/agent-friendly-architecture",
		"/graph",
		"/type/note",
		"/search",
	]) {
		const response = await get(path, "text/markdown");
		assert.equal(
			response.status,
			200,
			`${path} should be 200 for a markdown client`,
		);
		assert.equal(
			response.headers.get("content-type"),
			"text/markdown; charset=utf-8",
			`${path} must answer Accept: text/markdown with text/markdown`,
		);
		const vary = response.headers.get("vary") ?? "";
		assert.ok(
			vary.split(",").some((token) => token.trim().toLowerCase() === "accept"),
			`${path} must send Vary: Accept, got ${JSON.stringify(vary)}`,
		);
		const expectedAlternate = `<${path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`}>; rel="alternate"; type="text/markdown"`;
		const link = response.headers.get("link") ?? "";
		assert.ok(
			link.includes(expectedAlternate),
			`${path} should advertise its markdown alternate, got ${JSON.stringify(link)}`,
		);
		for (const discovery of [
			'rel="llms-txt"',
			'rel="llm-context"',
			'rel="ai-profile"',
		]) {
			assert.ok(
				link.includes(discovery),
				`${path} Link should advertise ${discovery}`,
			);
		}
		const body = await response.text();
		assert.ok(
			body.startsWith("---\n"),
			`${path} markdown should open with frontmatter`,
		);
		assert.ok(
			body.includes("canonicalUrl:"),
			`${path} markdown should carry a canonical URL`,
		);
	}

	// The same URL really does serve two different representations.
	const asHtml = await (await get("/about", BROWSER_ACCEPT)).text();
	const asMarkdown = await (await get("/about", "text/markdown")).text();
	assert.notEqual(asHtml, asMarkdown, "/about must vary by Accept");
	assert.ok(
		asMarkdown.length < asHtml.length,
		"the markdown variant should be the smaller one",
	);

	// --- acceptmarkdown check 3: 406 for a type we cannot produce ---
	for (const accept of [
		"application/json",
		"image/png",
		"text/html;q=0, text/markdown;q=0",
	]) {
		const response = await get("/about", accept);
		assert.equal(response.status, 406, `Accept: ${accept} should be 406`);
		assert.equal(response.headers.get("vary"), VARY_VALUE);
		const body = await response.text();
		assert.ok(body.includes("406 Not Acceptable"), "406 body should say so");
		assert.ok(
			body.includes("text/markdown"),
			"406 body should name what we can produce",
		);
	}

	// --- acceptmarkdown check 4: q-values are honoured ---
	assert.equal(
		(await get("/about", "text/html;q=0.3, text/markdown;q=0.9")).headers.get(
			"content-type",
		),
		"text/markdown; charset=utf-8",
	);
	assert.match(
		(await get("/about", "text/markdown;q=0.3, text/html;q=0.9")).headers.get(
			"content-type",
		) ?? "",
		/^text\/html/,
	);
	assert.equal(
		(await get("/about", "text/html;q=0, */*")).headers.get("content-type"),
		"text/markdown; charset=utf-8",
		"a specific q=0 must not be overridden by the wildcard",
	);

	// --- a client with no Accept header is unaffected ---
	const bare = await get("/about");
	assert.equal(bare.status, 200);
	assert.match(bare.headers.get("content-type") ?? "", /^text\/html/);

	// --- 404s are real, in both representations ---
	const htmlMissing = await get(
		"/some-path-that-does-not-exist",
		BROWSER_ACCEPT,
	);
	assert.equal(
		htmlMissing.status,
		404,
		"an unknown path must answer 404, never 200",
	);
	assert.match(htmlMissing.headers.get("content-type") ?? "", /^text\/html/);
	const htmlMissingBody = await htmlMissing.text();
	assert.ok(
		htmlMissingBody.includes('href="/llms.txt"'),
		"the HTML 404 should point agents on",
	);
	assert.ok(htmlMissingBody.includes('href="/sitemap-index.xml"'));

	const markdownMissing = await get(
		"/some-path-that-does-not-exist",
		"text/markdown",
	);
	assert.equal(markdownMissing.status, 404);
	assert.equal(
		markdownMissing.headers.get("content-type"),
		"text/markdown; charset=utf-8",
	);
	const markdownMissingBody = await markdownMissing.text();
	assert.match(markdownMissingBody, /^# 404 /);
	assert.ok(markdownMissingBody.includes("/llms.txt"));
	assert.ok(markdownMissingBody.includes("/sitemap-index.xml"));

	// --- machine-readable files still serve themselves ---
	const checks: Array<[string, RegExp]> = [
		["/llms.txt", /^text\/plain/],
		["/llm.txt", /^text\/plain/],
		["/about.llm", /^text\/plain/],
		["/.well-known/ai-profile", /^application\/json/],
		["/sitemap-index.xml", /^application\/xml/],
		["/data/graph.json", /^application\/json/],
		["/rss.xml", /^application\/xml/],
	];
	for (const [path, expected] of checks) {
		const response = await get(path, "text/markdown");
		assert.equal(response.status, 200, `${path} should be 200`);
		assert.match(
			response.headers.get("content-type") ?? "",
			expected,
			`${path} content type`,
		);
	}

	// --- llms.txt is well formed over the wire ---
	const llms = await (await get("/llms.txt")).text();
	assert.ok(llms.startsWith("# "), "llms.txt must open with an H1");
	assert.match(llms, /^## When to use this site$/m);

	console.log("negotiation end-to-end tests passed.");
} finally {
	server.close();
}
