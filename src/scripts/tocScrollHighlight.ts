/**
 * Highlight the active heading in the table of contents as the user scrolls
 */
export function initTocScrollHighlight() {
	const tocLinks = document.querySelectorAll('.toc-link');

	if (tocLinks.length === 0) return;

	// Get all headings that are referenced in the TOC
	const headingIds = Array.from(
		new Set(
			Array.from(tocLinks)
				.map(link => {
					const href = link.getAttribute('href');
					return href?.startsWith('#') ? href.substring(1) : null;
				})
				.filter(Boolean) as string[],
		),
	) as string[];

	// Function to find the currently visible heading
	function updateActiveLink() {
		let activeHeadingId: string | null = null;
		const scrollPosition = window.scrollY + 150; // Offset for header height

		// Find the heading closest to the top of the viewport
		for (const id of headingIds) {
			const heading = document.getElementById(id);
			if (heading) {
				const position = heading.getBoundingClientRect().top + window.scrollY;
				if (position <= scrollPosition) {
					activeHeadingId = id;
				}
			}
		}

		// Update active state for all links
		tocLinks.forEach(link => {
			const href = link.getAttribute('href');
			const linkId = href?.startsWith('#') ? href.substring(1) : null;

			if (linkId === activeHeadingId) {
				link.classList.add('active');
			} else {
				link.classList.remove('active');
			}
		});
	}

	// Update on scroll
	window.addEventListener('scroll', updateActiveLink, { passive: true });

	// Initial call
	updateActiveLink();

	// Cleanup function
	return () => {
		window.removeEventListener('scroll', updateActiveLink);
	};
}

// Run when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTocScrollHighlight);
} else {
	initTocScrollHighlight();
}
