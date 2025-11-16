type AssistantParams = {
	markdownUrl: string;
	canonicalUrl: string;
	title: string;
	description?: string;
};

const basePrompt = ({ markdownUrl, canonicalUrl, title, description }: AssistantParams) =>
	`You are an AI collaborator. Load the markdown at ${markdownUrl} (canonical: ${canonicalUrl}) and help me with "${title}".${description ? ` Context: ${description}` : ''}`;

const withQuery = (url: string, param: string, value: string) => {
	const target = new URL(url);
	target.searchParams.set(param, value);
	return target.toString();
};

export const buildAssistantLinks = (params: AssistantParams) => {
	const prompt = basePrompt(params);
	return {
		chatgpt: withQuery('https://chatgpt.com/', 'q', prompt),
		claude: withQuery('https://claude.ai/new', 'prompt', prompt),
	};
};
