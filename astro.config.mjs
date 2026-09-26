// @ts-check

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { SITE_ORIGIN } from "./src/data/identity";
import knowledgeGraph from "./src/integrations/knowledge-graph";
import routeManifest from "./src/integrations/route-manifest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, "src");

// https://astro.build/config
export default defineConfig({
	site: SITE_ORIGIN,
	output: "static",
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
		imageService: true,
	}),
	integrations: [mdx(), sitemap(), knowledgeGraph(), routeManifest()],
	vite: {
		resolve: {
			alias: {
				"~/": `${srcPath}/`,
			},
		},
	},
});
