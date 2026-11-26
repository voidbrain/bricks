/**
 * The semantic tokens every theme defines (styles/themes/*.css). Components read these and the component tokens,
 * never a literal colour. The catalogue's browser test checks each theme defines all of them.
 */
export const SEMANTIC_TOKENS = [
  '--bx-surface',
  '--bx-surface-raised',
  '--bx-surface-sunken',
  '--bx-border',
  '--bx-text',
  '--bx-text-muted',
  '--bx-accent',
  '--bx-on-accent',
  '--bx-focus',
  '--bx-ok',
  '--bx-warn',
  '--bx-danger',
  '--bx-info',
  '--bx-on-status',
  '--bx-font',
  '--bx-radius',
  '--bx-radius-badge',
] as const;
export type SemanticToken = (typeof SEMANTIC_TOKENS)[number];

/** Component tokens (styles/tokens.css): one component's slots, each defined from semantic tokens. */
export const COMPONENT_TOKENS = [
  '--bx-card-bg',
  '--bx-card-fg',
  '--bx-card-border',
  '--bx-card-radius',
  '--bx-card-padding',
  '--bx-card-gap',
  '--bx-card-title',
  '--bx-card-header-bg',
  '--bx-card-header-fg',
  '--bx-card-header-padding',
  '--bx-card-glow',
  '--bx-stat-bg',
  '--bx-stat-fg',
  '--bx-stat-muted',
  '--bx-stat-border',
  '--bx-stat-radius',
  '--bx-stat-padding',
  '--bx-badge-radius',
  '--bx-badge-font-size',
  '--bx-badge-padding',
  '--bx-control-bg',
  '--bx-control-fg',
  '--bx-control-border',
  '--bx-control-radius',
  '--bx-control-padding',
  '--bx-control-padding-sm',
  '--bx-badge-outline-bg',
  '--bx-meter-height',
  '--bx-meter-track',
  '--bx-meter-border',
  '--bx-meter-radius',
  '--bx-meter-mark',
  '--bx-disclosure-fg',
  '--bx-disclosure-indent',
  '--bx-alert-fg',
  '--bx-alert-padding',
  '--bx-alert-radius',
  '--bx-alert-tint',
  '--bx-tag-bg',
  '--bx-tag-fg',
  '--bx-tag-border',
  '--bx-tag-radius',
  '--bx-icon-size',
  '--bx-icon-stroke',
] as const;
export type ComponentToken = (typeof COMPONENT_TOKENS)[number];

/** `var(--bx-…)` for a known token, so code never spells a token by hand. */
export function cssVar(token: SemanticToken | ComponentToken): string {
  return `var(${token})`;
}
