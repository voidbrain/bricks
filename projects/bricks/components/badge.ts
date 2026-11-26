import { Component, input } from '@angular/core';

export const BADGE_TONES = ['accent', 'ok', 'warn', 'danger', 'info', 'neutral'] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];
/** `solid` fills the tone; `outline` draws it as border and text (a vote chip); `dashed` is an outline with a dashed border (a provisional or shadow state). */
export const BADGE_APPEARANCES = ['solid', 'outline', 'dashed'] as const;
export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number];

/**
 * A short label on a tone colour, filled or outlined. Set `live` when its text changes and a screen reader should
 * hear it. The text says the state (approve, reject, shadow): the tone and a dashed border are never the only cue.
 */
@Component({
  selector: 'bx-badge',
  host: { '[attr.data-tone]': 'tone()', '[attr.data-appearance]': 'appearance()' },
  template: `<span class="badge" [attr.role]="live() ? 'status' : null"><ng-content /></span>`,
  styles: `
    :host {
      display: inline-block;
      --tone: var(--bx-accent);
      --on-tone: var(--bx-on-accent);
    }
    :host([data-tone='ok']) {
      --tone: var(--bx-ok);
      --on-tone: var(--bx-on-status);
    }
    :host([data-tone='warn']) {
      --tone: var(--bx-warn);
      --on-tone: var(--bx-on-status);
    }
    :host([data-tone='danger']) {
      --tone: var(--bx-danger);
      --on-tone: var(--bx-on-status);
    }
    :host([data-tone='info']) {
      --tone: var(--bx-info);
      --on-tone: var(--bx-on-status);
    }
    :host([data-tone='neutral']) {
      --tone: var(--bx-surface-sunken);
      --on-tone: var(--bx-text);
      --outline-tone: var(--bx-text-muted);
    }
    :host([data-tone='neutral']) .badge {
      border-color: var(--bx-border);
    }
    .badge {
      display: inline-block;
      padding: var(--bx-badge-padding);
      border-radius: var(--bx-badge-radius);
      background: var(--tone);
      color: var(--on-tone);
      font-size: var(--bx-badge-font-size);
      font-weight: var(--bx-font-weight-bold);
      letter-spacing: 0.5px;
      border: var(--bx-line-width) solid transparent;
    }
    :host([data-appearance='outline']) .badge,
    :host([data-appearance='dashed']) .badge {
      background: var(--bx-badge-outline-bg);
      border-color: var(--outline-tone, var(--tone));
      color: var(--outline-tone, var(--tone));
    }
    :host([data-appearance='dashed']) .badge {
      border-style: dashed;
    }
  `,
})
export class BxBadge {
  readonly tone = input<BadgeTone>('accent');
  readonly appearance = input<BadgeAppearance>('solid');
  readonly live = input(false);
}
