# Changelog

All notable changes to `@voidbrain/bricks` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org/spec/v2.0.0.html). Before 1.0.0 a minor version may break: each entry says what breaks and how to move.

`npm run check:changelog` fails when the version in `projects/bricks/package.json` has no `## [X.Y.Z] - YYYY-MM-DD` heading here. The release that publishes a version sets its date to the release day.

## [Unreleased]

### Added

- `@voidbrain/bricks/components`: `bx-button`, `bx-input`, `bx-select`, `bx-toggle` and `bx-tag` form primitives (`bx-input`, `bx-select` and `bx-toggle` bind `[(value)]`/`[(checked)]`, signal forms `[formField]` and reactive form controls, and emit `touch` on blur), plus `--bx-control-*` and `--bx-tag-*` component tokens (`COMPONENT_TOKENS`).
- `@voidbrain/bricks/foundations`: layout classes in `foundations.css` (`bx-stack`, `bx-cluster`, `bx-grid`, `bx-columns`, `bx-safe-area`, `bx-gap-1` to `bx-gap-8`) and their names (`LAYOUT_CLASSES`, `gapClass()`), breakpoints (`BREAKPOINTS`, `minWidth()`), safe-area tokens (`--bx-safe-top`, `-right`, `-bottom`, `-left`, `SAFE_AREA_TOKENS`), and a 14-icon inline SVG set (`ICONS`, `ICON_NAMES`, `iconPaths()`, `isIconName()`).
- `@voidbrain/bricks/components`: `bx-icon`, an inline SVG icon in `currentColor`, decorative unless given a `label`; component tokens `--bx-icon-size` and `--bx-icon-stroke`.

### Breaking

- Nothing.

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
