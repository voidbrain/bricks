# bricks area notes

Detailed rules and lessons for each part of the project, kept out of AGENTS.md so that file stays short. Read the section of the area you change before you change it; AGENTS.md applies to every task. Keep this file current like AGENTS.md: a change that alters a rule here updates it in the same PR.

## Tokens and themes

- Code: `projects/bricks/styles/` (CSS), `tokens/`, `themes/`, `foundations/` (plain TypeScript names and helpers; no Angular imports, ESLint and `check:conventions` enforce it).
- Three layers: primitive → semantic → component ([style guide](../STYLE-GUIDE.md), "Tokens"). Literal colours only in `styles/themes/*.css`.
- Component tokens are declared on `:root` and on every `[data-bx-theme]`: a `:root`-only declaration resolves `var()` once, with base's values, and leaks them into other themes. The browser suite's "a theme changes colours" test guards it.
- A theme defines every semantic token; the browser suite checks each theme against `SEMANTIC_TOKENS` and runs axe on it, contrast included.
- The eva theme follows NERV's Eva · Dark · Orange palette. NERV's light mode and accent colours (20 combinations) are not in bricks yet; they come with NERV adoption (F-006-T01) if NERV still needs them then.
- A theme may set component tokens too (eva sets the card header bar and glow). Its file then loads after `tokens.css`: both declare on a `[data-bx-theme]` selector of equal specificity, so the later file wins.

## Components and patterns

- Code: `projects/bricks/components/` (primitives and components), `patterns/` (none yet). Each component: a file, a spec, an export from `public-api.ts`, a catalogue entry in every theme, a style-guide line.
- Inputs and outputs only: no injected services, no HTTP, routing, maps or storage. A project's behaviour stays in the project; shared domain logic belongs in 🧊 blocks (`voidbrain/blocks`), not here.
- Added only on real demand (AGENTS.md); the planned set (button, input, select, toggle, tag, form field, list row, tabs, dialog, toast; status row, approval card, data table, filters, empty state) is in F-003, each step naming its first consumer.

## genUI surfaces

- Code: `projects/bricks/surfaces/`. `surface.ts` is the contract: NERV's `shared/surface.ts` (2026-11-25, `5e1237dd`) with the same component ids (`nerv-*`), schemas and validation, plus `recipeSurfaceSchema` and `SURFACE_SCHEMAS`. Not ported: NERV's global rejection log; `bx-surface` emits `(rejected)` and the project logs it.
- Version 1 is frozen: a change is a new version with its own validation and tests, a changelog entry, and a note in each consumer's adoption record.
- Cards validate their own input too (as NERV's Web Components do): a card given a payload of another component shows its fallback, never the payload.
- Payload text is rendered as text only; tests feed hostile markup to every card.

## Catalogue and accessibility

- Code: `projects/catalogue/` (one page, every component and surface in every theme, invented samples), `e2e/` (Playwright on the built catalogue served by `e2e/serve.mjs`).
- `npm run test:browser` runs axe (WCAG 2.2 AA and best practice) on the page and on each theme, checks token coverage, keyboard focus and a 320 px width. CI runs it in the `check` job after the build.
- Landmark names must stay unique on the page: samples carry the theme name in their titles.

## Consumers and releases

- The package `@voidbrain/bricks` is built by `npm run build` into `dist/bricks` from `projects/bricks/package.json` `exports`. It is not published yet. Owner decision 2026-11-25: the public npm registry with npm trusted publishing (GitHub Actions OIDC, no stored token); the npm account, the `voidbrain` organisation and the trusted-publisher setting are owner steps in F-004.
- Versions follow semantic versioning with a `CHANGELOG.md` (F-005, Keep a Changelog layout). Before 1.0.0 a minor version may break; the changelog says so. `npm run check:changelog` (in CI and `check:fast`) fails when the version in `projects/bricks/package.json` has no `## [X.Y.Z] - YYYY-MM-DD` heading with lines under it; `node tools/check-changelog.mjs --version X.Y.Z` checks another version, such as a release tag. Its tests run with `npm run test:tools`.
- Consumers (NERV F-006, Hobo F-007, Grover F-008, FPVBuddy F-009 after its Angular 22 upgrade) adopt bricks in their own repositories; the records here hold only bricks' side (what the consumer needs from bricks and the release it ships in).
