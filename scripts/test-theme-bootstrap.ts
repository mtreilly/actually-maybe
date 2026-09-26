import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const html = await readFile('dist/index.html', 'utf8');
const bootstrap = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
 .map(match => match[1]).find(source => source.includes("localStorage.getItem('theme')"));
assert(bootstrap, 'Built HTML must contain theme initialisation');
for (const systemDark of [false, true]) {
 const attributes = new Map<string, string>();
 const classes = new Set<string>();
 runInNewContext(bootstrap, {
  document: { documentElement: {
   classList: { add: (name: string): void => { classes.add(name); } },
   setAttribute: (name: string, value: string): void => { attributes.set(name, value); },
   style: {},
  } },
  localStorage: { getItem: (): never => { throw new Error('Storage denied'); } },
  window: { matchMedia: (): { matches: boolean } => ({ matches: systemDark }) },
 });
 assert(classes.has('js'), 'Storage denial must not prevent progressive enhancement');
 assert.equal(attributes.get('data-theme'), systemDark ? 'dark' : 'light');
}
console.log('Storage-denied theme initialisation passed for both system themes.');
