/**
 * The themes bricks ships (styles/themes/<name>.css). Projects restyle by theme, never by overriding a component.
 * `base` and `plain` are single palettes; `simple` and `eva` also take a mode and an accent (NERV's Theme · Mode ·
 * Accent selector, F-006-T02).
 */
export const THEMES = ['base', 'plain', 'eva', 'simple'] as const;
export type ThemeName = (typeof THEMES)[number];

/** The themes that take a mode and an accent. */
export const VARIANT_THEMES = ['simple', 'eva'] as const;
export type VariantTheme = (typeof VARIANT_THEMES)[number];

export const MODES = ['dark', 'light'] as const;
export type Mode = (typeof MODES)[number];

export const ACCENTS = ['orange', 'blue', 'green', 'violet', 'ochre'] as const;
export type Accent = (typeof ACCENTS)[number];

/** The attribute a theme's CSS is scoped to: `<body data-bx-theme="eva">`. */
export const THEME_ATTRIBUTE = 'data-bx-theme';
/** Mode and accent attributes: they take effect only on the element that carries `data-bx-theme`. */
export const MODE_ATTRIBUTE = 'data-bx-mode';
export const ACCENT_ATTRIBUTE = 'data-bx-accent';

/** A theme with its mode and accent; `mode` and `accent` are set only for a variant theme. */
export interface ThemeChoice {
  theme: ThemeName;
  mode?: Mode;
  accent?: Accent;
}

/** A variant theme with no mode or accent attribute is dark and orange (NERV's defaults). */
export const VARIANT_DEFAULTS: Readonly<Record<VariantTheme, { mode: Mode; accent: Accent }>> = {
  simple: { mode: 'dark', accent: 'orange' },
  eva: { mode: 'dark', accent: 'orange' },
};

/** Every variant combination: 2 themes × 2 modes × 5 accents = 20 (the catalogue and the browser suite check each). */
export const THEME_COMBINATIONS: readonly Required<ThemeChoice>[] = VARIANT_THEMES.flatMap(
  (theme) => MODES.flatMap((mode) => ACCENTS.map((accent) => ({ theme, mode, accent }))),
);

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isVariantTheme(value: unknown): value is VariantTheme {
  return typeof value === 'string' && (VARIANT_THEMES as readonly string[]).includes(value);
}

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

export function isAccent(value: unknown): value is Accent {
  return typeof value === 'string' && (ACCENTS as readonly string[]).includes(value);
}

/**
 * A stored or typed choice, each part checked: an unknown theme falls back to `base`, an unknown mode or accent to
 * the variant theme's default. A single palette (`base`, `plain`) keeps no mode or accent.
 */
export function themeChoice(value: unknown): ThemeChoice {
  const v = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const theme = isThemeName(v['theme']) ? v['theme'] : 'base';
  if (!isVariantTheme(theme)) return { theme };
  const defaults = VARIANT_DEFAULTS[theme];
  return {
    theme,
    mode: isMode(v['mode']) ? v['mode'] : defaults.mode,
    accent: isAccent(v['accent']) ? v['accent'] : defaults.accent,
  };
}

/**
 * Applies a theme, mode and accent to one element (all three attributes on it, so the theme's tokens resolve with
 * them) and returns the checked choice. A single palette removes the mode and accent attributes.
 */
export function applyThemeChoice(element: Element, value: unknown): ThemeChoice {
  const choice = themeChoice(value);
  element.setAttribute(THEME_ATTRIBUTE, choice.theme);
  if (choice.mode) element.setAttribute(MODE_ATTRIBUTE, choice.mode);
  else element.removeAttribute(MODE_ATTRIBUTE);
  if (choice.accent) element.setAttribute(ACCENT_ATTRIBUTE, choice.accent);
  else element.removeAttribute(ACCENT_ATTRIBUTE);
  return choice;
}

/** Applies a theme to an element with its default mode and accent; an unknown name falls back to `base`. */
export function applyTheme(element: Element, theme: unknown): ThemeName {
  return applyThemeChoice(element, { theme }).theme;
}
