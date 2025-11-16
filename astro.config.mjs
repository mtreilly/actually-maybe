// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/static';
import { defineConfig } from 'astro/config';

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
});
