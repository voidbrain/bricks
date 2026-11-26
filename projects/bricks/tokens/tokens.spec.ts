import { COMPONENT_TOKENS, SEMANTIC_TOKENS, cssVar } from './tokens';

describe('tokens', () => {
  it('names every token once, with the bricks prefix', () => {
    const all = [...SEMANTIC_TOKENS, ...COMPONENT_TOKENS];
    expect(new Set(all).size).toBe(all.length);
    for (const token of all) expect(token).toMatch(/^--bx-[a-z0-9-]+$/);
  });

  it('has brand and series colours as semantic tokens, set by every theme', () => {
    expect(SEMANTIC_TOKENS).toEqual(
      expect.arrayContaining([
        '--bx-brand-bg',
        '--bx-brand-fg',
        '--bx-series-green',
        '--bx-series-orange',
        '--bx-series-blue',
      ]),
    );
  });

  it('wraps a token in var()', () => {
    expect(cssVar('--bx-accent')).toBe('var(--bx-accent)');
  });
});
