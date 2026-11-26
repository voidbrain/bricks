import {
  ACCENTS,
  ACCENT_ATTRIBUTE,
  MODES,
  MODE_ATTRIBUTE,
  THEMES,
  THEME_ATTRIBUTE,
  THEME_COMBINATIONS,
  VARIANT_THEMES,
  applyTheme,
  applyThemeChoice,
  isThemeName,
  themeChoice,
} from './themes';

describe('themes', () => {
  it('ships base, plain, eva and simple; simple and eva take a mode and an accent', () => {
    expect([...THEMES]).toEqual(['base', 'plain', 'eva', 'simple']);
    expect([...VARIANT_THEMES]).toEqual(['simple', 'eva']);
    expect([...MODES]).toEqual(['dark', 'light']);
    expect([...ACCENTS]).toEqual(['orange', 'blue', 'green', 'violet', 'ochre']);
  });

  it('lists all 20 variant combinations once (NERV Theme · Mode · Accent)', () => {
    expect(THEME_COMBINATIONS.length).toBe(20);
    const keys = THEME_COMBINATIONS.map((c) => `${c.theme}·${c.mode}·${c.accent}`);
    expect(new Set(keys).size).toBe(20);
    expect(keys).toContain('simple·dark·orange');
    expect(keys).toContain('eva·light·ochre');
  });

  it('recognises only known theme names', () => {
    expect(isThemeName('eva')).toBe(true);
    expect(isThemeName('simple')).toBe(true);
    expect(isThemeName('Eva')).toBe(false);
    expect(isThemeName(undefined)).toBe(false);
  });

  it('checks a stored choice part by part', () => {
    expect(themeChoice(null)).toEqual({ theme: 'base' });
    expect(themeChoice({ theme: 'eva', mode: 'light', accent: 'violet' })).toEqual({
      theme: 'eva',
      mode: 'light',
      accent: 'violet',
    });
    expect(themeChoice({ theme: 'simple', mode: 'dim', accent: 'toString' })).toEqual({
      theme: 'simple',
      mode: 'dark',
      accent: 'orange',
    });
    expect(themeChoice({ theme: 'plain', mode: 'light', accent: 'green' })).toEqual({
      theme: 'plain',
    });
    expect(themeChoice({ theme: 'neon' })).toEqual({ theme: 'base' });
  });

  it('sets the theme attribute and falls back to base for an unknown name', () => {
    const el = document.createElement('div');
    expect(applyTheme(el, 'plain')).toBe('plain');
    expect(el.getAttribute(THEME_ATTRIBUTE)).toBe('plain');
    expect(applyTheme(el, 'neon')).toBe('base');
    expect(el.getAttribute(THEME_ATTRIBUTE)).toBe('base');
  });

  it('puts theme, mode and accent on one element and clears them for a single palette', () => {
    const el = document.createElement('div');
    expect(applyThemeChoice(el, { theme: 'eva', mode: 'light', accent: 'green' })).toEqual({
      theme: 'eva',
      mode: 'light',
      accent: 'green',
    });
    expect(el.getAttribute(THEME_ATTRIBUTE)).toBe('eva');
    expect(el.getAttribute(MODE_ATTRIBUTE)).toBe('light');
    expect(el.getAttribute(ACCENT_ATTRIBUTE)).toBe('green');
    applyTheme(el, 'simple');
    expect(el.getAttribute(MODE_ATTRIBUTE)).toBe('dark');
    expect(el.getAttribute(ACCENT_ATTRIBUTE)).toBe('orange');
    applyTheme(el, 'base');
    expect(el.hasAttribute(MODE_ATTRIBUTE)).toBe(false);
    expect(el.hasAttribute(ACCENT_ATTRIBUTE)).toBe(false);
  });
});
