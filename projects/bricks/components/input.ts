import { Component, input, model } from '@angular/core';

export const INPUT_TYPES = ['text', 'search', 'email', 'url', 'tel', 'password', 'number'] as const;
export type InputType = (typeof INPUT_TYPES)[number];

/** Single-line text control bound with `[(value)]`. Pair with a `<label [for]="inputId">` or `ariaLabel`. */
@Component({
  selector: 'bx-input',
  template: `
    <input
      class="input"
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [readOnly]="readonly()"
      [attr.id]="inputId() || null"
      [attr.name]="name() || null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-describedby]="ariaDescribedBy() || null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      (input)="onInput($event)"
    />
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
      max-inline-size: 100%;
    }
    .input {
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
    }
    .input::placeholder {
      color: var(--bx-text-muted);
      opacity: 1;
    }
    .input[aria-invalid='true'] {
      border-color: var(--bx-danger);
    }
    .input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class BxInput {
  readonly value = model<string>('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly inputId = input<string>('');
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
