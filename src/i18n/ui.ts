export const ui = {
 search: {
  label: 'Search posts',
  placeholder: 'Search posts by title, description, or topic…',
  noResults: 'No posts found. Try a different search.',
  results: (count: number): string => new Intl.PluralRules('en-IE').select(count) === 'one'
   ? '1 post found.' : `${new Intl.NumberFormat('en-IE').format(count)} posts found.`,
  allPosts: 'Showing every post.',
 },
};
