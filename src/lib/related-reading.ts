import type { CollectionEntry } from "astro:content";
import { isPublishedPost } from "./published-posts";

type Post = CollectionEntry<"blog">;
export type RelatedReadingPost = Post & {
	sharedTopics: number;
	relevanceScore: number;
};
const RECENT_POST_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const OLDER_POST_WEIGHT = 0.5;

/** Related reading favours topic overlap, then recent publication. Graph edges
 * instead measure proportional overlap and proximity between two posts' dates. */
export function rankRelatedReading(
	posts: Post[],
	target: Post,
	now: number = Date.now(),
): RelatedReadingPost[] {
	return posts
		.filter((post) => post.id !== target.id && isPublishedPost(post))
		.map((post) => {
			const sharedTopics = post.data.topics.filter((topic) =>
				target.data.topics.includes(topic),
			).length;
			const age = now - post.data.pubDate.valueOf();
			const recencyWeight = age < RECENT_POST_AGE_MS ? 1 : OLDER_POST_WEIGHT;
			return {
				...post,
				sharedTopics,
				relevanceScore: sharedTopics * recencyWeight,
			};
		})
		.filter((post) => post.sharedTopics > 0)
		.sort(
			(left, right) =>
				right.relevanceScore - left.relevanceScore ||
				right.data.pubDate.valueOf() - left.data.pubDate.valueOf() ||
				left.id.localeCompare(right.id),
		);
}
