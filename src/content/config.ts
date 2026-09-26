import { defineCollection, z } from "astro:content";

import { normaliseCalendarDate } from "../lib/calendar-date";

const blog = defineCollection({
	type: "content",
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
			topics: z.array(z.string()).default([]),
			series: z.string().optional(),
			type: z.enum(["note", "essay", "guide", "link"]).default("note"),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
