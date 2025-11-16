import type { APIRoute } from 'astro';

const body = `LLM-ready documentation is enabled across actuallymaybe.com.

Usage:
1. Append .md to any route (example: /blog/first-post.md, /about.md, /topics/ai.md).
2. Use HTTP Accept: text/markdown to fetch machine-consumable output with canonical metadata.
3. Trigger the in-page "Copy Markdown" menu to copy the markdown or link.

LLM Context:
- Fetch /about.llm for detailed context about Micheál's interests, approach, and communication style
- This provides instructions for more contextually appropriate interactions

Cache policy: max-age=86400, immutable.
Contact: micheal@actuallymaybe.com`;

export const GET: APIRoute = () =>
	new Response(body + '\n', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, immutable',
		},
	});
