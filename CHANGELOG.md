# Changelog

All notable changes to `@voidbrain/bricks` are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org/spec/v2.0.0.html). Before 1.0.0 a minor version may break: each entry says what breaks and how to move.

`npm run check:changelog` fails when the version in `projects/bricks/package.json` has no `## [X.Y.Z] - YYYY-MM-DD` heading here. The release that publishes a version sets its date to the release day.

## [Unreleased]

### Added

- `bx-card` header: `heading`, `headingLevel` (2 to 6) and `headingId` inputs and a `[bx-card-meta]` slot; a headed card is a region named by its heading. Component tokens `--bx-card-title`, `--bx-card-header-bg`, `--bx-card-header-fg`, `--bx-card-header-padding`, `--bx-card-glow`; eva sets a filled accent header bar and an inset glow (F-006-T04).
- `bx-stat`: a stat tile with label, value and detail, and its `--bx-stat-*` component tokens (F-006-T04).
- `bx-button` `size="sm"` (compact, 24 px target; `--bx-control-padding-sm`); `bx-badge` `appearance` (`solid`, `outline`, `dashed`) and a `neutral` tone (`--bx-badge-outline-bg`) (F-006-T05).
- `bx-meter` (value, range, threshold mark, tone; `--bx-meter-*`), `bx-disclosure` (native `details`, `[(open)]`; `--bx-disclosure-*`) and `bx-alert` (inline note, status or alert; `--bx-alert-*`) (F-006-T05).
- Foundations: `bx-sr-only` (`SR_ONLY_CLASS`) and `bx-columns-phone`, which keeps `bx-columns` columns on a phone (in `LAYOUT_CLASSES`) (F-006-T05).
- `bx-timeline` and `bx-timeline-item` (time, meta and actions slots, detail, marker tone; `--bx-timeline-*`), `bx-avatar` (image or initials, decorative, pixelated, `sm` and `md`; `--bx-avatar-*`) and `bx-avatar-stack` (F-006-T06).

### Changed

- `bx-card` wraps its content in a padded `.body`; the `section.card` itself has no padding now (it holds the header and the body). Content projected into the card is unaffected.
- `bx-badge` has a 1 px transparent border (the outlined appearances draw it), so a solid badge is 2 px larger than before.

## [0.3.0] - 2026-11-26

Published from the release workflow with npm trusted publishing and provenance. It also carries everything listed under 0.2.0, which was tagged but never reached npm (its publish failed, F-004-T04).

### Added

- `@voidbrain/bricks/live`: framework-free live-view helpers (`setText`, `setAttr`, `patchKeyedRows`, `createLiveView`) that render once with DOM nodes (no `innerHTML`) and patch only changed values and keyed rows (F-003-T03).

### Breaking

- Nothing.

## [0.2.0] - 2026-11-26

Tagged `v0.2.0` but not published on npm: the publish step failed (F-004-T04). Its changes ship in 0.3.0.

### Added

- `@voidbrain/bricks/components`: `bx-button`, `bx-input`, `bx-select`, `bx-toggle` and `bx-tag` form primitives (`bx-input`, `bx-select` and `bx-toggle` bind `[(value)]`/`[(checked)]`, signal forms `[formField]` and reactive form controls, and emit `touch` on blur), plus `--bx-control-*` and `--bx-tag-*` component tokens (`COMPONENT_TOKENS`) (F-003-T01).
- `@voidbrain/bricks/foundations`: layout classes in `foundations.css` (`bx-stack`, `bx-cluster`, `bx-grid`, `bx-columns`, `bx-safe-area`, `bx-gap-1` to `bx-gap-8`) and their names (`LAYOUT_CLASSES`, `gapClass()`), breakpoints (`BREAKPOINTS`, `minWidth()`), safe-area tokens (`--bx-safe-top`, `-right`, `-bottom`, `-left`, `SAFE_AREA_TOKENS`), and a 14-icon inline SVG set (`ICONS`, `ICON_NAMES`, `iconPaths()`, `isIconName()`) (F-003-T07).
- `@voidbrain/bricks/components`: `bx-icon`, an inline SVG icon in `currentColor`, decorative unless given a `label`; component tokens `--bx-icon-size` and `--bx-icon-stroke` (F-003-T07).

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
