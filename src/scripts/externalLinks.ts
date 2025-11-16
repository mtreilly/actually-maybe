/**
 * Process external links to add target="_blank" and security attributes
 * Automatically detects links to different domains
 */
export function initExternalLinks() {
	const links = document.querySelectorAll('a');
	const currentHost = window.location.hostname;

	links.forEach(link => {
		const href = link.getAttribute('href');

		// Skip if no href, anchor links, or mailto links
		if (!href || href.startsWith('#') || href.startsWith('mailto:')) {
			return;
		}

		// Check if link is external
		try {
			const url = new URL(href, window.location.origin);
			const isExternal = url.hostname !== currentHost && !href.startsWith('/');

			if (isExternal) {
				// Add security and styling attributes if not already set
				if (!link.getAttribute('target')) {
					link.setAttribute('target', '_blank');
				}
				if (!link.getAttribute('rel')) {
					link.setAttribute('rel', 'noopener noreferrer');
				} else {
					// Ensure security attributes are present
					const rel = link.getAttribute('rel') || '';
					if (!rel.includes('noopener')) {
						link.setAttribute('rel', `${rel} noopener noreferrer`.trim());
					}
				}

				// Add external class for styling if not already present
				if (!link.classList.contains('external')) {
					link.classList.add('external');
				}
			}
		} catch {
			// If URL parsing fails, treat as relative link
		}
	});
}

// Run when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initExternalLinks);
} else {
	initExternalLinks();
}
