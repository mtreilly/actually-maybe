import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET() {
	const posts = await getCollection('blog');

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: import.meta.env.SITE,
		items: posts
			.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
			.map(post => ({
				title: post.data.title,
				pubDate: post.data.pubDate,
				description: post.data.description,
				link: `/blog/${post.id}/`,
			})),
	});
}
