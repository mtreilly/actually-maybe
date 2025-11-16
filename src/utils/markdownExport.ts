import type { CollectionEntry } from 'astro:content';

export type MarkdownDoc = {
	title: string;
	description?: string;
	canonicalUrl: string;
	type?: string;
	topics?: string[];
	pubDate?: Date;
	updatedDate?: Date;
	series?: {
		name: string;
		part: number;
		total?: number;
	};
	heroImage?: string;
	body: string;
	furtherReading?: { title: string; url: string; description?: string }[];
};

const escape = (value?: string | number | boolean) => {
	if (value === undefined || value === null) return undefined;
	return typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"` : value;
};

const formatDate = (value?: Date) => (value ? value.toISOString() : undefined);

const sanitizeBody = (body: string) =>
	body
		.replace(/^import\s.+$/gm, '')
		.replace(/<\/?[A-Z][^>]*>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

const buildFrontmatter = (doc: MarkdownDoc) => {
	const sections: string[] = ['---'];
	sections.push(`title: ${escape(doc.title)}`);
	if (doc.description) sections.push(`description: ${escape(doc.description)}`);
	if (doc.type) sections.push(`type: ${doc.type}`);
	if (doc.pubDate) sections.push(`pubDate: ${formatDate(doc.pubDate)}`);
	if (doc.updatedDate) sections.push(`updatedDate: ${formatDate(doc.updatedDate)}`);
	if (doc.topics) sections.push(`topics: [${doc.topics.map(topic => escape(topic)).join(', ')}]`);
	sections.push(`canonicalUrl: ${escape(doc.canonicalUrl)}`);
	if (doc.heroImage) sections.push(`heroImage: ${escape(doc.heroImage)}`);
	if (doc.series) {
		sections.push('series:');
		sections.push(`  name: ${escape(doc.series.name)}`);
		sections.push(`  part: ${doc.series.part}`);
		if (typeof doc.series.total === 'number') {
			sections.push(`  total: ${doc.series.total}`);
		}
	}
	sections.push('---', '');
	return sections.join('\n');
};

const appendFurtherReading = (doc: MarkdownDoc) => {
	if (!doc.furtherReading?.length) return '';
	const items = doc.furtherReading
		.map((item) => `- [${item.title}](${item.url})${item.description ? ` — ${item.description}` : ''}`)
		.join('\n');
	return `\n## Further reading\n${items}\n`;
};

export const serializeMarkdownDoc = (doc: MarkdownDoc) => {
	const frontmatter = buildFrontmatter(doc);
	const body = sanitizeBody(doc.body ?? '');
	return `${frontmatter}${body}\n${appendFurtherReading(doc)}`.trim() + '\n';
};

export const buildBlogMarkdown = ({
	post,
	canonicalUrl,
	origin,
	relatedPosts = [],
}: {
	post: CollectionEntry<'blog'>;
	canonicalUrl: string;
	origin: string;
	relatedPosts?: Array<CollectionEntry<'blog'>>;
}) => {
	const heroImage = post.data.heroImage ? post.data.heroImage.src : undefined;
	const summary = post.data.description ? `> ${post.data.description}\n\n` : '';
	return serializeMarkdownDoc({
		title: post.data.title,
		description: post.data.description,
		type: post.data.type,
		canonicalUrl,
		topics: post.data.topics,
		pubDate: post.data.pubDate,
		updatedDate: post.data.updatedDate,
		series: post.data.series,
		heroImage,
		body: `${heroImage ? `![Hero image for ${post.data.title}](${heroImage})\n\n` : ''}${summary}${post.body ?? ''}`,
		furtherReading: relatedPosts.slice(0, 5).map((related) => ({
			title: related.data.title,
			description: related.data.description,
			url: new URL(`/blog/${related.id}/`, origin).toString(),
		})),
	});
};
