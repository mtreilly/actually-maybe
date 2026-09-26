// Published dates represent calendar days, independent of the build machine.
export const SITE_LOCALE = 'en-IE';
export const SITE_DIRECTION: 'ltr' | 'rtl' = 'ltr';

export function formatDate(date: Date, locale: string = SITE_LOCALE): string {
 return new Intl.DateTimeFormat(locale, {
  year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
 }).format(date);
}

export function compareText(left: string, right: string, locale: string = SITE_LOCALE): number {
 return new Intl.Collator(locale).compare(left, right);
}

export function formatReadingMinutes(minutes: number, locale: string = SITE_LOCALE): string {
 const value = new Intl.NumberFormat(locale, {
  style: 'unit', unit: 'minute', unitDisplay: 'short',
 }).format(Math.max(1, minutes));
 return minutes < 1 ? `< ${value}` : value;
}

export function formatNumber(value: number, locale: string = SITE_LOCALE): string {
 return new Intl.NumberFormat(locale).format(value);
}
