import assert from 'node:assert/strict';
import type { CollectionEntry } from 'astro:content';
import {
  buildEdges,
  buildTopicIndex,
  calculateEdgeWeight,
  calculateStats,
  findSharedTopics,
  toPostNode,
} from '../graph-utils';
import type { KnowledgeGraph, PostNode } from '../../types/graph';

function createCollectionEntry(
  overrides: Partial<CollectionEntry<'blog'>>,
): CollectionEntry<'blog'> {
  const base = {
    id: 'sample-post',
    slug: 'sample-post',
    body: 'Sample content body for counting words.',
    collection: 'blog',
    data: {
      title: 'Sample',
      description: 'Sample description',
      pubDate: new Date('2025-01-01T00:00:00.000Z'),
      updatedDate: new Date('2025-01-02T00:00:00.000Z'),
      heroImage: undefined,
      topics: ['astro', 'ai'],
      type: 'note',
      series: undefined,
    },
  };

  return { ...base, ...overrides } as CollectionEntry<'blog'>;
}

function createPostNode(id: string, topics: string[]): PostNode {
  return {
    id,
    slug: id,
    title: id,
    date: new Date('2025-01-01T00:00:00.000Z').toISOString(),
    topics,
    type: 'note',
    wordCount: 100,
    excerpt: 'excerpt',
  };
}

const entry = createCollectionEntry({});
const node = toPostNode(entry);
assert.equal(node.slug, 'sample-post');
assert.equal(node.title, 'Sample');
assert.equal(node.type, 'note');
assert.equal(node.wordCount, 6);
assert(node.date.endsWith('Z'));

const a = createPostNode('a', ['astro', 'ai']);
const b = createPostNode('b', ['ai', 'productivity']);
const c = createPostNode('c', ['privacy']);

assert.deepEqual(findSharedTopics(a, b), ['ai']);
assert.deepEqual(findSharedTopics(a, c), []);

const weight = calculateEdgeWeight(a, b, ['ai']);
assert(weight > 0);
assert(weight <= 1);

const edges = buildEdges([a, b, c]);
assert.equal(edges.length, 1);
assert.equal(edges[0].source, 'a');
assert.equal(edges[0].target, 'b');
assert.equal(edges[0].sharedTopics?.[0], 'ai');

const topicIndex = buildTopicIndex([a, b, c]);
assert.deepEqual(topicIndex['astro'], ['a']);
assert.deepEqual(topicIndex['ai'].sort(), ['a', 'b']);
assert.deepEqual(topicIndex['privacy'], ['c']);

const graphWithoutStats: Omit<KnowledgeGraph, 'stats'> = {
  posts: [a, b, c],
  edges,
  topics: topicIndex,
  generatedAt: '2025-01-01T00:00:00.000Z',
  version: 1,
};

const stats = calculateStats(graphWithoutStats);
assert.equal(stats.totalPosts, 3);
assert.equal(stats.totalEdges, 1);
assert.equal(stats.totalTopics, 4);
assert(stats.mostConnectedPost === 'a' || stats.mostConnectedPost === 'b');

console.log('graph-utils tests passed');
