import type { APIRoute } from 'astro';
import { loadKnowledgeGraph } from '../../lib/knowledge-graph-loader';

export const GET: APIRoute = async () => {
	try {
		const graph = await loadKnowledgeGraph();

		return new Response(JSON.stringify(graph, null, 2), {
			status: 200,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
			},
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: 'Knowledge graph unavailable',
				message: 'The graph could not be loaded. This may occur if the build environment does not have access to content collections.',
			}, null, 2),
			{
				status: 503,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Cache-Control': 'no-cache',
				},
			}
		);
	}
};
