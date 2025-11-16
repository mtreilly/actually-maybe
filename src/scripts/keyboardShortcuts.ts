/**
 * Keyboard shortcuts handler
 * / = search
 * n = next post
 * p = previous post
 * h = home
 * ? = show shortcuts
 */

export interface ShortcutKey {
	key: string;
	description: string;
	action: () => void;
}

export function initKeyboardShortcuts() {
	const shortcuts: Record<string, ShortcutKey> = {
		'/': {
			key: '/',
			description: 'Search',
			action: () => navigateTo('/search'),
		},
		'n': {
			key: 'n',
			description: 'Next post',
			action: () => navigateToNextPost(),
		},
		'p': {
			key: 'p',
			description: 'Previous post',
			action: () => navigateToPreviousPost(),
		},
		'h': {
			key: 'h',
			description: 'Home',
			action: () => navigateTo('/'),
		},
		'?': {
			key: '?',
			description: 'Show shortcuts',
			action: () => showShortcutsModal(shortcuts),
		},
	};

	document.addEventListener('keydown', (e) => {
		// Don't trigger shortcuts when typing in inputs/textareas
		const target = e.target as HTMLElement;
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.contentEditable === 'true'
		) {
			return;
		}

		const key = e.key;

		// Handle special case for / (forward slash)
		if (key === '/') {
			e.preventDefault();
			shortcuts['/'].action();
			return;
		}

		// Handle other shortcuts (only lowercase letters)
		if (key.length === 1 && /^[a-z?]$/.test(key)) {
			if (shortcuts[key]) {
				e.preventDefault();
				shortcuts[key].action();
			}
		}
	});
}

function navigateTo(path: string) {
	window.location.href = path;
}

function navigateToNextPost() {
	const nextLink = document.querySelector('a[data-nav="next"]') as HTMLAnchorElement;
	if (nextLink) {
		window.location.href = nextLink.href;
	}
}

function navigateToPreviousPost() {
	const prevLink = document.querySelector('a[data-nav="prev"]') as HTMLAnchorElement;
	if (prevLink) {
		window.location.href = prevLink.href;
	}
}

function showShortcutsModal(shortcuts: Record<string, ShortcutKey>) {
	const existingModal = document.getElementById('shortcuts-modal');
	if (existingModal) {
		const isHidden = existingModal.style.display === 'none';
		existingModal.style.display = isHidden ? 'block' : 'none';
		return;
	}

	const modal = document.createElement('div');
	modal.id = 'shortcuts-modal';
	modal.className = 'shortcuts-modal';
	modal.setAttribute('role', 'dialog');
	modal.setAttribute('aria-labelledby', 'shortcuts-title');
	modal.setAttribute('aria-modal', 'true');

	const content = document.createElement('div');
	content.className = 'shortcuts-modal-content';

	const title = document.createElement('h2');
	title.id = 'shortcuts-title';
	title.textContent = 'Keyboard Shortcuts';

	const list = document.createElement('div');
	list.className = 'shortcuts-list';

	Object.values(shortcuts).forEach((shortcut) => {
		const item = document.createElement('div');
		item.className = 'shortcuts-item';

		const key = document.createElement('kbd');
		key.className = 'shortcuts-key';
		key.textContent = shortcut.key;

		const description = document.createElement('span');
		description.className = 'shortcuts-description';
		description.textContent = shortcut.description;

		item.appendChild(key);
		item.appendChild(description);
		list.appendChild(item);
	});

	const closeButton = document.createElement('button');
	closeButton.className = 'shortcuts-close';
	closeButton.setAttribute('aria-label', 'Close shortcuts');
	closeButton.innerHTML = '×';
	closeButton.addEventListener('click', () => {
		modal.remove();
	});

	content.appendChild(closeButton);
	content.appendChild(title);
	content.appendChild(list);
	modal.appendChild(content);

	document.body.appendChild(modal);

	// Close on escape
	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			modal.remove();
			document.removeEventListener('keydown', handleEscape);
		}
	};
	document.addEventListener('keydown', handleEscape);

	// Close on outside click
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.remove();
		}
	});
}

// Run when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
} else {
	initKeyboardShortcuts();
}
