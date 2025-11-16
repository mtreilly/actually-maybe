/**
 * Add copy button and language label to code blocks with toast notifications
 */
export async function initCodeBlockCopy() {
	// Dynamically import sonner's toast function
	let toastFn: any = null;
	try {
		const sonner = await import('sonner');
		toastFn = sonner.toast;
	} catch (err) {
		console.warn('Sonner not available for toast notifications');
	}

	const codeBlocks = document.querySelectorAll('pre');

	codeBlocks.forEach(block => {
		// Skip if button already exists
		if (block.querySelector('.copy-button')) return;

		// Get the code element and its classes
		const codeElement = block.querySelector('code');
		const classes = codeElement?.className || '';

		// Extract language from class (format: language-javascript, lang-python, etc.)
		let language = '';
		const langMatch = classes.match(/language-(\w+)|lang-(\w+)/);
		if (langMatch) {
			language = langMatch[1] || langMatch[2];
		}

		// Create wrapper for controls
		const controlsWrapper = document.createElement('div');
		controlsWrapper.className = 'code-block-controls';

		// Add language badge if language is detected
		if (language) {
			const languageBadge = document.createElement('span');
			languageBadge.className = 'code-language-badge';
			languageBadge.textContent = language;
			controlsWrapper.appendChild(languageBadge);
		}

		// Create copy button
		const button = document.createElement('button');
		button.className = 'copy-button';
		button.setAttribute('aria-label', 'Copy code');
		button.innerHTML = 'Copy';

		button.addEventListener('click', async () => {
			const code = codeElement?.textContent || '';
			try {
				await navigator.clipboard.writeText(code);

				// Show toast notification if sonner is available
				if (toastFn) {
					const langLabel = language ? ` (${language})` : '';
					toastFn.success('Code copied!', {
						description: `Copied ${code.length} characters${langLabel}`,
						duration: 2000,
					});
				} else {
					// Fallback: update button text
					const originalText = button.textContent;
					button.textContent = 'Copied!';
					setTimeout(() => {
						button.textContent = originalText;
					}, 2000);
				}
			} catch (err) {
				console.error('Failed to copy code:', err);
				if (toastFn) {
					toastFn.error('Failed to copy code', {
						description: 'Please try again',
						duration: 2000,
					});
				}
			}
		});

		controlsWrapper.appendChild(button);
		block.style.position = 'relative';
		block.appendChild(controlsWrapper);
	});
}

// Run when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCodeBlockCopy);
} else {
	initCodeBlockCopy();
}
