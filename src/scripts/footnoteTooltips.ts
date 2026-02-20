/**
 * Footnote hover/focus tooltip previews
 *
 * Shows footnote content inline on hover or focus, so readers don't need to
 * jump to the bottom of the page and back.
 *
 * Works with remark-gfm footnote output where references are inside <sup>
 * elements and link to #fn-N or #user-content-fn-N anchors.
 */

let activeTooltip: HTMLElement | null = null;

function getFootnoteText(href: string): string | null {
	const id = href.slice(1); // strip leading #
	const footnoteEl = document.getElementById(id);
	if (!footnoteEl) return null;

	// Clone and strip the backref (↩) before reading text
	const clone = footnoteEl.cloneNode(true) as HTMLElement;
	clone
		.querySelectorAll('[data-footnote-backref], a[href^="#fnref"], a[href^="#user-content-fnref"]')
		.forEach((el) => el.remove());

	return clone.textContent?.trim().replace(/\s+/g, ' ') ?? null;
}

function positionTooltip(tooltip: HTMLElement, ref: HTMLElement): void {
	const refRect = ref.getBoundingClientRect();
	const margin = 10;
	const maxWidth = Math.min(300, window.innerWidth - margin * 2);

	// Set width before measuring height
	tooltip.style.maxWidth = `${maxWidth}px`;
	tooltip.style.left = '-9999px';
	tooltip.style.top = '-9999px';

	const tooltipHeight = tooltip.offsetHeight;
	const tooltipWidth = tooltip.offsetWidth;

	const preferAbove = refRect.top >= tooltipHeight + margin;
	const top = preferAbove
		? refRect.top - tooltipHeight - margin
		: refRect.bottom + margin;

	let left = refRect.left + refRect.width / 2 - tooltipWidth / 2;
	left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
}

function showTooltip(ref: HTMLAnchorElement): void {
	const href = ref.getAttribute('href');
	if (!href) return;

	const text = getFootnoteText(href);
	if (!text) return;

	hideTooltip();

	const tooltip = document.createElement('div');
	tooltip.className = 'footnote-tooltip';
	tooltip.setAttribute('role', 'tooltip');
	tooltip.textContent = text;
	document.body.appendChild(tooltip);

	positionTooltip(tooltip, ref);

	// Trigger fade-in on next frame so the transition fires
	requestAnimationFrame(() => tooltip.classList.add('visible'));

	activeTooltip = tooltip;
}

function hideTooltip(): void {
	if (!activeTooltip) return;
	const tooltip = activeTooltip;
	activeTooltip = null;

	tooltip.classList.remove('visible');
	tooltip.addEventListener('transitionend', () => tooltip.remove(), { once: true });

	// Fallback removal in case transitionend doesn't fire (reduced motion etc.)
	setTimeout(() => tooltip.remove(), 300);
}

export function initFootnoteTooltips(): void {
	// remark-gfm places refs inside <sup> and uses data-footnote-ref on newer versions.
	// Fall back to href-based selector for older output.
	const refs = document.querySelectorAll<HTMLAnchorElement>(
		'a[data-footnote-ref], sup a[href^="#fn"]:not([href^="#fnref"]), sup a[href^="#user-content-fn"]',
	);

	if (refs.length === 0) return;

	refs.forEach((ref) => {
		ref.addEventListener('mouseenter', () => showTooltip(ref));
		ref.addEventListener('mouseleave', hideTooltip);
		ref.addEventListener('focus', () => showTooltip(ref));
		ref.addEventListener('blur', hideTooltip);
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') hideTooltip();
	});
}
