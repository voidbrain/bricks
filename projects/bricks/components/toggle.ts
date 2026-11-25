import { Component, input, model, output } from '@angular/core';

/** Accessible binary switch (`role="switch"`) bound with `[(checked)]`, `[formField]` or a reactive form control. */
@Component({
  selector: 'bx-toggle',
  template: `
    <button
      type="button"
      role="switch"
      class="toggle"
      [disabled]="disabled()"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      (click)="flip()"
      (blur)="touch.emit()"
    >
      <span class="track" aria-hidden="true"><span class="thumb"></span></span>
      <span class="label"><ng-content /></span>
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
      max-inline-size: 100%;
    }
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--bx-space-2);
      min-inline-size: 24px;
      min-block-size: 32px;
      padding: var(--bx-space-1) 0;
      border: none;
      border-radius: var(--bx-control-radius);
      background: none;
      color: var(--bx-text);
      font: inherit;
      font-size: var(--bx-font-size-md);
      line-height: var(--bx-line-height-tight);
      cursor: pointer;
      text-align: start;
    }
    .track {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      inline-size: 40px;
      block-size: 22px;
      padding: 2px;
      border: var(--bx-line-width) solid var(--bx-control-border);
      border-radius: var(--bx-control-radius);
      background: var(--bx-control-bg);
      transition: background var(--bx-duration-fast) var(--bx-easing-standard);
    }
    .thumb {
      inline-size: 16px;
      block-size: 16px;
      border-radius: var(--bx-control-radius);
      background: var(--bx-text);
      transition: transform var(--bx-duration-fast) var(--bx-easing-standard);
    }
    .toggle[aria-checked='true'] .track {
      background: var(--bx-accent);
      border-color: var(--bx-accent);
    }
    .toggle[aria-checked='true'] .thumb {
      background: var(--bx-on-accent);
      transform: translateX(18px);
    }
    .toggle:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class BxToggle {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly ariaLabel = input<string>('');
  /** Emitted on blur; Angular forms mark the bound field touched. */
  readonly touch = output<void>();

  protected flip(): void {
    if (!this.disabled()) {
      this.checked.update((on) => !on);
    }
  }
}
