import type { CollectionEntry } from "astro:content";

export const LATEST_POSTS_COUNT = 10;

export function selectLatestPosts(
	posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
	return posts
		.toSorted(
			(left, right) =>
				right.data.pubDate.valueOf() - left.data.pubDate.valueOf() ||
				left.id.localeCompare(right.id),
		)
		.slice(0, LATEST_POSTS_COUNT);
}
