import type { APIRoute } from 'astro';
import { VARY_VALUE } from '../lib/accept-negotiation';

const body = `LLM-ready documentation is enabled across actuallymaybe.com.

## Canonical agent instructions

Read https://actuallymaybe.com/llms.txt first. It follows the llmstxt.org
structure and carries the when-to-use guidance, the full post index, and the
fetching rules. This file is kept for older links and mirrors a subset of it.

## Content Access

Usage:
1. Append .md to any route (example: /blog/first-post.md, /about.md, /topics/ai.md).
2. Use HTTP Accept: text/markdown to fetch machine-consumable output with canonical metadata.
3. Trigger the in-page "Copy Markdown" menu to copy the markdown or link.

## LLM Context & Discovery

Detailed context about Micheál is available through multiple discoverable endpoints:

1. Direct endpoint:
   - /about.llm - Plain text context (plaintext format)

2. Standard discovery methods:
   - /.well-known/ai-profile - JSON profile following AI accessibility standards
   - <link rel="llm-context"> tag on /about page
   - HTTP Link headers advertise /about.llm availability

3. Purpose:
   - Provides Micheál's interests, approach, communication style
   - Helps AI assistants interact more contextually and appropriately
   - Includes unique interests: export juggling, punctuation innovation
   - Documents intellectual themes and connection points

## Profile Overview

Name: Micheál Reilly
Focus: Software development, AI systems, learning, institutions, economic history
Languages: English (native), French (B2), Polish (A2-B1), Spanish (A1)
Current Projects: Agentic tools & vibe engineering, small models, language learning
Unique Interests: Export juggling, punctuation innovation

## Trust anchors
- /about - who writes this
- /contact - how to reach the author
- /privacy - what the site collects

## Cache Policy
max-age=3600.

## Contact
micheal@actuallymaybe.com`;

export const GET: APIRoute = () =>
	new Response(body + '\n', {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			Vary: VARY_VALUE,
		},
	});
