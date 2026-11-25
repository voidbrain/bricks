import { Component, computed, effect, input, output, untracked } from '@angular/core';
import { BxBadge } from '@voidbrain/bricks/components';
import { BxChecklistCard, type ChecklistToggle } from './checklist-card';
import { BxNoticeCard } from './notice-card';
import { BxRecipeCard } from './recipe-card';
import { BxStatusCard } from './status-card';
import { validateSurfaceResult } from './surface';

/**
 * Renders one genUI surface from the registered catalogue, or a rejection notice. The payload is validated here;
 * an invalid one is never rendered and is reported through (rejected) for the project to log.
 */
@Component({
  selector: 'bx-surface',
  imports: [BxStatusCard, BxNoticeCard, BxChecklistCard, BxRecipeCard, BxBadge],
  template: `
    @let r = result();
    @if (r.ok) {
      @switch (r.surface.component) {
        @case ('nerv-status-card') {
          <bx-status-card [surface]="r.surface" />
        }
        @case ('nerv-notice-card') {
          <bx-notice-card [surface]="r.surface" />
        }
        @case ('nerv-checklist-card') {
          <bx-checklist-card [surface]="r.surface" (itemToggle)="checklistToggle.emit($event)" />
        }
        @case ('nerv-recipe-card') {
          <bx-recipe-card [surface]="r.surface" />
        }
      }
    } @else {
      <div class="rejection" role="alert">
        <bx-badge tone="danger">{{ rejectedLabel() }}</bx-badge>
        <p>{{ rejectedText() }}</p>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .rejection {
      display: flex;
      align-items: center;
      gap: var(--bx-space-3);
      padding: var(--bx-space-4) var(--bx-space-5);
      border: var(--bx-line-width) solid var(--bx-danger);
      border-radius: var(--bx-radius);
      background: var(--bx-surface-raised);
    }
    p {
      margin: 0;
      font-size: var(--bx-font-size-md);
    }
  `,
})
export class BxSurface {
  readonly surface = input<unknown>();
  readonly rejectedLabel = input('REJECTED');
  readonly rejectedText = input('Invalid or unauthorized surface payload rejected.');
  readonly rejected = output<string>();
  readonly checklistToggle = output<ChecklistToggle>();

  protected readonly result = computed(() => validateSurfaceResult(this.surface()));

  constructor() {
    effect(() => {
      const r = this.result();
      if (!r.ok) untracked(() => this.rejected.emit(r.reason));
    });
  }
}
