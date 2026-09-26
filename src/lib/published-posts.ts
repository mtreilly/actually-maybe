import type { CollectionEntry } from "astro:content";

/** Authored drafts are private to the content collection, never public outputs. */
export function isPublishedPost(post: { data: { draft?: boolean } }): boolean {
	return post.data.draft !== true;
}

export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
	const { getCollection } = await import("astro:content");
	return getCollection("blog", isPublishedPost);
}
