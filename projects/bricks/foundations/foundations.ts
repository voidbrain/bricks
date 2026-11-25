/** Foundation scales (styles/tokens.css, primitive layer), named so the catalogue and projects can list them. */
export const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8] as const;
export const TYPE_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

/** `var(--bx-space-n)` for a spacing step on the 4 px grid. */
export function space(step: (typeof SPACE_STEPS)[number]): string {
  return `var(--bx-space-${step})`;
}

/** `var(--bx-font-size-x)` for a type step. */
export function fontSize(step: (typeof TYPE_STEPS)[number]): string {
  return `var(--bx-font-size-${step})`;
}
