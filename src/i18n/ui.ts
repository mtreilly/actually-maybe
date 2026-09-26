export const ui = {
 copy: {
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
  results: (count: number): string => new Intl.PluralRules('en-IE').select(count) === 'one'
   ? '1 post found.' : `${new Intl.NumberFormat('en-IE').format(count)} posts found.`,
  allPosts: 'Showing every post.',
 },
};
