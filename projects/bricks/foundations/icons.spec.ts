import { ICONS, ICON_NAMES, ICON_VIEWBOX, iconPaths, isIconName } from './icons';

describe('icon foundations', () => {
  it('ships a small set, each drawn on the same 24 px box', () => {
    expect(ICON_VIEWBOX).toBe('0 0 24 24');
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(10);
    expect(ICON_NAMES.length).toBeLessThanOrEqual(24);
    expect(Object.keys(ICONS).sort()).toEqual([...ICON_NAMES].sort());
  });

  it('draws every icon with path data only: no colour, no markup, no remote reference', () => {
    for (const name of ICON_NAMES) {
      const paths = iconPaths(name);
      expect(paths.length).toBeGreaterThan(0);
      for (const d of paths) expect(d).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/);
    }
  });

  it('recognises only known icon names', () => {
    expect(isIconName('check')).toBe(true);
    expect(isIconName('Check')).toBe(false);
    expect(isIconName('constructor')).toBe(false);
    expect(isIconName(undefined)).toBe(false);
  });
});
