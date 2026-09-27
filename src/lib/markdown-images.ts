import { posix } from "node:path";

/** Maps a repo-relative source path (e.g. `src/content/blog/images/a.png`) to a published URL. */
export type ImageUrlResolver = (sourcePath: string) => string | undefined;

const RELATIVE_IMAGE = /!\[([^\]]*)\]\((\.{1,2}\/[^)\s]+)((?:\s+"[^"]*")?)\)/g;

/**
 * Rewrites relative Markdown image paths to their published URLs, so a post's
 * Markdown representation shows the same images as its HTML page.
 * Paths the resolver does not know are left untouched.
 */
export function resolveRelativeImages(
	body: string,
	postDirectory: string,
	resolveImageUrl: ImageUrlResolver,
): string {
	return body.replace(RELATIVE_IMAGE, (match, alt, relativePath, title) => {
		const sourcePath = posix.normalize(posix.join(postDirectory, relativePath));
		const url = resolveImageUrl(sourcePath);
		return url ? `![${alt}](${url}${title})` : match;
	});
}
