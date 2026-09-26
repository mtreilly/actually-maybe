# Related reading and topic connections have different meanings

Date: 2026-09-26

Sidebar and Markdown further reading answer: what related writing should I read next?
They now use one explicit overlap/recency policy in `related-reading.ts`. Limits
belong to each presentation; the first three selections agree.

The footer answers: which posts connect to this one in the portable topic graph?
It retains graph edge weights based on proportional topic overlap and pairwise date
proximity. The graph has no authoring-time references or body-link analysis, so the
label “Also discussed in” was inaccurate. It is now “Topic connections”.

Chronological neighbours and series navigation represent different journeys and
remain separate. Do not unify these policies solely because they all link to posts.
Reconsider the graph relationship model only when actual reference/series edges
are implemented and tested, or a product requirement calls for a single list.
