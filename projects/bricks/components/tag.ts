import { Component, input, output } from '@angular/core';

/** Bordered metadata or filter chip, optionally removable via an accessible button. */
@Component({
  selector: 'bx-tag',
  template: `
    <span class="tag">
      <span class="text"><ng-content /></span>
      @if (removable()) {
        <button
          type="button"
          class="remove"
          [disabled]="disabled()"
          [attr.aria-label]="removeLabel()"
          (click)="onRemove()"
        >
          <span aria-hidden="true">×</span>
        </button>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    .tag {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--bx-space-1);
      min-block-size: 26px;
      padding: 2px var(--bx-space-2);
      border: var(--bx-line-width) solid var(--bx-tag-border);
      border-radius: var(--bx-tag-radius);
      background: var(--bx-tag-bg);
      color: var(--bx-tag-fg);
      font-size: var(--bx-font-size-sm);
      line-height: var(--bx-line-height-tight);
    }
    .remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: 24px;
      min-block-size: 24px;
      margin-inline-end: calc(-1 * var(--bx-space-1));
      padding: 0;
      border: none;
      border-radius: var(--bx-tag-radius);
      background: none;
      color: var(--bx-text-muted);
      font: inherit;
      font-size: var(--bx-font-size-md);
      line-height: 1;
      cursor: pointer;
    }
    .remove:hover {
      color: var(--bx-text);
    }
    .remove:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class BxTag {
  readonly removable = input(false);
  readonly removeLabel = input<string>('Remove');
  readonly disabled = input(false);
  readonly removed = output<void>();

  protected onRemove(): void {
    if (!this.disabled()) {
      this.removed.emit();
    }
  }
}
