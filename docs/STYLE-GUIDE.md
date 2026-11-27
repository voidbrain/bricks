# bricks style guide

How bricks looks and talks, and how this repository's documents are written. Read it before changing UI (component templates and styles, tokens, themes, user-facing text). The values live in code: [`projects/bricks/styles/`](../projects/bricks/styles/) (`tokens.css`, `themes/*.css`, `foundations.css`). When this guide and the code disagree, the code is what ships: fix whichever is wrong and record the discrepancy in the backlog if it is not fixed in the same change.

bricks is the shared UI kit of the voidbrain projects (NERV, Grover, FPVBuddy, Hobo). It has no look of its own beyond its themes: **base** and **plain** are neutral, **simple** and **eva** are NERV's Simple and EVA looks, each in two modes and five accents. A project picks a theme; it never overrides a component.

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
| Primitive | `styles/tokens.css` `:root`; accent shades in `styles/themes/accents.css` | semantic and component tokens, foundations; the shades only by theme files | `--bx-space-4: 16px`, `--bx-hue-base` |
| Semantic | each `styles/themes/<name>.css` | components | `--bx-accent`, `--bx-text-muted` |
| Component | `styles/tokens.css`, declared on `:root` and every `[data-bx-theme]` | one component | `--bx-card-bg: var(--bx-surface-raised)` |

- Components use semantic and component tokens only, never a literal colour. A literal colour lives only in a theme file.
- A component token is declared on every theme root, not only `:root`: `var()` resolves where a property is declared, so a `:root`-only declaration carries base's colours into every theme (the browser suite caught exactly this on 2026-11-25).
- A theme may set component tokens too (eva sets the card header bar and glow). Its file then loads after `tokens.css`: both declare on a `[data-bx-theme]` selector of equal specificity, so the later file wins.
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
| `--bx-brand-bg` / `--bx-brand-fg` | a project's mark or brand chip / text on it: the accent and text on accent, except eva light, where it is the bright accent shade with black text (NERV `--brand-bg`, `--brand-fg`); eva's card header bar reads it |
| `--bx-series-green`, `--bx-series-orange`, `--bx-series-blue` | fixed series and sub-label colours that do not follow the accent (NERV `--green`, `--orange`, `--blue`); text at 4.5:1 on every surface. A hint only: the text says what the series is |
| `--bx-font`, `--bx-radius`, `--bx-radius-badge` | the theme's type family and corner radii |

### Component tokens

