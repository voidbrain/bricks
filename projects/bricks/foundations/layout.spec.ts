import {
  BREAKPOINTS,
  LAYOUT_CLASSES,
  SAFE_AREA_TOKENS,
  gapClass,
  minWidth,
} from './layout';

describe('layout foundations', () => {
  it('names the breakpoints in ascending order, phone first', () => {
    const widths = Object.values(BREAKPOINTS);
    expect(Object.keys(BREAKPOINTS)).toEqual(['sm', 'md', 'lg']);
    expect([...widths].sort((a: number, b: number) => a - b)).toEqual(widths);
    expect(widths[0]).toBeGreaterThan(320);
  });

  it('builds a min-width media query from a breakpoint name', () => {
    expect(minWidth('md')).toBe(`(min-width: ${BREAKPOINTS.md}px)`);
  });

  it('names the layout classes with the bricks prefix', () => {
    expect([...LAYOUT_CLASSES]).toEqual(['bx-stack', 'bx-cluster', 'bx-grid', 'bx-columns', 'bx-safe-area']);
  });

  it('maps a spacing step to a gap class', () => {
    expect(gapClass(4)).toBe('bx-gap-4');
  });

  it('names one safe-area token per side', () => {
    expect([...SAFE_AREA_TOKENS]).toEqual([
      '--bx-safe-top',
      '--bx-safe-right',
      '--bx-safe-bottom',
      '--bx-safe-left',
    ]);
  });
});
