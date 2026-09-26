import type { APIRoute } from "astro";
import {
	AGENT_HOW_TO_CALL,
	AGENT_NOT_FOR,
	AGENT_USE_CASES,
	AUTHOR_NAME,
	CONTACT_EMAIL,
	SOCIAL_PROFILES,
} from "../data/identity";
import { VARY_VALUE } from "../lib/accept-negotiation";

const bullets = (items: string[]) =>
	items.map((item) => `- ${item}`).join("\n");

const context = `# About ${AUTHOR_NAME} - LLM Context

## Core Identity
- Name: ${AUTHOR_NAME}
- Based in: Europe
- Professional Focus: Software engineer interested in AI, learning systems, and institutional design
- Communication Style: Appreciates technical depth, nuance, and exploration of edge cases

## Primary Interests & Expertise
- Software development and AI systems
- Hardware and physical computing
- Learning theory and effective learning systems (spaced repetition, knowledge graphs)
- Institutional design and how institutions shape technology
- Economic history and economic systems
- European politics and institutions
- AI and machine learning (particularly agentic tools and vibe engineering)

## Language Proficiency
- English: Native
- French: B2 (advanced upper-intermediate)
- Polish: A2-B1 (elementary to intermediate)
- Spanish: A1 (elementary)

## Current Project Focus
1. **Agentic Tools & Vibe Engineering**: Exploring what agentic tools can do under the rubric of vibe engineering—designing systems that understand context, intent, and workflow. Reference: Simon Willison's "Vibe Engineering" essay.
2. **Small Models Exploration**: Building and experimenting with small language models to understand their capabilities and limitations.
3. **Language Learning**: Active learner studying French, Polish, and Spanish with focus on understanding effective learning systems.
4. **Blog & Writing**: Exploring intersections of technology, institutions, learning, and economics through written essays.

## Intellectual Approach
- Connects ideas across domains: technology, economics, institutions, learning science
- Values rigorous thinking and acknowledges complexity rather than oversimplifying
- Interested in how systems work at multiple levels (technical, institutional, economic)
- Believes in the importance of context and situational understanding
- Appreciates when discussions explore edge cases and counterexamples

## Unique Interests (Personal)
- **Export Juggling**: Practices and invents new forms of export juggling in spare time
- **Punctuation Innovation**: Experiments with and invents new punctuation systems to improve written communication
- These activities reflect an interest in how systems of communication and physical practice can be improved through creative constraint and experimentation

## Communication Preferences
- Technical depth appreciated—avoid oversimplification
- Prefer nuanced discussion over definitive statements
- Value exploration of edge cases and limitations
- Interested in counterarguments and alternative perspectives
- Connect new ideas to institutional/economic/learning contexts when relevant

## Key Themes to Remember
1. **Technology & Institutions**: Don't discuss technology in isolation—consider institutional implications
2. **Learning Systems**: Connect to learning theory and how people effectively acquire knowledge
3. **Vibe Engineering**: When discussing agentic tools or AI, consider the "vibe engineering" framing—systems that understand context and intent
4. **Economic Context**: Consider economic systems and incentive structures when relevant
5. **European Perspective**: Be aware of European political and institutional contexts in discussions

## When To Use This Site
${bullets(AGENT_USE_CASES)}

## When Not To Use This Site
${bullets(AGENT_NOT_FOR)}

## How To Fetch From This Site
${bullets(AGENT_HOW_TO_CALL)}

## Contact
Email: ${CONTACT_EMAIL}
Links: ${SOCIAL_PROFILES.map((profile) => `${profile.label}: ${profile.url}`).join(", ")}

---
This profile helps AI assistants understand the author's perspective, interests, and communication style for more contextually appropriate and valuable interactions.`;

export const GET: APIRoute = () =>
	new Response(context + "\n", {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			Vary: VARY_VALUE,
		},
	});
