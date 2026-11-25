// Tests for .github/workflows/release.yml (F-004-T04): the publish job can use npm trusted publishing.
// Run with `npm run test:tools`. Reads the workflow as text: the repository has no YAML parser, and the checks need
// only the publish job's lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const packageManager = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).packageManager;

/** The lines of one job, from `  <name>:` to the next two-space-indented key. */
const job = (name) => {
  const lines = workflow.split('\n');
  const start = lines.indexOf(`  ${name}:`);
  assert.notEqual(start, -1, `release.yml has no ${name} job`);
  const end = lines.findIndex((line, i) => i > start && /^ {2}[^\s#]/.test(line));
  return lines.slice(start, end === -1 ? undefined : end).join('\n');
};

const atLeast = (version, [a, b, c]) => {
  const [x, y, z] = version.split('.').map(Number);
  return x !== a ? x > a : y !== b ? y > b : z >= c;
};

test('the publish job installs an exact npm version of at least 11.5.1, equal to packageManager', () => {
  const pinned = job('publish').match(/npm install --global --ignore-scripts npm@(\d+\.\d+\.\d+)\s*$/m);
  assert.ok(pinned, 'the publish job must run `npm install --global --ignore-scripts npm@X.Y.Z` with an exact version');
  assert.ok(atLeast(pinned[1], [11, 5, 1]), `npm ${pinned[1]} is older than 11.5.1, the first with trusted publishing`);
  assert.equal(`npm@${pinned[1]}`, packageManager, 'the pinned npm must match packageManager in package.json');
});

test('the publish job prints the npm version before publishing', () => {
  const publish = job('publish');
  assert.ok(publish.indexOf('npm --version') !== -1, 'the publish job must print npm --version');
  assert.ok(publish.indexOf('npm --version') < publish.indexOf('npm publish'));
});

test('the publish job uses OIDC: provenance, no token, no registry-url placeholder token', () => {
  const publish = job('publish');
  assert.match(publish, /npm publish .*--provenance/);
  assert.doesNotMatch(publish, /^ +registry-url:/m);
  assert.doesNotMatch(workflow, /NODE_AUTH_TOKEN:|NPM_TOKEN|secrets\./);
});

test('only the publish job holds id-token: write', () => {
  assert.equal(workflow.match(/^ +id-token: write/gm)?.length, 1);
  assert.match(job('publish'), /id-token: write/);
});
