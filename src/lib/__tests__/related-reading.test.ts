import type { CollectionEntry } from "astro:content";
import assert from "node:assert/strict";
import { rankRelatedReading } from "../related-reading";

const now = Date.parse("2026-09-26T00:00:00Z");
const year = 365 * 24 * 60 * 60 * 1000;
function post(
	id: string,
	age: number,
	topics = ["ai"],
	draft = false,
): CollectionEntry<"blog"> {
	return {
		id,
		collection: "blog",
		data: {
			title: id,
			description: id,
			pubDate: new Date(now - age),
			topics,
			type: "note",
			draft,
		},
	};
}
const target = post("target", 0, ["ai", "learning"]);
const recent = post("recent", year - 1);
const boundary = post("boundary", year, ["ai", "learning"]);
const older = post("older", year + 1, ["ai", "learning"]);
const candidates = [
	older,
	target,
	boundary,
	recent,
	post("unrelated", 0, ["robotics"]),
	post("private", 0, ["ai"], true),
];
const ranked = rankRelatedReading(candidates, target, now);
assert.deepEqual(
	ranked.map((entry) => entry.id),
	["recent", "boundary", "older"],
);
assert.equal(ranked[0].relevanceScore, 1);
assert.equal(
	ranked[1].relevanceScore,
	1,
	"Exactly one year old gets half weight for two topics",
);
assert.equal(
	rankRelatedReading([post("one-old-topic", year)], target, now)[0]
		.relevanceScore,
	0.5,
);
assert.deepEqual(
	rankRelatedReading([...candidates].reverse(), target, now),
	ranked,
);
assert.equal(
	candidates[0],
	older,
	"Ranking must not reorder the caller's posts",
);
assert.deepEqual(
	rankRelatedReading([post("z", 0), post("a", 0)], target, now).map(
		(entry) => entry.id,
	),
	["a", "z"],
);
console.log(
	"Related-reading age boundary, overlap, tie order, and exclusions passed.",
);
