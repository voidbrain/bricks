// Tests for tools/check-changelog.mjs (F-005-T01): every package version has a changelog entry.
// Run with `npm run test:tools`. Data is invented.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { changelogErrors, checkRepository } from './check-changelog.mjs';

const log = (...headings) =>
  ['# Changelog', '', '## [Unreleased]', '', ...headings.flatMap((h) => [h, '', '- A change.', ''])].join(
    '\n',
  );

test('a version with a dated heading passes', () => {
  assert.deepEqual(changelogErrors('0.2.0', log('## [0.2.0] - 2026-12-01', '## [0.1.0] - 2026-11-25')), []);
});

test('a version without a heading fails and names the version', () => {
  const errors = changelogErrors('0.3.0', log('## [0.2.0] - 2026-12-01'));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /0\.3\.0/);
});

test('a version mentioned only in text, or as a prefix of another version, does not count', () => {
  assert.equal(changelogErrors('0.1.0', log('## [0.1.0-rc.1] - 2026-11-20') + '\nSee 0.1.0.\n').length, 1);
  assert.equal(changelogErrors('1.0.0', log('## [11.0.0] - 2026-11-20')).length, 1);
});

test('a heading without a valid ISO date fails', () => {
  assert.equal(changelogErrors('0.1.0', log('## [0.1.0]')).length, 1);
  assert.equal(changelogErrors('0.1.0', log('## [0.1.0] - 25/11/2026')).length, 1);
  assert.equal(changelogErrors('0.1.0', log('## [0.1.0] - 2026-02-30')).length, 1);
});

test('a version heading that appears twice fails', () => {
  assert.equal(
    changelogErrors('0.1.0', log('## [0.1.0] - 2026-11-25', '## [0.1.0] - 2026-11-26')).length,
    1,
  );
});

test('a version that is not semantic fails', () => {
  assert.equal(changelogErrors('1.0', log('## [1.0] - 2026-11-25')).length, 1);
});

test('an entry with no lines under it fails', () => {
  const text = ['# Changelog', '', '## [0.2.0] - 2026-12-01', '', '## [0.1.0] - 2026-11-25', '', '- A change.'].join(
    '\n',
  );
  assert.equal(changelogErrors('0.2.0', text).length, 1);
});

test('an entry with only subheadings under it fails', () => {
  const text = ['# Changelog', '', '## [0.2.0] - 2026-12-01', '', '### Added', '', '## [0.1.0] - 2026-11-25', '- A change.'].join(
    '\n',
  );
  assert.equal(changelogErrors('0.2.0', text).length, 1);
});

test('checkRepository reads the library package and CHANGELOG.md, and reports a missing changelog', () => {
  const root = mkdtempSync(join(tmpdir(), 'bricks-changelog-'));
  mkdirSync(join(root, 'projects/bricks'), { recursive: true });
  writeFileSync(join(root, 'projects/bricks/package.json'), JSON.stringify({ version: '0.1.0' }));
  assert.equal(checkRepository(root).length, 1);
  writeFileSync(join(root, 'CHANGELOG.md'), log('## [0.1.0] - 2026-11-25'));
  assert.deepEqual(checkRepository(root), []);
});

test('the repository itself has an entry for the current library version', () => {
  assert.deepEqual(checkRepository(join(import.meta.dirname, '..')), []);
});
