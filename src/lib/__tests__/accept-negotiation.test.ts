import assert from "node:assert/strict";
import {
	HTML_TYPE,
	looksLikeFile,
	MARKDOWN_TYPE,
	parseAccept,
	preferredType,
	routeKey,
	VARY_VALUE,
} from "../accept-negotiation";

/** Covers the four acceptmarkdown.com readiness checks plus the RFC 9110 edge cases. */

// --- no preference expressed: browsers and bare curl keep getting HTML ---
assert.equal(preferredType(null), HTML_TYPE, "missing Accept defaults to HTML");
assert.equal(
	preferredType(undefined),
	HTML_TYPE,
	"undefined Accept defaults to HTML",
);
assert.equal(preferredType(""), HTML_TYPE, "empty Accept defaults to HTML");
assert.equal(
	preferredType("   "),
	HTML_TYPE,
	"whitespace Accept defaults to HTML",
);
assert.equal(
	preferredType("*/*"),
	HTML_TYPE,
	"wildcard prefers the server default",
);

// --- markdown is served when asked for ---
assert.equal(preferredType("text/markdown"), MARKDOWN_TYPE);
assert.equal(preferredType("text/markdown; charset=utf-8"), MARKDOWN_TYPE);
assert.equal(
	preferredType("TEXT/MARKDOWN"),
	MARKDOWN_TYPE,
	"media types are case insensitive",
);
assert.equal(
	preferredType("  text/markdown  "),
	MARKDOWN_TYPE,
	"surrounding whitespace ignored",
);

// --- HTML is served when asked for ---
assert.equal(preferredType("text/html"), HTML_TYPE);
assert.equal(
	preferredType(
		"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	),
	HTML_TYPE,
	"a typical browser Accept string still gets HTML",
);

// --- q-values decide, and equal q falls back to client order ---
assert.equal(
	preferredType("text/html;q=0.5, text/markdown;q=0.9"),
	MARKDOWN_TYPE,
);
assert.equal(preferredType("text/markdown;q=0.4, text/html;q=0.8"), HTML_TYPE);
assert.equal(
	preferredType("text/markdown, text/html, */*"),
	MARKDOWN_TYPE,
	"equal q breaks on the order the client listed",
);
assert.equal(preferredType("text/html, text/markdown"), HTML_TYPE);
assert.equal(
	preferredType("text/markdown;q=1.0, text/html;q=1"),
	MARKDOWN_TYPE,
	"1.0 and 1 are the same q",
);
assert.equal(
	preferredType("text/markdown;q=0.001, text/html;q=0.0009"),
	MARKDOWN_TYPE,
);
assert.equal(
	preferredType("text/markdown;Q=0.9, text/html;q=0.1"),
	MARKDOWN_TYPE,
	"q is case insensitive",
);
assert.equal(
	preferredType("text/markdown;q=bogus, text/html;q=0.1"),
	MARKDOWN_TYPE,
	"an unparseable q falls back to 1",
);

// --- q=0 is an explicit rejection, and specificity beats q (RFC 9110 12.5.1) ---
assert.equal(
	preferredType("text/markdown;q=0"),
	null,
	"markdown at q=0 with no other range listed means the client accepts nothing",
);
assert.equal(
	preferredType("text/markdown;q=0, text/html"),
	HTML_TYPE,
	"rejecting markdown leaves HTML when HTML is also offered",
);
assert.equal(
	preferredType("text/html;q=0, */*"),
	MARKDOWN_TYPE,
	"a specific q=0 is not overridden by a wildcard",
);
assert.equal(
	preferredType("text/*;q=0, text/markdown"),
	MARKDOWN_TYPE,
	"the more specific range wins over the rejected wildcard",
);
assert.equal(
	preferredType("text/html;q=0, text/markdown;q=0"),
	null,
	"both rejected means 406",
);
assert.equal(preferredType("*/*;q=0"), null, "rejecting everything means 406");

// --- nothing we can produce means 406 ---
assert.equal(preferredType("application/json"), null);
assert.equal(preferredType("image/png, image/webp"), null);
assert.equal(preferredType("application/json, application/xml"), null);

// --- subtype wildcards ---
assert.equal(
	preferredType("text/*"),
	HTML_TYPE,
	"text/* resolves to the server default",
);
assert.equal(
	preferredType("application/*"),
	null,
	"application/* matches nothing we produce",
);

// --- parseAccept records q and specificity ---
const parsed = parseAccept("text/markdown;q=0.9, text/*;q=0.5, */*;q=0.1");
assert.deepEqual(
	parsed,
	[
		{ type: "text/markdown", q: 0.9, specificity: 2 },
		{ type: "text/*", q: 0.5, specificity: 1 },
		{ type: "*/*", q: 0.1, specificity: 0 },
	],
	"specificity is 2 for exact, 1 for subtype wildcard, 0 for */*",
);
assert.deepEqual(parseAccept(""), [], "an empty header parses to no entries");
assert.deepEqual(
	parseAccept("text/markdown;q=5"),
	[{ type: "text/markdown", q: 1, specificity: 2 }],
	"q is clamped to at most 1",
);
assert.deepEqual(
	parseAccept("text/markdown;q=-1"),
	[{ type: "text/markdown", q: 0, specificity: 2 }],
	"q is clamped to at least 0",
);

// --- Vary ---
assert.equal(VARY_VALUE, "Accept, Accept-Encoding");
assert.ok(
	VARY_VALUE.split(",").some(
		(token) => token.trim().toLowerCase() === "accept",
	),
	"Vary must list Accept or a CDN can cross-serve the two variants",
);

// --- route keys ---
assert.equal(routeKey("/"), "/");
assert.equal(routeKey(""), "/");
assert.equal(routeKey("///"), "/");
assert.equal(routeKey("/about"), "/about");
assert.equal(routeKey("/about/"), "/about");
assert.equal(routeKey("/blog/some-post/"), "/blog/some-post");
assert.equal(routeKey("/topics/ai//"), "/topics/ai");

// --- file detection ---
assert.equal(looksLikeFile("/llms.txt"), true);
assert.equal(looksLikeFile("/about.md"), true);
assert.equal(looksLikeFile("/favicon.svg"), true);
assert.equal(looksLikeFile("/.well-known/ai-profile"), false);
assert.equal(looksLikeFile("/about"), false);
assert.equal(looksLikeFile("/about/"), false);
assert.equal(looksLikeFile("/"), false);

console.log("accept negotiation tests passed.");
