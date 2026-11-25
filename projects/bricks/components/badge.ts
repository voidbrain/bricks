import { Component, input } from '@angular/core';

export const BADGE_TONES = ['accent', 'ok', 'warn', 'danger', 'info'] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

/** A short label on a tone colour. Set `live` when its text changes and a screen reader should hear it. */
@Component({
  selector: 'bx-badge',
  host: { '[attr.data-tone]': 'tone()' },
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
    .badge {
      display: inline-block;
      padding: var(--bx-badge-padding);
      border-radius: var(--bx-badge-radius);
      background: var(--tone);
      color: var(--on-tone);
      font-size: var(--bx-badge-font-size);
      font-weight: var(--bx-font-weight-bold);
      letter-spacing: 0.5px;
    }
  `,
})
export class BxBadge {
  readonly tone = input<BadgeTone>('accent');
  readonly live = input(false);
}
