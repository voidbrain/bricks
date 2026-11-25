import { THEMES, THEME_ATTRIBUTE, applyTheme, isThemeName } from './themes';

describe('themes', () => {
  it('ships base, plain and eva', () => {
    expect([...THEMES]).toEqual(['base', 'plain', 'eva']);
  });

  it('recognises only known theme names', () => {
    expect(isThemeName('eva')).toBe(true);
    expect(isThemeName('Eva')).toBe(false);
    expect(isThemeName(undefined)).toBe(false);
  });

  it('sets the theme attribute and falls back to base for an unknown name', () => {
    const el = document.createElement('div');
    expect(applyTheme(el, 'plain')).toBe('plain');
    expect(el.getAttribute(THEME_ATTRIBUTE)).toBe('plain');
    expect(applyTheme(el, 'neon')).toBe('base');
    expect(el.getAttribute(THEME_ATTRIBUTE)).toBe('base');
  });
});
