/**
 * The bricks icon set: a few line icons drawn on one 24 px box with a 2 px stroke in `currentColor`, so an icon
 * takes its colour from the text around it and every theme. Path data only, rendered inline by `bx-icon`
 * (`@voidbrain/bricks/components`): no icon font, no sprite file, no CDN. Icons are added on real demand.
 */
export const ICON_VIEWBOX = '0 0 24 24';

export const ICONS = {
  check: ['M4 12l5 5L20 6'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  'chevron-up': ['M6 15l6-6 6 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'chevron-right': ['M9 6l6 6-6 6'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  search: ['M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14z', 'M20 20l-4-4'],
  info: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M12 11v5', 'M12 8h.01'],
  warning: ['M12 3L2 20h20z', 'M12 10v4', 'M12 17h.01'],
  error: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M15 9l-6 6', 'M9 9l6 6'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as readonly IconName[];

/** Whether `value` names an icon in the set (own names only, case-sensitive). */
export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && Object.hasOwn(ICONS, value);
}

/** The path data of an icon, one `d` per path. */
export function iconPaths(name: IconName): readonly string[] {
  return ICONS[name];
}
