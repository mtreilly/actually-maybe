// @ts-check

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, 'src');

// https://astro.build/config
export default defineConfig({
	site: 'https://actuallymaybe.com',
	output: 'static',
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
		imageService: true,
	}),
	integrations: [mdx(), sitemap()],
	vite: {
		resolve: {
			alias: {
				'~/': `${srcPath}/`,
			},
		},
	},
	headers: [
		{
			match: 'all',
			headers: {
				'Link': '</about.llm>; rel="llm-context"; type="text/plain", </.well-known/ai-profile>; rel="ai-profile"; type="application/json"',
			},
		},
	],
});
