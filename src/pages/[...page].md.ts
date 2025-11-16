import { createHash } from 'node:crypto';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { buildBlogMarkdown } from '../utils/markdownExport';
import { buildStaticMarkdown } from '../utils/staticMarkdown';

const basePages = ['index', 'about', 'projects', 'now', 'archive', 'blog', 'topics', 'type', 'search'];

const normalizeSlug = (param?: string | string[]) => {
	if (!param) return 'index';
	let slug = Array.isArray(param) ? param.join('/') : param;
	slug = slug.replace(/\.md$/i, '');
	slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
	slug = slug.replace(/\/index$/i, '') || slug;
	return slug || 'index';
};

const canonicalForSlug = (origin: string, slug: string) => {
	if (slug === 'index') return new URL('/', origin).toString();
	return new URL(`/${slug.replace(/\/+$/, '')}/`, origin).toString();
};

const relatedPostsFor = (posts: CollectionEntry<'blog'>[], target: CollectionEntry<'blog'>) => {
	const now = Date.now();
	const yearMs = 365 * 24 * 60 * 60 * 1000;
	return posts
		.filter((post) => post.id !== target.id && post.data.topics.some((topic) => target.data.topics.includes(topic)))
		.map((post) => {
			const sharedTopics = post.data.topics.filter((topic) => target.data.topics.includes(topic)).length;
			const recency = Math.max(0.25, 1 - (now - post.data.pubDate.valueOf()) / (2 * yearMs));
			return { post, score: sharedTopics * recency };
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, 5)
		.map((entry) => entry.post);
};

const respondWithMarkdown = (markdown: string) => {
	const etag = createHash('sha1').update(markdown).digest('hex');
	const headers = {
		'Content-Type': 'text/markdown; charset=utf-8',
		'Cache-Control': 'public, max-age=86400, immutable',
		ETag: etag,
	};
	return new Response(markdown, { headers });
};

export async function getStaticPaths() {
	const posts = await getCollection('blog');
	const topics = new Set<string>();
	const types = new Set<string>();
	posts.forEach((post) => {
		post.data.topics.forEach((topic) => topics.add(topic));
		types.add(post.data.type);
	});

	const slugs = new Set<string>();
	basePages.forEach((slug) => slugs.add(slug));
	topics.forEach((topic) => slugs.add(`topics/${topic}`));
	types.forEach((type) => slugs.add(`type/${type}`));
	posts.forEach((post) => slugs.add(`blog/${post.id}`));

	return Array.from(slugs).map((slug) => ({
		params: { page: slug },
	}));
}

export const GET: APIRoute = async ({ params, site, url }) => {
	const slug = normalizeSlug(params.page);
	const posts = await getCollection('blog');
	const origin = site?.origin ?? url.origin;

	if (slug.startsWith('blog/')) {
		const postId = slug.replace(/^blog\//, '');
		const post = posts.find((entry) => entry.id === postId);
		if (!post) {
			return new Response('Not found', { status: 404 });
		}
		const canonicalUrl = new URL(`/blog/${post.id}/`, origin).toString();
		const markdown = buildBlogMarkdown({
			post,
			canonicalUrl,
			origin,
			relatedPosts: relatedPostsFor(posts, post),
		});
		return respondWithMarkdown(markdown);
	}

	const canonicalUrl = canonicalForSlug(origin, slug);
	const markdown = buildStaticMarkdown({ slug, canonicalUrl, origin, posts });
	if (!markdown) {
		return new Response('Not found', { status: 404 });
	}
	return respondWithMarkdown(markdown);
};
