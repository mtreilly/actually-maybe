import assert from 'node:assert/strict';
import { glob, readFile } from 'node:fs/promises';

let pageCount = 0;
for await (const path of glob('dist/**/*.html')) {
 const html = await readFile(path, 'utf8');
 const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
 const levels = [...markup.matchAll(/<h([1-6])\b/gi)].map(match => Number(match[1]));
 assert.equal(levels[0], 1, `${path}: the page title must be the first heading`);
 assert.equal(levels.filter(level => level === 1).length, 1, `${path}: exactly one H1`);
 for (let index = 1; index < levels.length; index += 1) {
  assert(levels[index] <= levels[index - 1] + 1, `${path}: heading levels must not skip`);
 }
 pageCount += 1;
}
assert(pageCount > 0, 'Build before checking page headings');
console.log(`Heading outlines passed across all ${pageCount} HTML pages.`);
