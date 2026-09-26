/** Highlight section links and the mobile label once per animation frame. */
export function initTocScrollHighlight(): (() => void) | undefined {
	const links = Array.from(
		document.querySelectorAll<HTMLAnchorElement>(".toc-link"),
	);
	if (!links.length) return;
	const headings = Array.from(new Set(links.map((link) => link.hash.slice(1))))
		.map((id) => document.getElementById(id))
		.filter((heading): heading is HTMLElement => heading !== null);
	const label = document.querySelector<HTMLElement>("[data-mini-toc-label]");
	let activeId: string | null = null;
	let pendingFrame = 0;
	const update = (): void => {
		pendingFrame = 0;
		const offset = window.innerWidth >= 1200 ? 150 : window.innerHeight * 0.2;
		let currentId = "";
		for (const heading of headings) {
			if (heading.getBoundingClientRect().top <= offset) currentId = heading.id;
		}
		if (currentId === activeId) return;
		activeId = currentId;
		for (const link of links)
			link.classList.toggle("active", link.hash.slice(1) === currentId);
		if (label) {
			label.textContent =
				links
					.find((link) => link.hash.slice(1) === currentId)
					?.textContent?.trim() || "Sections";
		}
	};
	const scheduleUpdate = (): void => {
		if (!pendingFrame) pendingFrame = requestAnimationFrame(update);
	};
	window.addEventListener("scroll", scheduleUpdate, { passive: true });
	window.addEventListener("resize", scheduleUpdate, { passive: true });
	scheduleUpdate();
	return () => {
		window.removeEventListener("scroll", scheduleUpdate);
		window.removeEventListener("resize", scheduleUpdate);
		cancelAnimationFrame(pendingFrame);
	};
}
