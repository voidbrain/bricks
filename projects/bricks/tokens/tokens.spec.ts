import { COMPONENT_TOKENS, SEMANTIC_TOKENS, cssVar } from './tokens';

describe('tokens', () => {
  it('names every token once, with the bricks prefix', () => {
    const all = [...SEMANTIC_TOKENS, ...COMPONENT_TOKENS];
    expect(new Set(all).size).toBe(all.length);
    for (const token of all) expect(token).toMatch(/^--bx-[a-z0-9-]+$/);
  });

  it('wraps a token in var()', () => {
    expect(cssVar('--bx-accent')).toBe('var(--bx-accent)');
  });
});
