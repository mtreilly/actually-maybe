import assert from "node:assert/strict";
import { buildBlogMarkdown } from "../src/utils/markdownExport";
import { buildStaticMarkdown } from "../src/utils/staticMarkdown";

const origin = "https://example.com";

const samplePost = {
	id: "sample-post",
	body: "# Sample Body\n\nContent paragraph.",
	data: {
		title: "Sample Post",
		description: "Quick summary for testing.",
		type: "note",
		pubDate: new Date("2025-01-01T00:00:00.000Z"),
		updatedDate: new Date("2025-01-02T00:00:00.000Z"),
		heroImage: undefined,
		topics: ["testing", "ai"],
		series: undefined,
	},
} as any;

const blogMarkdown = buildBlogMarkdown({
	post: samplePost,
	canonicalUrl: `${origin}/blog/sample-post/`,
	origin,
	relatedPosts: [samplePost],
});

assert(
	blogMarkdown.includes(
		'canonicalUrl: "https://example.com/blog/sample-post/"',
	),
);
assert(blogMarkdown.includes("## Further reading"));

const staticMarkdown = buildStaticMarkdown({
	slug: "blog",
	canonicalUrl: `${origin}/blog/`,
	origin,
	posts: [samplePost],
});

assert(staticMarkdown?.includes("Sample Post"));

// The trust-anchor pages need markdown variants too, or an agent asking for
// /contact with Accept: text/markdown has nothing to be rewritten to.
for (const slug of ["contact", "privacy"]) {
	const doc = buildStaticMarkdown({
		slug,
		canonicalUrl: `${origin}/${slug}/`,
		origin,
		posts: [samplePost],
	});
	assert(doc, `${slug} should build a markdown doc`);
	assert(doc.startsWith("---\n"), `${slug}.md should open with frontmatter`);
	assert(
		doc.includes(`canonicalUrl: "${origin}/${slug}/"`),
		`${slug}.md needs a canonical URL`,
	);
	assert(
		doc.includes("micheal@actuallymaybe.com"),
		`${slug}.md should publish the contact address`,
	);
	assert(
		doc.length > 500,
		`${slug}.md should carry real content, got ${doc.length} chars`,
	);
}

const contactDoc = buildStaticMarkdown({
	slug: "contact",
	canonicalUrl: `${origin}/contact/`,
	origin,
	posts: [],
});
assert(
	contactDoc?.includes("## For automated agents"),
	"contact.md should tell agents how to use the site",
);
assert(
	contactDoc?.includes(`${origin}/llms.txt`),
	"contact.md should point at llms.txt",
);

const privacyDoc = buildStaticMarkdown({
	slug: "privacy",
	canonicalUrl: `${origin}/privacy/`,
	origin,
	posts: [],
});
assert(
	privacyDoc?.includes("## Automated agents and crawlers"),
	"privacy.md should cover agent traffic",
);

// Unknown slugs must stay unmapped, otherwise middleware would rewrite a 404
// into an empty markdown page.
assert.equal(
	buildStaticMarkdown({
		slug: "no-such-page",
		canonicalUrl: `${origin}/no-such-page/`,
		origin,
		posts: [],
	}),
	null,
);

console.log("Markdown export smoke tests passed.");
