import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	AUTHOR_NAME,
	CONTACT_EMAIL,
	SOCIAL_PROFILES,
} from "../src/data/identity";

const path = "src/data/identity.ts";
const original = readFileSync(path, "utf8");
const changedName = "Quality Identity Author";
const changedEmail = "quality-identity@example.test";
const changedProfiles = SOCIAL_PROFILES.map((profile) => ({
	old: profile.url,
	url: `https://example.test/quality-profile-${profile.platform}`,
}));
let changed = original
	.replace(JSON.stringify(AUTHOR_NAME), JSON.stringify(changedName))
	.replace(JSON.stringify(CONTACT_EMAIL), JSON.stringify(changedEmail));
for (const profile of changedProfiles)
	changed = changed.replace(
		JSON.stringify(profile.old),
		JSON.stringify(profile.url),
	);
assert.notEqual(changed, original);

function build(): void {
	execFileSync(resolve("node_modules/.bin/astro"), ["build", "--silent"], {
		stdio: "inherit",
	});
}

function assertFacts(output: string, profiles: boolean): void {
	const content = readFileSync(`dist/${output}`, "utf8");
	assert(
		content.includes(changedName),
		`${output}: author name must follow identity owner`,
	);
	assert(
		content.includes(changedEmail),
		`${output}: contact must follow identity owner`,
	);
	assert(!content.includes(AUTHOR_NAME), `${output}: stale author name`);
	assert(!content.includes(CONTACT_EMAIL), `${output}: stale contact`);
	if (profiles)
		for (const profile of changedProfiles) {
			assert(
				content.includes(profile.url),
				`${output}: profile must follow identity owner`,
			);
			assert(!content.includes(profile.old), `${output}: stale profile`);
		}
}

try {
	writeFileSync(path, changed);
	build();
	for (const output of [
		"about/index.html",
		"about.md",
		"contact/index.html",
		"contact.md",
		".well-known/ai-profile",
		"about.llm",
	])
		assertFacts(output, true);
	for (const output of [
		"llm.txt",
		"llms.txt",
		"privacy/index.html",
		"privacy.md",
	])
		assertFacts(output, false);
	const home = readFileSync("dist/index.html", "utf8");
	assert(home.includes(`<meta name="author" content="${changedName}"`));
	const profile = JSON.parse(
		readFileSync("dist/.well-known/ai-profile", "utf8"),
	) as { name: string; contact: string; profiles: Record<string, string> };
	assert.equal(profile.name, changedName);
	assert.equal(profile.contact, changedEmail);
	assert.deepEqual(
		Object.values(profile.profiles).sort(),
		changedProfiles.map((profile) => profile.url).sort(),
	);
	console.log(
		"One factual identity edit propagated through human, Markdown, JSON-LD, and agent outputs.",
	);
} finally {
	writeFileSync(path, original);
	build();
}
