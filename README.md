# 🧱 bricks

bricks is the shared Angular UI library of the voidbrain projects (NERV, Grover, FPVBuddy, Hobo), packaged as `@voidbrain/bricks`. It holds UI only: design tokens, themes, foundations, components, patterns and NERV's genUI surfaces, so every project looks consistent and restyles by theme instead of overriding components. No domain logic, maps or routing: shared domain logic lives in a separate monorepo, 🧊 blocks (`voidbrain/blocks`, npm workspaces, one package per domain such as `@voidbrain/geo` or `@voidbrain/blackbox`), created only when its first package is really shared.

Status: first content (0.1.0, unpublished; it will be published on the public npm registry with trusted publishing, F-004). The plan, in steps with estimates, is the [backlog](docs/BACKLOG.md).

## What is in it

| Entry point | Holds |
|---|---|
| `@voidbrain/bricks/tokens` | the token names (`SEMANTIC_TOKENS`, `COMPONENT_TOKENS`, `cssVar`); CSS in `@voidbrain/bricks/styles/tokens.css` |
| `@voidbrain/bricks/themes` | `THEMES` (`base`, `plain`, `eva`) and `applyTheme`; CSS in `@voidbrain/bricks/styles/themes/<name>.css` |
| `@voidbrain/bricks/foundations` | type and spacing scales; focus and motion in `@voidbrain/bricks/styles/foundations.css` |
| `@voidbrain/bricks/live` | framework-free live-view helpers (`setText`, `setAttr`, `patchKeyedRows`, `createLiveView`) |
| `@voidbrain/bricks/components` | `bx-button`, `bx-input`, `bx-select`, `bx-toggle`, `bx-tag`, `bx-card`, `bx-badge` |
| `@voidbrain/bricks/surfaces` | the genUI contract (schemas, `validateSurfaceResult`) and `bx-status-card`, `bx-notice-card`, `bx-checklist-card`, `bx-recipe-card`, `bx-surface` |
| `@voidbrain/bricks/patterns` | the entry point exists; patterns (status row, approval card, data table, filters, empty state) land on demand (F-003) |

Using it in a project (once published on npm, F-004):

```css
/* global styles: everything, or tokens.css + one theme + foundations.css */
@import '@voidbrain/bricks/styles/bricks.css';
```

```html
<body data-bx-theme="eva">
  <bx-surface [surface]="payload" (rejected)="log($event)" (checklistToggle)="save($event)" />
</body>
```

## Run it

```bash
npm ci
npm start              # the catalogue: every component in every theme, http://localhost:4200
npm test               # unit tests (library and catalogue)
npm run build          # dist/bricks (the package), then dist/catalogue
npm run test:browser   # axe and theme checks on the built catalogue (npx playwright install chromium once)
```

Node 24 or later.

## Where things are

```
projects/bricks/          the library: tokens/, themes/, foundations/, components/, surfaces/, styles/ (CSS)
projects/catalogue/       the catalogue app, a demo page for visual and accessibility checks
e2e/                      the browser suite (Playwright and axe on the built catalogue)
docs/                     backlog, rules, style guide, audits, archives
docs/work/                backlog record sources and steps (npm run work:build writes docs/BACKLOG.md)
tools/                    harness checks (backlog, freshness, conventions, coverage)
```

## Working on it

- [AGENTS.md](AGENTS.md): how to work in this repository (for people and coding agents), with per-area rules in [docs/agents/areas.md](docs/agents/areas.md).
- [docs/BACKLOG.md](docs/BACKLOG.md): current bugs and features, with their status and next action ([rules](docs/BACKLOG-RULES.md)).
- [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md): tokens, themes, components and voice.

## Licence

[MIT](LICENSE).