| Token | Use |
|---|---|
| `--bx-card-bg`, `--bx-card-fg`, `--bx-card-border`, `--bx-card-radius`, `--bx-card-padding`, `--bx-card-gap` | card surface, text, border, radius and spacing |
| `--bx-card-title`, `--bx-card-header-bg`, `--bx-card-header-fg`, `--bx-card-header-padding`, `--bx-card-glow` | card header: heading colour, bar fill, meta text, padding; the card's shadow. Transparent bar and no glow by default; eva fills the bar with the brand colour (`--bx-brand-bg`, text `--bx-brand-fg`) and adds an inset accent glow (NERV `--hdr-bg`, `--hdr-fg`, `--title`, `--glow`) |
| `--bx-stat-bg`, `--bx-stat-fg`, `--bx-stat-muted`, `--bx-stat-border`, `--bx-stat-radius`, `--bx-stat-padding` | stat tile (`bx-stat`) well, value text, label and detail text, border, radius, padding |
| `--bx-badge-radius`, `--bx-badge-font-size`, `--bx-badge-padding`, `--bx-badge-outline-bg` | badge radius, type size and padding; the fill behind an outlined or dashed badge (transparent) |
| `--bx-control-bg`, `--bx-control-fg`, `--bx-control-border`, `--bx-control-radius`, `--bx-control-padding`, `--bx-control-padding-sm` | form controls (`bx-button`, `bx-input`, `bx-select`, `bx-toggle`); `-sm` is the compact button's padding |
| `--bx-meter-height`, `--bx-meter-track`, `--bx-meter-border`, `--bx-meter-radius`, `--bx-meter-mark` | meter (`bx-meter`) bar height, track, border, radius and threshold mark |
| `--bx-disclosure-fg`, `--bx-disclosure-indent` | disclosure (`bx-disclosure`) summary text and content indent |
| `--bx-alert-fg`, `--bx-alert-padding`, `--bx-alert-radius`, `--bx-alert-tint` | inline alert (`bx-alert`) text, padding, radius, and how much of the tone tints its ground (10 %) |
| `--bx-timeline-line`, `--bx-timeline-marker-size`, `--bx-timeline-marker-radius`, `--bx-timeline-gap`, `--bx-timeline-indent` | timeline (`bx-timeline`) line colour, marker size (8 px) and radius, gap between rows, indent that holds the line and markers |
| `--bx-avatar-size-sm`, `--bx-avatar-size-md`, `--bx-avatar-bg`, `--bx-avatar-fg`, `--bx-avatar-border`, `--bx-avatar-radius`, `--bx-avatar-stack-gap` | avatar (`bx-avatar`) sizes (20 and 32 px), the well and initials text behind it, border, radius; the gap in a `bx-avatar-stack` |
| `--bx-log-bg`, `--bx-log-border`, `--bx-log-padding`, `--bx-log-max-height` | message log (`bx-message-log`) well, border, padding and the height it scrolls past (300 px) |
| `--bx-message-gap`, `--bx-message-muted`, `--bx-message-own-tint` | message (`bx-message`) gap after the avatar, time and context text, how much accent tints the person's own messages (7 %) |
| `--bx-listbox-bg`, `--bx-listbox-border`, `--bx-listbox-active`, `--bx-listbox-max-height` | listbox popup (`bx-listbox`) well, border, the active option's border and 12 % tint, the height it scrolls past (180 px) |
| `--bx-composer-gap` | composer (`bx-composer`) gap between the menu, field and buttons |
| `--bx-tag-bg`, `--bx-tag-fg`, `--bx-tag-border`, `--bx-tag-radius` | tag chip (`bx-tag`) surface, text, border and radius |
| `--bx-chart-bg`, `--bx-chart-fg`, `--bx-chart-axis`, `--bx-chart-grid`, `--bx-chart-border`, `--bx-chart-radius`, `--bx-chart-band-tint` | charts (`bx-chart-frame` and every `bx-*-chart`): plot surface, value text, axis and tick labels, grid lines, frame border, corner radius and target-band tint (14 %) |

### Themes

