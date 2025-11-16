import type { CollectionEntry } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { aboutProfile } from '../data/about';
import { projects } from '../data/projects';
import { nowPage } from '../data/now';
import { serializeMarkdownDoc, type MarkdownDoc } from './markdownExport';

type BlogEntry = CollectionEntry<'blog'>;

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const renderList = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

const renderPostsList = (posts: BlogEntry[], origin: string) =>
	posts
		.map((post) => {
			const summary = post.data.description ?? `${formatDate(post.data.pubDate)} • ${post.data.type}`;
			return `- [${post.data.title}](${new URL(`/blog/${post.id}/`, origin).toString()}) — ${summary}`;
		})
		.join('\n');

const buildHomeDoc = (origin: string, posts: BlogEntry[]): MarkdownDoc => ({
	title: SITE_TITLE,
	description: SITE_DESCRIPTION,
	canonicalUrl: new URL('/', origin).toString(),
	body: `# ${SITE_TITLE}\n${SITE_DESCRIPTION}\n\n## Latest writing\n${renderPostsList(posts.slice(0, 8), origin)}`,
});

const buildAboutDoc = (origin: string): MarkdownDoc => ({
	title: `About | ${SITE_TITLE}`,
	description: 'About Micheál Reilly',
	canonicalUrl: new URL('/about/', origin).toString(),
	body: `# ${aboutProfile.name}\n${aboutProfile.subtitle}\n\n${aboutProfile.intro.paragraphs.map((p) => p.text).join('\n\n')}\n\n## ${aboutProfile.currently.title}\n${renderList(
		aboutProfile.currently.items.map((item) => `**${item.category}:** ${item.text}`),
	)}\n\n## ${aboutProfile.elsewhere.title}\n${renderList(
		aboutProfile.elsewhere.links.map((link) => `${link.platform}: ${link.url}`),
	)}\n\n## ${aboutProfile.writing.title}\n- ${aboutProfile.writing.label} ${new URL(aboutProfile.writing.url, origin).toString()}`,
});

const buildProjectsDoc = (origin: string): MarkdownDoc => ({
	title: `Projects | ${SITE_TITLE}`,
	description: 'Selected projects and work',
	canonicalUrl: new URL('/projects/', origin).toString(),
	body: `# Projects\nSelected work and ongoing explorations.\n\n${projects
		.map(
			(project) =>
				`## ${project.name}\nStatus: ${project.status}\n\n${project.description}${project.url !== '#' ? `\nLink: ${project.url}` : ''}`,
		)
		.join('\n\n')}`,
});

const buildNowDoc = (origin: string): MarkdownDoc => ({
	title: `Now | ${SITE_TITLE}`,
	description: 'What I\'m doing now',
	canonicalUrl: new URL('/now/', origin).toString(),
	body: `# Now\n${nowPage.subtitle}\n\n${nowPage.sections
		.map((section) => `## ${section.title}\n${renderList(section.items)}`)
		.join('\n\n')}\n\n_Last updated: ${nowPage.lastUpdated}_`,
});

const buildArchiveDoc = (origin: string, posts: BlogEntry[]): MarkdownDoc => {
	const byYear = posts.reduce<Record<string, BlogEntry[]>>((acc, post) => {
		const year = post.data.pubDate.getFullYear().toString();
		acc[year] = acc[year] || [];
		acc[year].push(post);
		return acc;
	}, {});
	const sections = Object.keys(byYear)
		.sort((a, b) => Number(b) - Number(a))
		.map((year) => `### ${year}\n${renderPostsList(byYear[year], origin)}`)
		.join('\n\n');
	return {
		title: `Archive | ${SITE_TITLE}`,
		description: 'All posts by year',
		canonicalUrl: new URL('/archive/', origin).toString(),
		body: `# Archive\n${posts.length} posts total.\n\n${sections}`,
	};
};

const buildBlogIndexDoc = (origin: string, posts: BlogEntry[]): MarkdownDoc => ({
	title: `Blog | ${SITE_TITLE}`,
	description: 'All blog posts',
	canonicalUrl: new URL('/blog/', origin).toString(),
	body: `# Blog\nBrowse all posts.\n\n${renderPostsList(posts, origin)}`,
});

