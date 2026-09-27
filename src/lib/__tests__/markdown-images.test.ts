import assert from "node:assert/strict";
import { resolveRelativeImages } from "../markdown-images";

const publishedImages: Record<string, string> = {
	"src/content/blog/images/board.png":
		"https://example.com/_astro/board.abc.webp",
};
const resolveImageUrl = (sourcePath: string) => publishedImages[sourcePath];

assert.equal(
	resolveRelativeImages(
		"Intro\n\n![A board](./images/board.png)\n",
		"src/content/blog",
		resolveImageUrl,
	),
	"Intro\n\n![A board](https://example.com/_astro/board.abc.webp)\n",
	"relative paths resolve against the post's directory",
);

assert.equal(
	resolveRelativeImages(
		'![A board](../blog/images/board.png "Caption")',
		"src/content/blog",
		resolveImageUrl,
	),
	'![A board](https://example.com/_astro/board.abc.webp "Caption")',
	"parent segments normalise and titles survive",
);

const untouched = [
	"![Remote](https://cdn.example.com/a.png)",
	"![Absolute](/images/a.png)",
	"![Unknown](./images/missing.png)",
	"[A link](./images/board.png)",
].join("\n");
assert.equal(
	resolveRelativeImages(untouched, "src/content/blog", resolveImageUrl),
	untouched,
	"absolute, remote, unknown and non-image links are left alone",
);

console.log("markdown-images tests passed");
