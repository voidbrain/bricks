import { SPACE_STEPS, TYPE_STEPS, fontSize, space } from './foundations';

describe('foundations', () => {
  it('names spacing and type steps as primitive tokens', () => {
    expect(SPACE_STEPS.map(space)).toContain('var(--bx-space-4)');
    expect(TYPE_STEPS.map(fontSize)).toContain('var(--bx-font-size-md)');
  });
});
