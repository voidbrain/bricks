import { Component, computed, input, numberAttribute } from '@angular/core';

export const METER_TONES = ['ok', 'warn', 'danger', 'info', 'accent'] as const;
export type MeterTone = (typeof METER_TONES)[number];

/**
 * A horizontal meter (`role="meter"`): a fill for `value` between `min` and `max`, and an optional `threshold` mark
 * (a budget forecast, a sync threshold). It needs a `label`; `valueText` says the value in words for a screen reader
 * (default `value of max`). The fill's tone is a hint only: show the number in text next to it.
 */
@Component({
  selector: 'bx-meter',
  host: {
    role: 'meter',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': 'min()',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-valuetext]': 'text()',
    '[attr.data-tone]': 'tone()',
  },
  template: `
    <span class="fill" [style.inline-size.%]="fill()"></span>
    @if (mark() !== null) {
      <span class="mark" [style.inset-inline-start.%]="mark()"></span>
    }
  `,
  styles: `
    :host {
      --tone: var(--bx-ok);
      position: relative;
      display: block;
      box-sizing: border-box;
      block-size: var(--bx-meter-height);
      border: var(--bx-line-width) solid var(--bx-meter-border);
      border-radius: var(--bx-meter-radius);
      background: var(--bx-meter-track);
    }
    :host([data-tone='warn']) {
      --tone: var(--bx-warn);
    }
    :host([data-tone='danger']) {
      --tone: var(--bx-danger);
    }
    :host([data-tone='info']) {
      --tone: var(--bx-info);
    }
    :host([data-tone='accent']) {
      --tone: var(--bx-accent);
    }
    .fill {
      display: block;
      block-size: 100%;
      border-radius: var(--bx-meter-radius);
      background: var(--tone);
      transition: inline-size var(--bx-duration-base) var(--bx-easing-standard);
    }
    .mark {
      position: absolute;
      inset-block: -3px;
      inline-size: 2px;
      margin-inline-start: -1px;
      background: var(--bx-meter-mark);
    }
  `,
})
export class BxMeter {
  readonly label = input.required<string>();
  readonly value = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly min = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly max = input(100, { transform: (v: unknown) => numberAttribute(v, 100) });
  /** Where the mark sits, in the same units as `value`; outside `min`–`max` (or unset) there is no mark. */
  readonly threshold = input<number | null, unknown>(null, {
    transform: (v: unknown) =>
      v === null || v === undefined || v === '' ? null : numberAttribute(v, NaN),
  });
  readonly tone = input<MeterTone>('ok');
  readonly valueText = input<string>('');

  private readonly span = computed(() => Math.max(this.max() - this.min(), 0));
  protected readonly clamped = computed(() =>
    Math.min(Math.max(this.value(), this.min()), Math.max(this.max(), this.min())),
  );
  protected readonly fill = computed(() =>
    this.span() ? ((this.clamped() - this.min()) / this.span()) * 100 : 0,
  );
  protected readonly mark = computed(() => {
    const t = this.threshold();
    if (t === null || !Number.isFinite(t) || !this.span() || t < this.min() || t > this.max())
      return null;
    return ((t - this.min()) / this.span()) * 100;
  });
  protected readonly text = computed(
    () => this.valueText() || `${this.clamped()} of ${this.max()}`,
  );
}
