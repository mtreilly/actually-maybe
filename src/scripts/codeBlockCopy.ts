/**
 * Add copy button and language label to code blocks
 */
export function initCodeBlockCopy(): void {
	const codeBlocks = document.querySelectorAll("pre");

	codeBlocks.forEach((block) => {
		// Skip if button already exists
		if (block.querySelector(".copy-button")) return;

		// Get the code element and its classes
		const codeElement = block.querySelector("code");
		const classes = codeElement?.className || "";

		// Extract language from class (format: language-javascript, lang-python, etc.)
		let language = "";
		const langMatch = classes.match(/language-(\w+)|lang-(\w+)/);
		if (langMatch) {
			language = langMatch[1] || langMatch[2];
		}

		// Create wrapper for controls
		const controlsWrapper = document.createElement("div");
		controlsWrapper.className = "code-block-controls";

		// Add language badge if language is detected
		if (language) {
			const languageBadge = document.createElement("span");
			languageBadge.className = "code-language-badge";
			languageBadge.textContent = language;
			controlsWrapper.appendChild(languageBadge);
		}

		// Create copy button
		const button = document.createElement("button");
		button.className = "copy-button";
		button.setAttribute("aria-label", "Copy code");
		button.innerHTML = "Copy";

		button.addEventListener("click", async () => {
			const code = codeElement?.textContent || "";
			try {
				await navigator.clipboard.writeText(code);

				button.textContent = "Copied!";
				setTimeout(() => {
					button.textContent = "Copy";
				}, 2000);
			} catch (err) {
				console.error("Failed to copy code:", err);
				button.textContent = "Copy failed";
			}
		});

		controlsWrapper.appendChild(button);
		block.style.position = "relative";
		block.appendChild(controlsWrapper);
	});
}
