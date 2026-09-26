import { ui } from '../i18n/ui';

/** Keep headings semantic; expose the optional copy action as a real button. */
export function initHeadingAnchors(): void {
 const headings = document.querySelectorAll<HTMLElement>('.prose h2, .prose h3, .prose h4, .prose h5, .prose h6');
 for (const heading of headings) {
  if (!heading.id || heading.querySelector('.heading-copy')) continue;
  const headingText = heading.textContent?.trim() ?? '';
  // The action's label must not become part of the heading's navigation name.
  if (!heading.hasAttribute('aria-label') && !heading.hasAttribute('aria-labelledby')) {
   heading.setAttribute('aria-label', headingText);
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'heading-copy';
  button.textContent = '#';
  button.setAttribute('aria-label', ui.copy.headingLabel(headingText));
  button.addEventListener('click', async () => {
   const status = document.querySelector<HTMLElement>('[data-assist-status]');
   const url = new URL(window.location.href);
   url.hash = heading.id;
   try {
    await navigator.clipboard.writeText(url.toString());
    if (status) status.textContent = ui.copy.headingSuccess;
   } catch {
    if (status) status.textContent = ui.copy.failure;
   }
  });
  heading.appendChild(button);
 }
}
