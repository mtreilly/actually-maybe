import { strict as assert } from "node:assert";
import {
	compareText,
	formatDate,
	formatNumber,
	formatReadingMinutes,
} from "../format";

const date = new Date("2024-11-18T00:00:00Z");
const originalTimeZone = process.env.TZ;
try {
	process.env.TZ = "America/Los_Angeles";
	assert.equal(formatDate(date), "18 Nov 2024");
	process.env.TZ = "Pacific/Auckland";
	assert.equal(formatDate(date), "18 Nov 2024");
	assert.equal(formatDate(date, "de-DE"), "18. Nov. 2024");
	assert.equal(Math.sign(compareText("ä", "z", "sv")), 1);
	assert.equal(Math.sign(compareText("ä", "z", "de")), -1);
	assert.match(formatReadingMinutes(2, "ar-u-nu-arab"), /٢/);
	assert.match(formatReadingMinutes(0), /^< /);
	assert.equal(formatNumber(1234.5, "de-DE"), "1.234,5");
} finally {
	if (originalTimeZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalTimeZone;
}
console.log("Locale and calendar-date formatting passed.");
