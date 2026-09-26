/**
 * RFC 9110 Accept negotiation between the HTML and markdown variants of a page.
 *
 * Implements the algorithm from the acceptmarkdown.com Astro recipe:
 *   - q-values are honoured, and `q=0` is an explicit rejection
 *   - a more specific range beats a less specific one regardless of q
 *     (RFC 9110 section 12.5.1), so `text/html;q=0, *\/*` rejects HTML
 *   - ties break on the order the client listed the ranges
 *
 * Runs in the Vercel edge runtime via middleware.ts, and is unit tested by
 * src/lib/__tests__/accept-negotiation.test.ts. Keep it dependency free.
 */

export const HTML_TYPE = "text/html";
export const MARKDOWN_TYPE = "text/markdown";

/** Variants this site can produce, in server preference order. */
export const PRODUCES = [HTML_TYPE, MARKDOWN_TYPE] as const;

export type Produced = (typeof PRODUCES)[number];

type AcceptEntry = {
	type: string;
	q: number;
	/** 2 for `type/subtype`, 1 for `type/*`, 0 for `*\/*`. */
	specificity: number;
};

export const parseAccept = (header: string): AcceptEntry[] =>
	header
		.split(",")
		.map((raw) => raw.trim())
		.filter((raw) => raw.length > 0)
		.map((raw) => {
			const parts = raw.split(";").map((part) => part.trim());
			const type = parts[0].toLowerCase();
			let q = 1;
			for (const param of parts.slice(1)) {
				const [name, value] = param.split("=").map((piece) => piece.trim());
				if (name?.toLowerCase() === "q") {
					const parsed = Number(value);
					if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
				}
			}
			const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
			return { type, q, specificity };
		});

const matches = (entry: AcceptEntry, candidate: string): boolean => {
	if (entry.type === "*/*") return true;
	if (entry.type.endsWith("/*"))
		return candidate.startsWith(entry.type.slice(0, -1));
	return entry.type === candidate;
};

/**
 * The variant to serve, or `null` when the client accepts nothing this site
 * produces (the caller should answer 406).
 *
 * A missing or empty Accept header means "anything", which resolves to HTML so
 * browsers and bare curl calls are unaffected.
 */
export const preferredType = (
	header: string | null | undefined,
): Produced | null => {
	if (!header || header.trim() === "") return PRODUCES[0];

	const entries = parseAccept(header);
	if (entries.length === 0) return PRODUCES[0];

	let best: Produced | null = null;
	let bestQ = -1;
	let bestPosition = Number.POSITIVE_INFINITY;

	for (const candidate of PRODUCES) {
		// Pick the most specific range that matches this candidate. Specificity
		// wins over q so an explicit `type;q=0` is not overridden by a wildcard.
		let matched: AcceptEntry | null = null;
		let matchedPosition = Number.POSITIVE_INFINITY;
		for (let index = 0; index < entries.length; index += 1) {
			const entry = entries[index];
			if (!matches(entry, candidate)) continue;
			if (
				matched === null ||
				entry.specificity > matched.specificity ||
				(entry.specificity === matched.specificity && index < matchedPosition)
			) {
				matched = entry;
				matchedPosition = index;
			}
		}

		if (matched === null) continue;
		if (matched.q <= 0) continue; // explicit rejection

		if (
			matched.q > bestQ ||
			(matched.q === bestQ && matchedPosition < bestPosition)
		) {
			bestQ = matched.q;
			bestPosition = matchedPosition;
			best = candidate;
		}
	}

	return best;
};

/**
 * The Vary value every negotiated response carries. `Accept` is what makes the
 * markdown variant cacheable without poisoning the HTML variant;
 * `Accept-Encoding` reflects the compression the CDN already negotiates.
 * Kept identical to the value in vercel.json so the two cannot disagree.
 */
export const VARY_VALUE = "Accept, Accept-Encoding";

/**
 * Normalised lookup key for a request path: no trailing slash, no query.
 * `/` and `/about/` become `/` and `/about`.
 */
export const routeKey = (pathname: string): string => {
	const trimmed = pathname.replace(/\/+$/, "");
	return trimmed === "" ? "/" : trimmed;
};

/** True when the last path segment looks like a file rather than a page route. */
export const looksLikeFile = (pathname: string): boolean => {
	const lastSegment = pathname.split("/").pop() ?? "";
	return lastSegment.includes(".");
};
