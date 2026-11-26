import { SPACE_STEPS } from './foundations';

/**
 * Breakpoints in CSS pixels, phone first: layouts start as one column and widen at each `min-width`.
 * CSS custom properties cannot be used in a media query, so styles/foundations.css repeats these numbers;
 * the browser suite checks `.bx-columns` switches at `md`.
 */
export const BREAKPOINTS = { sm: 480, md: 768, lg: 1024 } as const;
export type Breakpoint = keyof typeof BREAKPOINTS;

/** `(min-width: Npx)` for a breakpoint, for `matchMedia` or a component's own media query. */
export function minWidth(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}

/**
 * Layout classes (styles/foundations.css), usable inside any themed root:
 * - `bx-stack`: children in a column, a spacing gap between them;
 * - `bx-cluster`: children in a wrapping row (buttons, badges, tags);
 * - `bx-grid`: as many equal columns as fit `--bx-grid-min`, one column on a phone;
 * - `bx-columns`: one column below `md`, `--bx-columns` columns from `md` up; add `bx-columns-phone` to keep
 *   `--bx-columns` (default 2) on a phone too, for short paired fields;
 * - `bx-safe-area`: padding that keeps content clear of a phone's notch and home indicator (at least
 *   `--bx-safe-min`); the page needs `viewport-fit=cover` in its viewport meta.
 */
export const LAYOUT_CLASSES = [
  'bx-stack',
  'bx-cluster',
  'bx-grid',
  'bx-columns',
  'bx-columns-phone',
  'bx-safe-area',
] as const;
export type LayoutClass = (typeof LAYOUT_CLASSES)[number];

/** `bx-gap-n`: sets a layout's gap to spacing step n (`--bx-space-n`). */
export function gapClass(step: (typeof SPACE_STEPS)[number]): string {
  return `bx-gap-${step}`;
}

/** Safe-area insets (styles/tokens.css), `env(safe-area-inset-*)` with a 0 px fallback off phones. */
export const SAFE_AREA_TOKENS = [
  '--bx-safe-top',
  '--bx-safe-right',
  '--bx-safe-bottom',
  '--bx-safe-left',
] as const;

/** Visually hidden but read by screen readers (styles/foundations.css). */
export const SR_ONLY_CLASS = 'bx-sr-only';
