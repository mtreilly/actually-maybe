import { SITE_LOCALE } from './format';

export const ui = {
 navigation: {
  home: 'Home', topics: 'Topics', projects: 'Projects', about: 'About', search: 'Search',
  toggle: 'Toggle navigation', primary: 'Main navigation', footer: 'Site information',
  rss: 'RSS Feed', archive: 'Archive', contact: 'Contact', privacy: 'Privacy',
  builtWith: 'Built with Astro.',
 },
 theme: { darkMode: 'Dark mode' },
 copy: {
  menu: 'Markdown',
  options: 'Copy options',
  markdown: 'Copy markdown',
  link: 'Copy markdown link',
  openMarkdown: 'Open markdown',
  code: 'Copy code',
  button: 'Copy',
  success: 'Copied!',
  failure: 'Copy failed. Select the text and copy it manually.',
  markdownSuccess: 'Markdown copied',
  linkSuccess: 'Markdown link copied',
  markdownFailure: 'Unable to copy markdown. Open the markdown link and copy it manually.',
  actionFailure: 'Unable to copy. Open the markdown link and copy it manually.',
  headingLabel: (heading: string): string => `Copy link to: ${heading}`,
  headingSuccess: 'Heading link copied',
 },
 search: {
  label: 'Search posts',
  placeholder: 'Search posts by title, description, or topic…',
  noResults: 'No posts found. Try a different search.',
  results: (count: number): string => new Intl.PluralRules(SITE_LOCALE).select(count) === 'one'
   ? '1 post found.' : `${new Intl.NumberFormat(SITE_LOCALE).format(count)} posts found.`,
  allPosts: 'Showing every post.',
 },
};