const buildTopicsOverviewDoc = (origin: string, posts: BlogEntry[]): MarkdownDoc => {
	const topicCounts = new Map<string, number>();
	posts.forEach((post) => {
		post.data.topics.forEach((topic) => {
			topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
		});
	});
	const list = Array.from(topicCounts.entries())
		.sort((a, b) => (b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]))
		.map(([topic, count]) => `- [${topic}](${new URL(`/topics/${topic}/`, origin).toString()}) — ${count} posts`)
		.join('\n');
	return {
		title: `Topics | ${SITE_TITLE}`,
		description: 'Browse all topics',
		canonicalUrl: new URL('/topics/', origin).toString(),
		body: `# Topics\n${topicCounts.size} topics\n\n${list}`,
	};
};

const buildTopicDoc = (origin: string, posts: BlogEntry[], topic: string): MarkdownDoc | null => {
	const topicPosts = posts.filter((post) => post.data.topics.includes(topic));
	if (!topicPosts.length) return null;
	return {
		title: `${topic} | ${SITE_TITLE}`,
		description: `Posts about ${topic}`,
		canonicalUrl: new URL(`/topics/${topic}/`, origin).toString(),
		body: `# Topic: ${topic}\n${topicPosts.length} posts\n\n${renderPostsList(topicPosts, origin)}`,
	};
};

const buildTypeOverviewDoc = (origin: string, posts: BlogEntry[]): MarkdownDoc => {
	const counts = new Map<string, number>();
	posts.forEach((post) => {
		counts.set(post.data.type, (counts.get(post.data.type) || 0) + 1);
	});
	const list = Array.from(counts.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([type, count]) => `- [${type}](${new URL(`/type/${type}/`, origin).toString()}) — ${count} posts`)
		.join('\n');
	return {
		title: `Types | ${SITE_TITLE}`,
		description: 'Browse by content type',
		canonicalUrl: new URL('/type/', origin).toString(),
		body: `# Types\n${list}`,
	};
};

const buildTypeDoc = (origin: string, posts: BlogEntry[], type: string): MarkdownDoc | null => {
	const typePosts = posts.filter((post) => post.data.type === type);
	if (!typePosts.length) return null;
	return {
		title: `${type} posts | ${SITE_TITLE}`,
		description: `Posts of type ${type}`,
		canonicalUrl: new URL(`/type/${type}/`, origin).toString(),
		body: `# ${type} posts\n${renderPostsList(typePosts, origin)}`,
	};
};

const buildSearchDoc = (origin: string): MarkdownDoc => ({
	title: `Search | ${SITE_TITLE}`,
	description: 'Search the blog',
	canonicalUrl: new URL('/search/', origin).toString(),
	body: `# Search\nThe on-site search experience is interactive. Use the command palette (⌘K / Ctrl+K) or visit ${new URL('/search/', origin).toString()} for the full UI.`,
});

const builders = new Map<string, (origin: string, posts: BlogEntry[], slug: string) => MarkdownDoc | null>([
	['index', (origin, posts) => buildHomeDoc(origin, posts)],
	['about', (origin) => buildAboutDoc(origin)],
	['projects', (origin) => buildProjectsDoc(origin)],
	['now', (origin) => buildNowDoc(origin)],
	['archive', (origin, posts) => buildArchiveDoc(origin, posts)],
	['blog', (origin, posts) => buildBlogIndexDoc(origin, posts)],
	['topics', (origin, posts, slug) => {
		const [, topic] = slug.split('/', 2);
		return topic ? buildTopicDoc(origin, posts, topic) : buildTopicsOverviewDoc(origin, posts);
	}],
	['type', (origin, posts, slug) => {
		const [, type] = slug.split('/', 2);
		return type ? buildTypeDoc(origin, posts, type) : buildTypeOverviewDoc(origin, posts);
	}],
	['search', (origin) => buildSearchDoc(origin)],
]);

export const buildStaticMarkdown = ({
	slug,
	canonicalUrl,
	origin,
	posts,
}: {
	slug: string;
	canonicalUrl: string;
	origin: string;
	posts: BlogEntry[];
}) => {
	const normalized = slug.replace(/\/index$/, '') || 'index';
	if (normalized.startsWith('blog/')) return null;
	const root = normalized.split('/')[0];
	const builder = builders.get(root);
	if (!builder) return null;
	const doc = builder(origin, posts, normalized);
	if (!doc) return null;
	return serializeMarkdownDoc(doc);
};
