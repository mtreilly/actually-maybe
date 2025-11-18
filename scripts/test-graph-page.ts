import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const astroBin = join(process.cwd(), 'node_modules/.bin/astro');
execSync(`${astroBin} build --silent`, { stdio: 'inherit' });

const html = readFileSync(join(process.cwd(), 'dist/graph/index.html'), 'utf8');
assert(html.includes('Knowledge Graph'), 'graph page should include heading');
assert(html.includes('<details'), 'graph page should include fallback topic panels');

console.log('graph page snapshot passed');
