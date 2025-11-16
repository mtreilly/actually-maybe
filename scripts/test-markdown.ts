import assert from 'node:assert/strict';
import { buildBlogMarkdown } from '../src/utils/markdownExport';
import { buildStaticMarkdown } from '../src/utils/staticMarkdown';

const origin = 'https://example.com';

const samplePost = {
	id: 'sample-post',
	body: '# Sample Body\n\nContent paragraph.',
	data: {
		title: 'Sample Post',
		description: 'Quick summary for testing.',
		type: 'note',
		pubDate: new Date('2025-01-01T00:00:00.000Z'),
		updatedDate: new Date('2025-01-02T00:00:00.000Z'),
		heroImage: undefined,
		topics: ['testing', 'ai'],
		series: undefined,
	},
} as any;

const blogMarkdown = buildBlogMarkdown({
	post: samplePost,
	canonicalUrl: `${origin}/blog/sample-post/`,
	origin,
	relatedPosts: [samplePost],
});

assert(blogMarkdown.includes('canonicalUrl: "https://example.com/blog/sample-post/"'));
assert(blogMarkdown.includes('## Further reading'));

const staticMarkdown = buildStaticMarkdown({
	slug: 'blog',
	canonicalUrl: `${origin}/blog/`,
	origin,
	posts: [samplePost],
});

assert(staticMarkdown?.includes('Sample Post'));

console.log('Markdown export smoke tests passed.');
