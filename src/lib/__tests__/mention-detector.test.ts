import assert from 'node:assert/strict';
import type { PostNode } from '../../types/graph';
import { findUnlinkedMentions } from '../mention-detector';

const basePost = (id: string, excerpt: string, topics: string[]): PostNode => ({
	id,
	slug: id,
	title: id,
	date: new Date('2025-01-01').toISOString(),
	topics,
	type: 'note',
	wordCount: 10,
	excerpt,
});

const posts: PostNode[] = [
	basePost('source', 'This note mentions spaced repetition multiple times. Spaced repetition matters.', ['learning']),
	basePost('target', 'Details about spaced repetition.', ['spaced repetition']),
	basePost('unrelated', 'Irrelevant', ['ai']),
];

const mentions = findUnlinkedMentions(posts, 0.2);
assert.equal(mentions.length, 1);
assert.equal(mentions[0].sourcePostId, 'source');
assert.equal(mentions[0].targetPostId, 'target');
assert.equal(mentions[0].topic, 'spaced repetition');
assert(mentions[0].snippet?.includes('Spaced repetition'));

const noMentions = findUnlinkedMentions(
	[
		basePost('a', 'no overlap', ['foo']),
		basePost('b', 'still nothing', ['bar']),
	],
	0.2,
);
assert.equal(noMentions.length, 0);

console.log('mention-detector tests passed');
