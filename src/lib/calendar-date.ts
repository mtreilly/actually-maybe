/** Interpret authored calendar days independently of the build machine's zone. */
export function normaliseCalendarDate(value: unknown): unknown {
	if (typeof value !== "string") return value;
	const date = value.trim();
	if (/^[A-Za-z]{3,9} \d{1,2} \d{4}$/.test(date)) {
		return `${date} UTC`;
	}
	return date;
}
