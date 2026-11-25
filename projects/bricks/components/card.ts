import { Component, input } from '@angular/core';

/** A raised panel. Give it a `label` when it is a landmark region of its own. */
@Component({
  selector: 'bx-card',
  template: `
    <section class="card" [attr.role]="label() ? 'region' : null" [attr.aria-label]="label() || null">
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: var(--bx-card-gap);
      padding: var(--bx-card-padding);
      border: var(--bx-line-width) solid var(--bx-card-border);
      border-radius: var(--bx-card-radius);
      background: var(--bx-card-bg);
      color: var(--bx-card-fg);
    }
  `,
})
export class BxCard {
  readonly label = input<string>('');
}
