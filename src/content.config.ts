import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

import { normaliseCalendarDate } from "./lib/calendar-date";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.preprocess(normaliseCalendarDate, z.coerce.date()),
			updatedDate: z.preprocess(
				normaliseCalendarDate,
				z.coerce.date().optional(),
			),
			heroImage: image().optional(),
			draft: z.boolean().default(false),
			topics: z.array(z.string()).default([]),
			type: z.enum(["note", "essay", "guide", "link"]).default("note"),
			// Series support for multi-part content
			series: z
				.object({
					name: z.string(),
					part: z.number(),
					total: z.number().optional(),
				})
				.optional(),
		}),
});

export const collections = { blog };
