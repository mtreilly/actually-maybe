/**
 * Copy for the /privacy trust-anchor page. Kept as data so the HTML page and the
 * /privacy.md markdown variant stay in step.
 *
 * Keep this factual. It has to describe what the deployed site actually does:
 * a static Astro build on Vercel with Vercel Web Analytics enabled
 * (see astro.config.mjs) and no other third-party scripts.
 */

import { CONTACT_EMAIL } from './identity';

export const privacyPage = {
	title: 'Privacy',
	subtitle: 'What this site collects, what it does not, and who else is involved.',
	lastUpdated: '2026-09-09',
	sections: [
		{
			id: 'summary',
			title: 'The short version',
			paragraphs: [
				'This is a personal blog. It has no accounts, no logins, no comments, no adverts, and no advertising or cross-site tracking scripts. There is nothing to sign up for, so there is no mailing list holding your address. I do not sell, rent, or share data about readers, because I do not hold any data about readers that could be sold.',
			],
		},
		{
			id: 'what-is-collected',
			title: 'What is collected',
			paragraphs: [
				'Two things. First, standard server request logs, which the host keeps for a short period so it can serve the site and defend it against abuse. These include your IP address, the URL you asked for, your user agent, and a timestamp. I do not read them routinely and I do not link them to anything else.',
				'Second, aggregate page-view counts through Vercel Web Analytics. This is cookieless. It records the path you visited, a coarse referrer, and coarse device and country information, and it does not build a profile of you or follow you to other sites. I use it to see which posts get read. Nothing in it identifies an individual reader to me.',
			],
		},
		{
			id: 'local-storage',
			title: 'Data stored in your browser',
			paragraphs: [
				'The light and dark theme toggle saves your choice in your browser under the key "theme" in local storage. That value never leaves your device and is never sent to the server. Clearing site data removes it, and the site falls back to your operating system preference.',
			],
		},
		{
			id: 'processors',
			title: 'Who else is involved',
			paragraphs: [
				'The site is a set of static files built with Astro and hosted on Vercel, which acts as the hosting provider and content delivery network, and which operates the request logging and analytics described above. Fonts are self-hosted from this domain, so no font provider sees your requests. There are no other embedded third parties: no social widgets, no comment platform, no tag manager, and no video or map embeds.',
				'If you follow an outbound link, that destination has its own policy and I have no visibility of what happens there.',
			],
		},
		{
			id: 'agents',
			title: 'Automated agents and crawlers',
			paragraphs: [
				'Crawling and fetching this site is welcome, including by AI agents. Content is offered as clean markdown so agents do not need to parse layout markup. Requests from agents are logged the same way as any other request and receive no special treatment.',
				'Please keep to a reasonable request rate and identify yourself in the user agent string. If you reuse content, cite the canonical URL.',
			],
		},
		{
			id: 'rights',
			title: 'Your rights, and how to ask',
			paragraphs: [
				'Because no personal data is collected under an account, there is usually nothing for me to look up, export, or delete on request. If you believe I hold something about you, or you want a page corrected or removed, write to the address below and say what you are asking for. I will respond within thirty days.',
			],
		},
		{
			id: 'changes',
			title: 'Changes to this page',
			paragraphs: [
				'If what the site collects changes, this page changes with it, and the date below changes too. There is no version history beyond the public git history of the site.',
			],
		},
	],
	contactEmail: CONTACT_EMAIL,
};
