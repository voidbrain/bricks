import { Component, input, model } from '@angular/core';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

/** Native select control bound with `[(value)]`. Pair with a `<label [for]="selectId">` or `ariaLabel`. */
@Component({
  selector: 'bx-select',
  template: `
    <select
      class="select"
      [value]="value()"
      [disabled]="disabled()"
      [attr.id]="selectId() || null"
      [attr.name]="name() || null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      (change)="onChange($event)"
    >
      @for (option of options(); track option.value) {
        <option [value]="option.value" [disabled]="option.disabled ?? false" [selected]="option.value === value()">
          {{ option.label }}
        </option>
      }
    </select>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
      max-inline-size: 100%;
    }
    .select {
      box-sizing: border-box;
      inline-size: 100%;
      max-inline-size: 100%;
      min-block-size: 36px;
      padding: var(--bx-control-padding);
      border: var(--bx-line-width) solid var(--bx-control-border);
      border-radius: var(--bx-control-radius);
      background: var(--bx-control-bg);
      color: var(--bx-control-fg);
      font: inherit;
      font-size: var(--bx-font-size-md);
      line-height: var(--bx-line-height-tight);
      cursor: pointer;
    }
    .select[aria-invalid='true'] {
      border-color: var(--bx-danger);
    }
    .select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class BxSelect {
  readonly options = input.required<readonly SelectOption[]>();
  readonly value = model<string>('');
  readonly selectId = input<string>('');
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly disabled = input(false);
  readonly invalid = input(false);

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
