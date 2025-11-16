/**
 * Calculate reading time for a given text
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(text: string): number {
	const wordCount = text.trim().split(/\s+/).length;
	const readingTimeMinutes = Math.ceil(wordCount / 200);
	return readingTimeMinutes;
}

export function formatReadingTime(minutes: number): string {
	if (minutes < 1) return '< 1 min';
	if (minutes === 1) return '1 min';
	return `${minutes} min`;
}