| Theme | Look | Mode and accent | Source |
|---|---|---|---|
| `base` | neutral, light, sans, 8 px corners; also the `:root` default | fixed | NERV's Simple · Light palette |
| `plain` | neutral, dark, sans, 8 px corners | fixed | NERV's Simple · Dark · Blue palette |
| `simple` | plain's neutral surfaces, monospace, 6 px corners | dark (default) or light; five accents, orange by default | NERV's Simple (`palette()` in NERV's `src/dashboard-theme.ts`); Simple · Dark · Orange is NERV's `/full` default |
| `eva` | NERV's EVA look: accent-tinted text on near-black (dark) or warm paper (light), square corners, monospace (Share Tech Mono only when installed; no remote fonts), a filled card header bar and glow | dark (default) or light; five accents, orange by default | NERV's Eva (F-047); Eva · Dark · Orange is the original |

A theme is applied with `data-bx-theme="<name>"` on any element; themes nest. `simple` and `eva` also read `data-bx-mode` (`dark`, `light`) and `data-bx-accent` (`orange`, `blue`, `green`, `violet`, `ochre`) **on the same element**: `applyThemeChoice(element, { theme, mode, accent })` in `@voidbrain/bricks/themes` sets all three, checks each part (`themeChoice()`) and clears mode and accent for `base` and `plain`; `applyTheme(element, name)` gives a theme its default mode and accent. The 20 combinations are `THEME_COMBINATIONS`.

How it is built: `accents.css` sets five accent shades per accent (`--bx-hue-base`, the accent on dark; `-tint` and `-soft`, eva's text and muted text on dark; `-deep`, the accent on light; `-ink`, deep mixed 50 % with black, eva's text on light), and each variant theme's dark rule and its `[data-bx-mode='light']` rule build the semantic tokens from them. A light rule redefines every literal colour its dark rule sets (tokens built with `var()` from other tokens, such as the brand colours, follow them). On light grounds the accent is the deep shade with white text on it; eva's light card header keeps the bright shade with black text, as NERV's does.

Every theme and every combination meets WCAG AA: 4.5:1 for text (including text on status fills and on the accent), 3:1 for UI parts. The browser suite runs axe on each theme section and on all 20 combinations through the catalogue's switcher, and checks each text pair's contrast from the computed tokens (text, status, accent and series colours on every surface; text on the accent, status, brand and header fills).

## Foundations

- **Type:** sizes `--bx-font-size-xs` 11 px to `--bx-font-size-2xl` 23 px; body line height 1.5; weights regular 400, medium 500, bold 700.
- **Spacing:** a 4 px grid, `--bx-space-1` 4 px to `--bx-space-8` 32 px.
- **Radii and lines:** `--bx-radius-0`, `-sm` 3 px, `-md` 6 px, `-lg` 8 px; 1 px lines.
- **Focus:** a 3 px `--bx-focus` outline, 2 px offset, on `:focus-visible`, inside any themed root (`foundations.css`).
- **Motion:** `--bx-duration-fast` 120 ms, `--bx-duration-base` 200 ms, one standard easing; `prefers-reduced-motion` stops motion.
- **Layout:** classes in `foundations.css`, names in `LAYOUT_CLASSES` (`@voidbrain/bricks/foundations`). `bx-stack` (a column), `bx-cluster` (a wrapping row), `bx-grid` (as many columns as fit `--bx-grid-min`, default 16rem, never wider than the screen), `bx-columns` (one column below `md`, `--bx-columns` from `md` up; add `bx-columns-phone` to keep `--bx-columns`, default 2, on a phone too, for short paired fields), `bx-safe-area` (padding clear of a phone's notch and home indicator, at least `--bx-safe-min`; the page needs `viewport-fit=cover`). Gaps come from the spacing scale: `--bx-gap`, or a `bx-gap-n` class for `--bx-space-n`; default `--bx-space-3`.
- **Visually hidden:** `bx-sr-only` (`SR_ONLY_CLASS`) hides text on screen and keeps it for screen readers: a label the layout shows another way, a heading for the outline.
- **Breakpoints:** phone first, `min-width` only: `sm` 480 px, `md` 768 px, `lg` 1024 px (`BREAKPOINTS`, `minWidth()`). A media query cannot read a custom property, so CSS repeats the numbers; the browser suite checks `bx-columns` switches at `md`. Everything fits 320 px without horizontal scroll.
- **Safe areas:** `--bx-safe-top`, `-right`, `-bottom`, `-left`: `env(safe-area-inset-*)`, 0 px off phones.
- **Icons:** a small line set on a 24 px box, 2 px stroke, round caps, in `currentColor` so it takes the text colour of every theme (`ICON_NAMES`: check, close, plus, minus, chevrons, menu, more, search, info, warning, error). Inline SVG through `bx-icon`; no icon font, sprite file or CDN. Size `--bx-icon-size` (1.25em), stroke `--bx-icon-stroke`. An icon next to text that says the same is decorative (hidden from screen readers); an icon alone gets a `label`. Colour never carries meaning alone, so a status icon sits next to its status in text. A new icon is added on real demand, drawn to the same box and stroke.

## Components

| Component | Entry point | Use |
|---|---|---|
| `bx-button` | `components` | action button (`primary`, `secondary`, `danger`, `ghost`), `size` `md` or compact `sm` (24 px target, for dense rows), emits `pressed` |
| `bx-input` | `components` | single-line text input bound with `[(value)]`, `[formField]` or a reactive form control; sets `aria-invalid` when `invalid`; emits `touch` on blur |
| `bx-select` | `components` | native select over `SelectOption[]`, bound like `bx-input`; emits `touch` on blur |
| `bx-toggle` | `components` | accessible binary switch (`role="switch"`) bound with `[(checked)]`, `[formField]` or a reactive form control; emits `touch` on blur |
| `bx-tag` | `components` | bordered chip for metadata or filters; `removable` adds an accessible remove button emitting `removed` |
| `bx-card` | `components` | a raised panel; `heading` adds a header row (an `h2` to `h6` by `headingLevel`, a meta slot for `[bx-card-meta]` content) and names the region by it; without a heading, `label` names the region |
| `bx-stat` | `components` | a stat tile: `label`, `value` (text; the project formats numbers) and optional `detail`, as a group named by its label; lay several out with `bx-grid` |
| `bx-icon` | `components` | an inline SVG icon from the set in `currentColor`; decorative unless given a `label` (then `role="img"` with that name); an unknown name draws nothing |
| `bx-badge` | `components` | a short label on a tone (`accent`, `ok`, `warn`, `danger`, `info`, `neutral`); `appearance` `solid`, `outline` (tone as border and text, a vote chip) or `dashed` (a provisional or shadow state; the text says so too); `live` gives it `role="status"` |
| `bx-meter` | `components` | a bar for `value` between `min` and `max` (`role="meter"`, needs a `label`, `valueText` for words), an optional `threshold` mark and a tone; show the number in text beside it |
| `bx-disclosure` | `components` | a native `details` with a `summary` line; `[(open)]`; keyboard and expanded state from the browser |
| `bx-alert` | `components` | an inline note or error with a toned border and tint, a decorative icon and a `[bx-alert-actions]` slot; `announce` `none` (`role="note"`), `polite` (`status`) or `assertive` (`alert`) |
| `bx-timeline`, `bx-timeline-item` | `components` | a vertical timeline: a list (`label` names it) of items, each a `time` (`datetime` for machines), a `[bx-timeline-meta]` slot (a badge, a version), the body, a muted `detail` and a `[bx-timeline-actions]` slot; the marker's `tone` is a hint, the text says the kind; the project orders the rows and shows its own empty text |
| `bx-avatar`, `bx-avatar-stack` | `components` | an avatar: the image at `src`, or the initials of `name` when there is none or it fails to load; named by `name`, or `decorative` when the name is written beside it; `pixelated` for pixel-art sprites; `size` `sm` 20 px or `md` 32 px. `bx-avatar-stack` is a row of avatars named as a group by `label` |
| `bx-message-log`, `bx-message` | `components` | a scrolling, focusable message log (`role="log"`, polite, named by `label`) that keeps the newest message in view while the reader is at the end (`follow`); each `bx-message` has a `[bx-message-avatar]` slot, a `time`, the sender `who`, a muted `context`, the body, `own` (accent tint) and a `tone` side bar (a hint; the text says what happened) |
| `bx-composer` | `components` | a message field with a visually hidden `label`, `[bx-composer-avatar]` and `[bx-composer-actions]` slots and a send button (`sendLabel`); `[(value)]`; emits `send` with the trimmed text and clears; with `commands`, `/` opens a slash-command menu (WAI-ARIA combobox, list autocomplete: ArrowDown and ArrowUp, Enter picks, Escape closes) and emits `commandPick` |
| `bx-listbox` | `components` | the popup of a combobox: options (`ListboxOption`) with an `active` index the input points at with `aria-activedescendant`, `handleKey` for the input's keys, `pick` on Enter or click; focus stays in the input |
| `bx-chart-frame`, `bx-line-chart` | `components` | plain-SVG line chart (`bx-line-chart`) on the shared chart frame (`bx-chart-frame`): one or more series over a number or UTC-time axis, optional target bands and markers, non-colour dashes and point shapes, roving keyboard focus on points (`pointSelect`), SVG `<title>`/`<desc>`, and a `bx-disclosure` data-table fallback |
| `bx-bar-chart`, `bx-stacked-bar-chart`, `bx-donut-chart` | `components` | on the same frame: a bar chart (one series, vertical or horizontal, from zero, a value label on every bar, `barSelect`); a stacked bar chart (several series per category, a total per bar, each series a colour and a fill pattern in bars and legend, `segmentSelect`); a donut (shares with percentages, a centre total, at most `maxSlices` slices with the smallest grouped into an Other slice, colour and pattern per slice, `sliceSelect`); each with roving keyboard focus, SVG `<title>`/`<desc>` and the data table |
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
