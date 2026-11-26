import { Component, computed, input } from '@angular/core';
import type { IconName } from '@voidbrain/bricks/foundations';
import { BxIcon } from './icon';

export const ALERT_TONES = ['info', 'ok', 'warn', 'danger'] as const;
export type AlertTone = (typeof ALERT_TONES)[number];

/** How an alert reaches a screen reader: a note read in place, a polite status, or an assertive alert. */
export const ALERT_ANNOUNCE = ['none', 'polite', 'assertive'] as const;
export type AlertAnnounce = (typeof ALERT_ANNOUNCE)[number];

const ROLE: Record<AlertAnnounce, string> = { none: 'note', polite: 'status', assertive: 'alert' };
const ICON: Record<AlertTone, IconName> = {
  info: 'info',
  ok: 'check',
  warn: 'warning',
  danger: 'error',
};

/**
 * An inline alert for a note or an error in the page flow (not a surface, not a toast): a toned border and tint, a
 * decorative icon, the message, and an optional `[bx-alert-actions]` slot. `announce` picks its role: `none` a
 * note, `polite` a status, `assertive` an alert (an error the person must hear now). The tone is never the only
 * cue: the message says what happened.
 */
@Component({
  selector: 'bx-alert',
  imports: [BxIcon],
  host: { '[attr.role]': 'role()', '[attr.data-tone]': 'tone()' },
  template: `
    <bx-icon class="icon" [name]="icon()" />
    <div class="message"><ng-content /></div>
    <div class="actions"><ng-content select="[bx-alert-actions]" /></div>
  `,
  styles: `
    :host {
      --tone: var(--bx-info);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-space-2);
      min-inline-size: 0;
      padding: var(--bx-alert-padding);
      border: var(--bx-line-width) solid var(--tone);
      border-radius: var(--bx-alert-radius);
      background: color-mix(in srgb, var(--tone) var(--bx-alert-tint), var(--bx-surface-raised));
      color: var(--bx-alert-fg);
      font-size: var(--bx-font-size-sm);
    }
    :host([data-tone='ok']) {
      --tone: var(--bx-ok);
    }
    :host([data-tone='warn']) {
      --tone: var(--bx-warn);
    }
    :host([data-tone='danger']) {
      --tone: var(--bx-danger);
    }
    .icon {
      color: var(--tone);
    }
    .message {
      flex: 1 1 12rem;
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-2);
    }
    .actions:empty {
      display: none;
    }
  `,
})
export class BxAlert {
  readonly tone = input<AlertTone>('info');
  readonly announce = input<AlertAnnounce>('none');

  protected readonly role = computed(() => ROLE[this.announce()] ?? 'note');
  protected readonly icon = computed(() => ICON[this.tone()] ?? 'info');
}
