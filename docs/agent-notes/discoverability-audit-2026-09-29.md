# Discoverability audit — 29 September 2026

## Live baseline

- `https://actuallymaybe.com/` serves meaningful HTML without JavaScript. The homepage explains the author and subject areas, links to the latest writing, and exposes canonical, Open Graph, Twitter, and JSON-LD metadata. Individual posts contain their full text in the initial response and have Markdown counterparts.
- HTTP and `www` redirect to the HTTPS apex. Unknown paths return 404. `robots.txt` allows crawlers and points to `/sitemap-index.xml`; the index and `/sitemap-0.xml` are valid and live. RSS, `llms.txt`, author context, and the AI profile are already present. `/sitemap.xml` is absent by design: Astro publishes an index and child sitemap.
- The live child sitemap lists 83 URLs: 18 blog URLs (index plus 17 posts), 51 topic URLs, five type URLs, and nine other pages. `/type/link/` is a zero-post collection with only 13 characters of main text, yet appears in the sitemap and has no `noindex` instruction.
- The homepage metadata description is only “Notes and stuff.” It gives search engines and link previews little context even though the visible introduction is specific.
- Google Search Console has a verified `actuallymaybe.com` Domain property. Its submitted child sitemap reports Success and 83 discovered pages. Search performance and page-indexing reports are still processing.
- Bing Webmaster Tools has the `actuallymaybe.com` property, but no sitemap is submitted yet.

## Planned corrections

1. Give the homepage and shared site metadata a concise, descriptive summary of the actual writing.
2. Generate type collection pages only when a published post uses that type, so zero-post pages and links are absent from the sitemap and navigation. They appear automatically when the first post is published.
3. Add IndexNow key verification and a production deployment command that compares live canonical HTML before and after deployment, then notifies IndexNow of added, changed, and removed URLs.
4. Build and test, deploy, verify live responses, submit the sitemap in Bing, and inspect representative URLs in both consoles.

The blog already has strong canonical, structured-data, and agent-readable infrastructure. Those parts do not need replacing.

## Outcome

- Production deploy succeeded after excluding `.beads/` from Vercel uploads. Live homepage metadata is descriptive; the sitemap now contains 81 canonical URLs, and the two empty type routes return 404. The IndexNow key is reachable. IndexNow accepted the 83-URL change/removal notification with HTTP 202.
- `pnpm build`, `pnpm test`, and Biome checks passed. Google Search Console accepted the refreshed `/sitemap-0.xml` and reports 81 discovered pages. The homepage is already indexed; its live smartphone test fetched successfully, with crawling and indexing allowed and the HTTPS apex declared canonical. A fresh indexing request was accepted. Google also detected one valid Profile page item.
- Brave Search accepted a homepage URL submission.
- Bing Webmaster Tools lists the property but says data and reports are processing and may take up to 48 hours. Its sitemap form accepted input but repeated submissions of both the index and child sitemap did not create a record; URL Inspection and IndexNow onboarding controls likewise did not advance. Recheck the Bing property after its processing period, submit `https://actuallymaybe.com/sitemap-index.xml`, and inspect the homepage. The IndexNow API acknowledgement does not establish that Bing has indexed the URLs.
