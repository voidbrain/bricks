# Changelog

All notable changes to `@voidbrain/bricks` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org/spec/v2.0.0.html). Before 1.0.0 a minor version may break: each entry says what breaks and how to move.

`npm run check:changelog` fails when the version in `projects/bricks/package.json` has no `## [X.Y.Z] - YYYY-MM-DD` heading here. The release that publishes a version sets its date to the release day.

## [Unreleased]

- Nothing yet.

## [0.1.0] - 2026-11-25

First version.

### Added

- `@voidbrain/bricks/tokens`: primitive, semantic and component CSS custom properties and their names (`SEMANTIC_TOKENS`).
- `@voidbrain/bricks/themes`: the base, plain and eva themes (`THEMES`), applied with `data-bx-theme`.
- `@voidbrain/bricks/foundations`: type, spacing, layout, icons, focus and motion.
- `@voidbrain/bricks/components`: badge and card.
- `@voidbrain/bricks/patterns`: the entry point, with no patterns yet.
- `@voidbrain/bricks/surfaces`: the genUI surface contract, version 1 (NERV's component ids, schemas and validation), the status, notice, checklist and recipe cards, and `bx-surface`.
- `@voidbrain/bricks/styles/*`: `bricks.css`, `tokens.css`, `foundations.css` and the theme files.

### Breaking

- Nothing: first version.
