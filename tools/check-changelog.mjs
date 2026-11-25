#!/usr/bin/env node
// Every version of @voidbrain/bricks has a changelog entry (F-005-T01).
// projects/bricks/package.json `version` must have exactly one dated heading in CHANGELOG.md,
// Keep a Changelog style: `## [X.Y.Z] - YYYY-MM-DD`, with at least one line under it.
// Usage: node tools/check-changelog.mjs [--version X.Y.Z]   (--version: check that version instead, e.g. a release tag)
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

const isoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

/** The problems with `text` as the changelog for `version`; empty when it has a proper entry. */
export function changelogErrors(version, text) {
  if (!SEMVER.test(version)) return [`Version "${version}" is not a semantic version (X.Y.Z).`];
  const lines = text.split(/\r?\n/);
  const headings = lines
    .map((line, i) => ({ line, i, m: /^## \[([^\]]+)\](.*)$/.exec(line) }))
    .filter((h) => h.m && h.m[1] === version);
  if (headings.length === 0)
    return [`CHANGELOG.md has no "## [${version}] - YYYY-MM-DD" heading for version ${version}.`];
  if (headings.length > 1) return [`CHANGELOG.md has ${headings.length} headings for version ${version}.`];
  const [{ m, i }] = headings;
  const date = /^ - (\S+)$/.exec(m[2])?.[1];
  if (!date || !isoDate(date))
    return [`The heading for ${version} needs a release date: "## [${version}] - YYYY-MM-DD".`];
  const next = lines.findIndex((line, j) => j > i && /^#{1,2} /.test(line));
  const body = lines
    .slice(i + 1, next < 0 ? undefined : next)
    .filter((line) => line.trim() && !/^#/.test(line)); // subheadings alone (### Added) are not an entry
  if (body.length === 0) return [`The entry for ${version} is empty: say what changed and what breaks.`];
  return [];
}

/** Checks the library version (or `version`) against CHANGELOG.md in the repository at `root`. */
export function checkRepository(root, version) {
  const v = version ?? JSON.parse(readFileSync(join(root, 'projects/bricks/package.json'), 'utf8')).version;
  const path = join(root, 'CHANGELOG.md');
  if (!existsSync(path)) return ['CHANGELOG.md is missing.'];
  return changelogErrors(v, readFileSync(path, 'utf8'));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const at = process.argv.indexOf('--version');
  const version = at < 0 ? undefined : process.argv[at + 1];
  if (at >= 0 && !version) {
    console.error('--version needs a value');
    process.exit(2);
  }
  const errors = checkRepository(process.cwd(), version);
  for (const e of errors) console.error(`✖ ${e}`);
  if (errors.length) {
    console.error('Add the entry to CHANGELOG.md (F-005): what changed, and what breaks before 1.0.0.');
    process.exit(1);
  }
  console.log('Changelog has an entry for the library version.');
}
