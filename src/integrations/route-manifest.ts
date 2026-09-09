import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import type { AstroIntegration } from 'astro';

/**
 * Generates src/generated/route-manifest.json from the real build output.
 *
 * middleware.ts needs to answer two questions per request without touching the
 * filesystem: does this path have a markdown sibling, and does this path exist
 * at all. Deriving both from `dist/` after the build keeps the answers honest,
 * so a new page or a renamed one cannot silently fall out of negotiation.
 *
 * The manifest is committed. Vercel bundles the root middleware from the repo,
 * and the bundling order relative to the build command is not something we
 * control, so the committed copy is the one that ships. `pnpm test` fails when
 * the committed copy drifts from a fresh build (see
 * scripts/test-route-manifest.ts).
 */

export const MANIFEST_PATH = 'src/generated/route-manifest.json';

export type RouteManifest = {
	/** Normalised page path (no trailing slash) -> markdown file path. */
	markdownRoutes: Record<string, string>;
	/** Every normalised page path that resolves to an index.html. */
	htmlRoutes: string[];
	/** Non-HTML files served straight from the build output. */
	files: string[];
};

const walk = (dir: string, root: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			walk(full, root, out);
		} else {
			out.push(`/${relative(root, full).split(sep).join('/')}`);
		}
	}
	return out;
};

const normalise = (pathname: string) => {
	const trimmed = pathname.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
};

export const buildRouteManifest = (distDir: string): RouteManifest => {
	const all = walk(distDir, distDir).sort();

	const htmlRoutes: string[] = [];
	const markdownRoutes: Record<string, string> = {};
	const files: string[] = [];

	for (const file of all) {
		if (file === '/index.html') {
			htmlRoutes.push('/');
		} else if (file.endsWith('/index.html')) {
			htmlRoutes.push(normalise(file.slice(0, -'/index.html'.length)));
		} else if (file.endsWith('.md')) {
			// /about.md serves the /about page; /blog/foo.md serves /blog/foo.
			markdownRoutes[normalise(file.slice(0, -'.md'.length)) || '/'] = file;
			files.push(file);
		} else {
			files.push(file);
		}
	}

	// /index.md is the markdown variant of the site root, not of a page named "index".
	if (markdownRoutes['/index']) {
		markdownRoutes['/'] = markdownRoutes['/index'];
		delete markdownRoutes['/index'];
	}

	// A markdown route is only useful if the HTML page it mirrors exists.
	for (const key of Object.keys(markdownRoutes)) {
		if (!htmlRoutes.includes(key)) delete markdownRoutes[key];
	}

	return {
		markdownRoutes: Object.fromEntries(Object.entries(markdownRoutes).sort()),
		htmlRoutes: htmlRoutes.sort(),
		files: files.sort(),
	};
};

export const serialiseRouteManifest = (manifest: RouteManifest) =>
	`${JSON.stringify(manifest, null, '\t')}\n`;

export default function routeManifestIntegration(): AstroIntegration {
	return {
		name: 'route-manifest',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const distDir = dir.pathname.endsWith('/') ? dir.pathname.slice(0, -1) : dir.pathname;
				const manifest = buildRouteManifest(decodeURIComponent(distDir));
				const target = resolve(process.cwd(), MANIFEST_PATH);
				const next = serialiseRouteManifest(manifest);

				let previous: string | null = null;
				try {
					previous = readFileSync(target, 'utf-8');
				} catch {
					// first run
				}

				if (previous !== next) {
					writeFileSync(target, next, 'utf-8');
					logger.warn(
						`${MANIFEST_PATH} was out of date and has been regenerated. Commit it so middleware negotiation ships in step with the build.`,
					);
				}

				logger.info(
					`${Object.keys(manifest.markdownRoutes).length} markdown routes, ${manifest.htmlRoutes.length} html routes`,
				);
			},
		},
	};
}
