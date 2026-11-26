import { Component, input } from '@angular/core';

let nextStatId = 0;

/**
 * A stat tile: a label, a value and an optional detail line. It is a group named by its label, so a screen reader
 * hears "label, value, detail" together. Values come in as text: the project formats numbers and units.
 */
@Component({
  selector: 'bx-stat',
  host: { role: 'group', '[attr.aria-labelledby]': 'labelId' },
  template: `
    <span class="label" [id]="labelId">{{ label() }}</span>
    <strong class="value">{{ value() }}</strong>
    @if (detail()) {
      <span class="detail">{{ detail() }}</span>
    }
  `,
  styles: `
    :host {
      display: grid;
      align-content: start;
      gap: 2px;
      min-inline-size: 0;
      padding: var(--bx-stat-padding);
      border: var(--bx-line-width) solid var(--bx-stat-border);
      border-radius: var(--bx-stat-radius);
      background: var(--bx-stat-bg);
      color: var(--bx-stat-fg);
    }
    .label,
    .detail {
      color: var(--bx-stat-muted);
      font-size: var(--bx-font-size-sm);
      line-height: var(--bx-line-height-tight);
      overflow-wrap: anywhere;
    }
    .value {
      font-size: var(--bx-font-size-xl);
      font-weight: var(--bx-font-weight-bold);
      line-height: var(--bx-line-height-tight);
      overflow-wrap: anywhere;
    }
  `,
})
export class BxStat {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly detail = input<string>('');

  protected readonly labelId = `bx-stat-label-${nextStatId++}`;
}
