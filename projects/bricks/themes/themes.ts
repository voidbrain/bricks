/** The themes bricks ships (styles/themes/<name>.css). Projects restyle by theme, never by overriding a component. */
export const THEMES = ['base', 'plain', 'eva'] as const;
export type ThemeName = (typeof THEMES)[number];

/** The attribute a theme's CSS is scoped to: `<body data-bx-theme="eva">`. */
export const THEME_ATTRIBUTE = 'data-bx-theme';

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Applies a theme to an element (the document root by default); an unknown name falls back to `base`. */
export function applyTheme(element: Element, theme: unknown): ThemeName {
  const name = isThemeName(theme) ? theme : 'base';
  element.setAttribute(THEME_ATTRIBUTE, name);
  return name;
}
