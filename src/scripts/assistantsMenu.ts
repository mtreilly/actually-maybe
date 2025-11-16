/**
 * Attach LLM-friendly copy/share interactions.
 */
let toastFn: any = null;
let activeMenu: HTMLElement | null = null;
let globalHandlersRegistered = false;

type AssistDetail = {
	markdownUrl: string;
	markdownLink: string;
	chatgptUrl?: string;
	claudeUrl?: string;
	title?: string;
	description?: string;
};

declare global {
	interface Window {
		llmAssistant?: {
			copyMarkdown: () => Promise<void>;
			copyLink: () => Promise<void>;
		};
	}
}

const ensureToast = async () => {
	if (toastFn) return toastFn;
	try {
		const sonner = await import('sonner');
		toastFn = sonner.toast;
	} catch (error) {
		console.warn('Sonner not available for toast notifications', error);
	}
	return toastFn;
};

const showToast = (type: 'success' | 'error', message: string) => {
	if (!toastFn) return;
	toastFn[type](message);
};

const copyText = async (value: string) => {
	if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
	await navigator.clipboard.writeText(value);
};

const copyMarkdown = async (markdownUrl: string) => {
	const response = await fetch(markdownUrl, { headers: { Accept: 'text/markdown' } });
	if (!response.ok) throw new Error(`Failed to load markdown (${response.status})`);
	const markdown = await response.text();
	await copyText(markdown);
};

const openLink = (href?: string) => {
	if (!href) return;
	window.open(href, '_blank', 'noopener');
};

const closeActiveMenu = () => {
	if (!activeMenu) return;
	const panel = activeMenu.querySelector<HTMLElement>('[data-assist-panel]');
	const toggle = activeMenu.querySelector<HTMLElement>('[data-assist-toggle]');
	panel?.setAttribute('hidden', 'true');
	toggle?.setAttribute('aria-expanded', 'false');
	activeMenu.removeAttribute('open');
	activeMenu = null;
};

const openMenu = (menu: HTMLElement) => {
	if (activeMenu === menu) {
		closeActiveMenu();
		return;
	}
	closeActiveMenu();
	const panel = menu.querySelector<HTMLElement>('[data-assist-panel]');
	const toggle = menu.querySelector<HTMLElement>('[data-assist-toggle]');
	if (!panel || !toggle) return;
	panel.removeAttribute('hidden');
	toggle.setAttribute('aria-expanded', 'true');
	menu.setAttribute('open', 'true');
	activeMenu = menu;
};

const registerGlobalShortcut = (detail: AssistDetail) => {
	const handler = async (event: KeyboardEvent) => {
		if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'm') {
			event.preventDefault();
			try {
				await copyMarkdown(detail.markdownUrl);
				await ensureToast();
				showToast('success', 'Markdown copied for your LLM');
			} catch (error) {
				console.error('Shortcut copy failed', error);
				await ensureToast();
				showToast('error', 'Unable to copy markdown');
			}
		}
	};
	document.addEventListener('keydown', handler);
};

const registerCommandPaletteAction = (detail: AssistDetail) => {
	window.llmAssistant = {
		copyMarkdown: async () => {
			await copyMarkdown(detail.markdownUrl);
			await ensureToast();
			showToast('success', 'Markdown copied for your LLM');
		},
		copyLink: async () => {
			await copyText(detail.markdownLink);
			await ensureToast();
			showToast('success', '.md link copied');
		},
	};
	document.dispatchEvent(new CustomEvent('llm:ready', { detail }));
};

export async function initAssistantsMenu() {
	if (typeof document === 'undefined') return;
	const menus = document.querySelectorAll<HTMLElement>('[data-assist-menu]');
	if (!menus.length) return;
	await ensureToast();

	menus.forEach((menu) => {
		if (menu.dataset.assistInitialized === 'true') return;
		menu.dataset.assistInitialized = 'true';
		const detail: AssistDetail = {
			markdownUrl: menu.dataset.markdownUrl || menu.dataset.markdownLink || '',
			markdownLink: menu.dataset.markdownLink || '',
			chatgptUrl: menu.dataset.chatgptUrl,
			claudeUrl: menu.dataset.claudeUrl,
			title: menu.dataset.title,
			description: menu.dataset.description,
		};
		const toggle = menu.querySelector<HTMLElement>('[data-assist-toggle]');
		if (toggle) {
			toggle.addEventListener('click', (event) => {
				event.preventDefault();
				openMenu(menu);
			});
			toggle.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					openMenu(menu);
				}
			});
		}

		menu.querySelectorAll<HTMLButtonElement>('[data-assist-action]').forEach((button) => {
			button.addEventListener('click', async () => {
				const action = button.dataset.assistAction;
				try {
					if (action === 'copy-markdown') {
						await copyMarkdown(detail.markdownUrl);
						showToast('success', 'Markdown copied for your LLM');
						return;
					}
					if (action === 'copy-link') {
						await copyText(detail.markdownLink);
						showToast('success', '.md link copied');
						return;
					}
					if (action === 'open-chatgpt') {
						openLink(detail.chatgptUrl || detail.markdownLink);
						return;
					}
					if (action === 'open-claude') {
						openLink(detail.claudeUrl || detail.markdownLink);
						return;
					}
				} catch (error) {
					console.error('LLM action failed', error);
					showToast('error', 'Unable to complete the action');
				}
			});
		});

		registerGlobalShortcut(detail);
		registerCommandPaletteAction(detail);
	});

	if (!globalHandlersRegistered) {
		globalHandlersRegistered = true;
		document.addEventListener('click', (event) => {
			if (!activeMenu) return;
			if (event.target instanceof Node && activeMenu.contains(event.target)) return;
			closeActiveMenu();
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeActiveMenu();
			}
		});
	}
}

if (typeof document !== 'undefined') {
	document.addEventListener('astro:page-load', initAssistantsMenu);
	document.addEventListener('DOMContentLoaded', initAssistantsMenu);
}
