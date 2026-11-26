import { Component, input, model } from '@angular/core';
import { BxIcon } from './icon';

/**
 * A disclosure: a native `<details>` with a `summary` line and projected content. The browser gives it keyboard
 * operation (Enter and Space on the summary) and announces expanded or collapsed. `open` binds two-way, and the
 * open state survives a re-render of the content (a live view patching what is inside).
 */
@Component({
  selector: 'bx-disclosure',
  imports: [BxIcon],
  template: `
    <details class="disclosure" [open]="open()" (toggle)="onToggle($event)">
      <summary class="summary">
        <bx-icon class="chevron" name="chevron-right" />
        <span class="text">{{ summary() }}</span>
      </summary>
      <div class="content"><ng-content /></div>
    </details>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }
    .summary {
      display: flex;
      align-items: center;
      gap: var(--bx-space-1);
      min-block-size: 24px;
      cursor: pointer;
      list-style: none;
      color: var(--bx-disclosure-fg);
      font-weight: var(--bx-font-weight-medium);
    }
    .summary::-webkit-details-marker {
      display: none;
    }
    .chevron {
      transition: transform var(--bx-duration-fast) var(--bx-easing-standard);
    }
    details[open] > .summary .chevron {
      transform: rotate(90deg);
    }
    .content {
      padding-block-start: var(--bx-space-2);
      padding-inline-start: var(--bx-disclosure-indent);
    }
  `,
})
export class BxDisclosure {
  readonly summary = input.required<string>();
  readonly open = model(false);

  protected onToggle(event: Event): void {
    const now = (event.target as HTMLDetailsElement).open;
    if (now !== this.open()) this.open.set(now);
  }
}
