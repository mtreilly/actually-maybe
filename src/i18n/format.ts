// Published dates represent calendar days, independent of the build machine.
export const SITE_LOCALE = 'en-IE';

export function formatDate(date: Date, locale: string = SITE_LOCALE): string {
 return new Intl.DateTimeFormat(locale, {
  year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
 }).format(date);
}
