import { PATTERNS } from './patterns';

describe('patterns', () => {
  it('is an entry point with no pattern yet (added on demand, F-003)', () => {
    expect(PATTERNS).toEqual([]);
  });
});
