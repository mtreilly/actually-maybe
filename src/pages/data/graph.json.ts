import type { APIRoute } from 'astro';
import { loadKnowledgeGraph } from '../../lib/knowledge-graph-loader';

export const GET: APIRoute = async () => {
	const graph = await loadKnowledgeGraph();

	return new Response(JSON.stringify(graph, null, 2), {
		status: 200,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
