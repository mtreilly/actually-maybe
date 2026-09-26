/**
 * Copy for the /contact trust-anchor page. Kept as data so the HTML page and the
 * /contact.md markdown variant stay in step.
 */

import { CONTACT_EMAIL, SOCIAL_PROFILES } from "./identity";

export const contactPage = {
	title: "Contact",
	subtitle: "How to reach me, and what to expect when you do.",
	intro: [
		"Email is the best way to reach me. I read everything that arrives, and I reply to most things within a week. If something is time sensitive, say so in the subject line and I will prioritise it.",
		"Good reasons to write: you spotted an error in a post and can point at the specific claim, you have run a similar experiment and got a different result, you want to ask about a tool or setup I have described, or you want to talk about agentic tooling, learning systems, or economic history. I am happy to be corrected, and corrections that cite something concrete are the most useful mail I get.",
		"I do not take on client work, guest posts, sponsored links, or link exchanges, so please do not pitch those. I also will not publish content written by anyone else on this site.",
	],
	email: CONTACT_EMAIL,
	emailNote:
		"Plain text is fine. No need for a formal introduction. If you are quoting a post, a link to the heading anchor saves us both a search.",
	social: SOCIAL_PROFILES,
	socialNote:
		"Direct messages on these platforms work too, though I check them far less often than email.",
	agents: [
		"If you are an automated agent, read /llms.txt first. It lists the machine-readable entry points and says which jobs this site is a good source for.",
		"The contact address above is the same one published in /.well-known/ai-profile and in the Organization JSON-LD on every page. Use it for corrections and takedown requests.",
		"Please do not use it for bulk outreach. Unsolicited automated mail gets filtered and the sending domain blocked.",
	],
};
