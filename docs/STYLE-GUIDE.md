# bricks style guide

How bricks looks and talks, and how this repository's documents are written. Read it before changing UI (component templates and styles, tokens, themes, user-facing text). The values live in code: [`projects/bricks/styles/`](../projects/bricks/styles/) (`tokens.css`, `themes/*.css`, `foundations.css`). When this guide and the code disagree, the code is what ships: fix whichever is wrong and record the discrepancy in the backlog if it is not fixed in the same change.

bricks is the shared UI kit of the voidbrain projects (NERV, Grover, FPVBuddy, Hobo). It has no look of its own beyond its themes: **base** and **plain** are neutral, **eva** is NERV's EVA look. A project picks a theme; it never overrides a component.

## Documentation ownership

This guide governs the library's UI and repository writing; [Backlog rules](BACKLOG-RULES.md) govern tracking. Backlog status/priority emoji are documentation cues, not UI icons. README describes capabilities; AGENTS directs implementation. User instructions take precedence.

## Content and voice

- **Voice:** short, direct, calm. No "we", no exclamation marks, no emoji in components.
- **Sentence case** for labels; capitals come from a text style (a badge may upper-case a tone, as NERV's notice card does).
- **State honesty** (from NERV): say *ok*, *waiting* or *error* as observed; a component never claims a state its input did not give it.
- Components carry no copy of their own beyond fallbacks (`Invalid surface`, `REJECTED`); a fallback a project shows is an input so the project can translate it (`bx-surface` `rejectedLabel`, `rejectedText`).

## Tokens

Three layers, each read only by the next. Prefix `--bx-`.

| Layer | Where | Read by | Example |
|---|---|---|---|
| Primitive | `styles/tokens.css` `:root` | semantic and component tokens, foundations | `--bx-space-4: 16px` |
| Semantic | each `styles/themes/<name>.css` | components | `--bx-accent`, `--bx-text-muted` |
| Component | `styles/tokens.css`, declared on `:root` and every `[data-bx-theme]` | one component | `--bx-card-bg: var(--bx-surface-raised)` |

- Components use semantic and component tokens only, never a literal colour. A literal colour lives only in a theme file.
- A component token is declared on every theme root, not only `:root`: `var()` resolves where a property is declared, so a `:root`-only declaration carries base's colours into every theme (the browser suite caught exactly this on 2026-11-25).
- A new token is added here in the same change; a semantic token goes in every theme and in `SEMANTIC_TOKENS` (`tokens/tokens.ts`).

### Semantic tokens

| Token | Use |
|---|---|
| `--bx-surface` / `--bx-surface-raised` / `--bx-surface-sunken` | page ground / cards and panels / wells and inputs |
| `--bx-border` | lines and outlines |
| `--bx-text` / `--bx-text-muted` | body text / secondary text, details, counts |
| `--bx-accent` / `--bx-on-accent` | the one accent: primary actions, the waiting badge / text on it |
| `--bx-focus` | the focus outline |
| `--bx-ok`, `--bx-warn`, `--bx-danger`, `--bx-info` / `--bx-on-status` | status fills / text on a status fill |
| `--bx-font`, `--bx-radius`, `--bx-radius-badge` | the theme's type family and corner radii |

### Component tokens

| Token | Use |
|---|---|
| `--bx-card-bg`, `--bx-card-fg`, `--bx-card-border`, `--bx-card-radius`, `--bx-card-padding`, `--bx-card-gap` | card surface, text, border, radius and spacing |
| `--bx-card-title`, `--bx-card-header-bg`, `--bx-card-header-fg`, `--bx-card-header-padding`, `--bx-card-glow` | card header: heading colour, bar fill, meta text, padding; the card's shadow. Transparent bar and no glow by default; eva fills the bar with the accent (text on accent) and adds an inset accent glow (NERV `--hdr-bg`, `--hdr-fg`, `--title`, `--glow`) |
| `--bx-stat-bg`, `--bx-stat-fg`, `--bx-stat-muted`, `--bx-stat-border`, `--bx-stat-radius`, `--bx-stat-padding` | stat tile (`bx-stat`) well, value text, label and detail text, border, radius, padding |
| `--bx-badge-radius`, `--bx-badge-font-size`, `--bx-badge-padding` | badge radius, type size and padding |
| `--bx-control-bg`, `--bx-control-fg`, `--bx-control-border`, `--bx-control-radius`, `--bx-control-padding` | form controls (`bx-button`, `bx-input`, `bx-select`, `bx-toggle`) |
| `--bx-tag-bg`, `--bx-tag-fg`, `--bx-tag-border`, `--bx-tag-radius` | tag chip (`bx-tag`) surface, text, border and radius |

### Themes

| Theme | Look | Source |
|---|---|---|
| `base` | neutral, light; also the `:root` default | NERV's Simple · Light palette |
| `plain` | neutral, dark | NERV's Simple · Dark · Blue palette |
| `eva` | NERV's EVA look: orange on near-black, square corners, monospace (Share Tech Mono only when installed; no remote fonts) | NERV's Eva · Dark · Orange (`palette()` in NERV's dashboard, F-047) |

A theme is applied with `data-bx-theme="<name>"` on any element (`applyTheme()` in `@voidbrain/bricks/themes`); themes nest. Every theme meets WCAG AA: 4.5:1 for text (including text on status fills), 3:1 for UI parts. The browser suite runs axe on each.

## Foundations

- **Type:** sizes `--bx-font-size-xs` 11 px to `--bx-font-size-2xl` 23 px; body line height 1.5; weights regular 400, medium 500, bold 700.
- **Spacing:** a 4 px grid, `--bx-space-1` 4 px to `--bx-space-8` 32 px.
- **Radii and lines:** `--bx-radius-0`, `-sm` 3 px, `-md` 6 px, `-lg` 8 px; 1 px lines.
- **Focus:** a 3 px `--bx-focus` outline, 2 px offset, on `:focus-visible`, inside any themed root (`foundations.css`).
- **Motion:** `--bx-duration-fast` 120 ms, `--bx-duration-base` 200 ms, one standard easing; `prefers-reduced-motion` stops motion.
- **Layout:** classes in `foundations.css`, names in `LAYOUT_CLASSES` (`@voidbrain/bricks/foundations`). `bx-stack` (a column), `bx-cluster` (a wrapping row), `bx-grid` (as many columns as fit `--bx-grid-min`, default 16rem, never wider than the screen), `bx-columns` (one column below `md`, `--bx-columns` from `md` up), `bx-safe-area` (padding clear of a phone's notch and home indicator, at least `--bx-safe-min`; the page needs `viewport-fit=cover`). Gaps come from the spacing scale: `--bx-gap`, or a `bx-gap-n` class for `--bx-space-n`; default `--bx-space-3`.
- **Breakpoints:** phone first, `min-width` only: `sm` 480 px, `md` 768 px, `lg` 1024 px (`BREAKPOINTS`, `minWidth()`). A media query cannot read a custom property, so CSS repeats the numbers; the browser suite checks `bx-columns` switches at `md`. Everything fits 320 px without horizontal scroll.
- **Safe areas:** `--bx-safe-top`, `-right`, `-bottom`, `-left`: `env(safe-area-inset-*)`, 0 px off phones.
- **Icons:** a small line set on a 24 px box, 2 px stroke, round caps, in `currentColor` so it takes the text colour of every theme (`ICON_NAMES`: check, close, plus, minus, chevrons, menu, more, search, info, warning, error). Inline SVG through `bx-icon`; no icon font, sprite file or CDN. Size `--bx-icon-size` (1.25em), stroke `--bx-icon-stroke`. An icon next to text that says the same is decorative (hidden from screen readers); an icon alone gets a `label`. Colour never carries meaning alone, so a status icon sits next to its status in text. A new icon is added on real demand, drawn to the same box and stroke.

## Components

| Component | Entry point | Use |
|---|---|---|
| `bx-button` | `components` | action button (`primary`, `secondary`, `danger`, `ghost`), emits `pressed` |
| `bx-input` | `components` | single-line text input bound with `[(value)]`, `[formField]` or a reactive form control; sets `aria-invalid` when `invalid`; emits `touch` on blur |
| `bx-select` | `components` | native select over `SelectOption[]`, bound like `bx-input`; emits `touch` on blur |
| `bx-toggle` | `components` | accessible binary switch (`role="switch"`) bound with `[(checked)]`, `[formField]` or a reactive form control; emits `touch` on blur |
| `bx-tag` | `components` | bordered chip for metadata or filters; `removable` adds an accessible remove button emitting `removed` |
| `bx-card` | `components` | a raised panel; `heading` adds a header row (an `h2` to `h6` by `headingLevel`, a meta slot for `[bx-card-meta]` content) and names the region by it; without a heading, `label` names the region |
| `bx-stat` | `components` | a stat tile: `label`, `value` (text; the project formats numbers) and optional `detail`, as a group named by its label; lay several out with `bx-grid` |
| `bx-icon` | `components` | an inline SVG icon from the set in `currentColor`; decorative unless given a `label` (then `role="img"` with that name); an unknown name draws nothing |
| `bx-badge` | `components` | a short label on a tone (`accent`, `ok`, `warn`, `danger`, `info`); `live` gives it `role="status"` |
| `bx-status-card`, `bx-notice-card`, `bx-checklist-card`, `bx-recipe-card` | `surfaces` | NERV's four genUI cards, same component ids, schemas and validation |
| `bx-surface` | `surfaces` | validates one surface payload and renders its card, or a rejection alert; emits `rejected` and `checklistToggle` |

Each component is shown in every theme in the catalogue (`npm start`). Components are added only on real demand: the record that adds one names the project or surface that needs it.

## Live views

Render once, then update only what changed; lists are keyed rows (`@for … track id`): a new payload patches, adds, moves or removes rows, never rebuilds the list. The checklist card keeps a row's DOM node across payloads (unit-tested). Non-Angular pages use `@voidbrain/bricks/live` (`createLiveView`, `patchKeyedRows`, `setText`, `setAttr`), which builds nodes with DOM APIs only (never `innerHTML`) and writes only changed text and attributes. `setAttr` refuses `on*` attributes, and `patchKeyedRows` throws on a duplicate key before touching the DOM. The helper adds no listeners and keeps no global state beyond a `WeakMap` per container. Angular templates keep `@for … track`; when an Angular component hosts the helper (as the catalogue's `live-demo.ts` does), it mounts `createLiveView` in `ngAfterViewInit` on a `viewChild` element, calls `update` from its own state changes, and releases what it started (observers, subscriptions, timers) in `ngOnDestroy`.

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus and an accessible name.
- Colour never carries meaning alone: a status badge also says the status in text.
- Text from a payload is always text: never `innerHTML`, never parsed as markup (unit-tested with hostile payloads).
- Images that carry meaning have alt text (a recipe photo uses its caption, or the recipe title).

## Writing in this repository

- Plain English, short sentences, active voice. Say what is, not what might be.
- Name things as the code names them: files, functions, commands in backticks, linked when they are paths.
- Dates are absolute (`2026-11-25`), never "yesterday" or "last week".
- One owner per fact: link to it rather than restating it. AGENTS for how to work, the backlog for status, this guide for look and voice, README for what the library does.

## Keeping it in step

A change that adds or alters a token, a theme, a text style, a component or the voice updates this guide in the same PR. A design doc that disagrees with the code becomes a backlog record.
