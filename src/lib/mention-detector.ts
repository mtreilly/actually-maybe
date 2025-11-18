import type { PostNode, UnlinkedMention } from '../types/graph';

const MIN_TOPIC_LENGTH = 3;
const DEFAULT_THRESHOLD = 0.6;
const SNIPPET_RADIUS = 80;

export function findUnlinkedMentions(
	posts: PostNode[],
	threshold: number = DEFAULT_THRESHOLD,
): UnlinkedMention[] {
	const mentions: UnlinkedMention[] = [];
	const seen = new Set<string>();

	posts.forEach((sourcePost) => {
		const excerpt = sourcePost.excerpt?.trim();
		if (!excerpt) {
			return;
		}

		const normalizedExcerpt = excerpt.toLowerCase();

		posts.forEach((targetPost) => {
			if (targetPost.id === sourcePost.id) {
				return;
			}

			targetPost.topics.forEach((topic) => {
				if (!topic || topic.length < MIN_TOPIC_LENGTH) {
					return;
				}

				const topicLower = topic.toLowerCase();

				if (!normalizedExcerpt.includes(topicLower)) {
					return;
				}

				const occurrences = countOccurrences(normalizedExcerpt, topicLower);
				const confidence = Math.min(1, occurrences * 0.2);

				if (confidence < threshold) {
					return;
				}

				const key = `${sourcePost.id}->${targetPost.id}->${topicLower}`;
				if (seen.has(key)) {
					return;
				}

				mentions.push({
					sourcePostId: sourcePost.id,
					targetPostId: targetPost.id,
					topic,
					confidence,
					snippet: extractSnippet(excerpt, topic),
				});
				seen.add(key);
			});
		});
	});

	return mentions;
}

function countOccurrences(haystack: string, needle: string): number {
	const matches = haystack.match(new RegExp(escapeRegExp(needle), 'g'));
	return matches ? matches.length : 0;
}

function extractSnippet(text: string, topic: string): string {
	const lowerText = text.toLowerCase();
	const index = lowerText.indexOf(topic.toLowerCase());
	if (index === -1) {
		return '';
	}

	const start = Math.max(0, index - SNIPPET_RADIUS);
	const end = Math.min(text.length, index + topic.length + SNIPPET_RADIUS);
	return `…${text.slice(start, end).trim()}…`;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
