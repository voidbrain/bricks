import { Component, input, output } from '@angular/core';

export const BUTTON_VARIANTS = ['primary', 'secondary', 'danger', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonType = 'button' | 'submit' | 'reset';
export const BUTTON_SIZES = ['md', 'sm'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

/** Action button on semantic and component tokens, in two sizes (`md`, compact `sm`). */
@Component({
  selector: 'bx-button',
  template: `
    <button
      class="button"
      [type]="type()"
      [disabled]="disabled()"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [attr.aria-label]="ariaLabel() || null"
      (click)="onClick($event)"
    >
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--bx-space-2);
      min-inline-size: 24px;
      min-block-size: 36px;
      padding: var(--bx-control-padding);
      border: var(--bx-line-width) solid var(--bx-control-border);
      border-radius: var(--bx-control-radius);
      background: var(--bx-surface-raised);
      color: var(--bx-text);
      font: inherit;
      font-size: var(--bx-font-size-md);
      font-weight: var(--bx-font-weight-medium);
      line-height: var(--bx-line-height-tight);
      cursor: pointer;
      transition: opacity var(--bx-duration-fast) var(--bx-easing-standard);
    }
    .button[data-size='sm'] {
      gap: var(--bx-space-1);
      min-block-size: 24px;
      padding: var(--bx-control-padding-sm);
      font-size: var(--bx-font-size-sm);
    }
    .button[data-variant='primary'] {
      background: var(--bx-accent);
      border-color: var(--bx-accent);
      color: var(--bx-on-accent);
    }
    .button[data-variant='danger'] {
      background: var(--bx-danger);
      border-color: var(--bx-danger);
      color: var(--bx-on-status);
    }
    .button[data-variant='ghost'] {
      background: none;
      border-color: var(--bx-border);
      color: var(--bx-text);
    }
    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class BxButton {
  readonly variant = input<ButtonVariant>('secondary');
  readonly type = input<ButtonType>('button');
  /** `sm` is the compact size for dense rows and table cells; it keeps a 24 px target. */
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly ariaLabel = input<string>('');
  readonly pressed = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.pressed.emit(event);
    }
  }
}
