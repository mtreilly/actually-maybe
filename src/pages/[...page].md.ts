import { createHash } from "node:crypto";
import type { APIRoute } from "astro";
import { VARY_VALUE } from "../lib/accept-negotiation";
import { loadKnowledgeGraph } from "../lib/knowledge-graph-loader";
import { POST_TYPES } from "../lib/post-types";
import { getPublishedPosts } from "../lib/published-posts";
import { rankRelatedReading } from "../lib/related-reading";
import { buildGraphMarkdown } from "../utils/graphMarkdown";
import { buildBlogMarkdown } from "../utils/markdownExport";
import { buildStaticMarkdown } from "../utils/staticMarkdown";

const basePages = [
	"index",
	"about",
	"contact",
	"privacy",
	"projects",
	"now",
	"archive",
	"blog",
	"topics",
	"type",
	"search",
	"graph",
];

const normalizeSlug = (param?: string | string[]) => {
	if (!param) return "index";
	let slug = Array.isArray(param) ? param.join("/") : param;
	slug = slug.replace(/\.md$/i, "");
	slug = slug.replace(/^\/+/, "").replace(/\/+$/, "");
	slug = slug.replace(/\/index$/i, "") || slug;
	return slug || "index";
};

const canonicalForSlug = (origin: string, slug: string) => {
	if (slug === "index") return new URL("/", origin).toString();
	return new URL(`/${slug.replace(/\/+$/, "")}/`, origin).toString();
};

const respondWithMarkdown = (markdown: string) => {
	const etag = createHash("sha1").update(markdown).digest("hex");
	const headers = {
		"Content-Type": "text/markdown; charset=utf-8",
		"Cache-Control": "public, max-age=86400, immutable",
		Vary: VARY_VALUE,
		ETag: etag,
	};
	return new Response(markdown, { headers });
};

export async function getStaticPaths() {
	const posts = await getPublishedPosts();
	const topics = new Set<string>();
	const types = new Set<string>(POST_TYPES);
	posts.forEach((post) => {
		post.data.topics.forEach((topic) => {
			topics.add(topic);
		});
		types.add(post.data.type);
	});

	const slugs = new Set<string>();
	basePages.forEach((slug) => {
		slugs.add(slug);
	});
	topics.forEach((topic) => {
		slugs.add(`topics/${topic}`);
	});
	types.forEach((type) => {
		slugs.add(`type/${type}`);
	});
	posts.forEach((post) => {
		slugs.add(`blog/${post.id}`);
	});

	return Array.from(slugs).map((slug) => ({
		params: { page: slug },
	}));
}

export const GET: APIRoute = async ({ params, site, url }) => {
	const slug = normalizeSlug(params.page);
	const posts = await getPublishedPosts();
	const origin = site?.origin ?? url.origin;
	if (slug === "graph") {
		return respondWithMarkdown(
			buildGraphMarkdown(await loadKnowledgeGraph(), origin),
		);
	}

	if (slug.startsWith("blog/")) {
		const postId = slug.replace(/^blog\//, "");
		const post = posts.find((entry) => entry.id === postId);
		if (!post) {
			return new Response("Not found", { status: 404 });
		}
		const canonicalUrl = new URL(`/blog/${post.id}/`, origin).toString();
		const markdown = buildBlogMarkdown({
			post,
			canonicalUrl,
			origin,
			relatedPosts: rankRelatedReading(posts, post).slice(0, 5),
		});
		return respondWithMarkdown(markdown);
	}

	const canonicalUrl = canonicalForSlug(origin, slug);
	const markdown = buildStaticMarkdown({ slug, canonicalUrl, origin, posts });
	if (!markdown) {
		return new Response("Not found", { status: 404 });
	}
	return respondWithMarkdown(markdown);
};
