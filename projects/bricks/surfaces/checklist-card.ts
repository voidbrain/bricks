import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { BxCard } from '@voidbrain/bricks/components';
import { validateSurfaceResult, type ChecklistSurface } from './surface';

export interface ChecklistToggle {
  listId: string;
  itemId: string;
  done: boolean;
}

/**
 * `nerv-checklist-card`: a named list of items to tick. Rows are keyed by item id, so a new payload patches,
 * adds, moves or removes rows instead of rebuilding the list. A tick is shown at once and emitted as (itemToggle);
 * the project persists it and sends the next payload.
 */
@Component({
  selector: 'bx-checklist-card',
  imports: [BxCard],
  template: `
    @let list = view();
    <bx-card [label]="list.name">
      <div class="head">
        <h3 class="name">{{ list.name }}</h3>
        <span class="count" role="status">{{ list.valid ? doneCount() + '/' + list.items.length : 'error' }}</span>
      </div>
      <ul class="items">
        @for (item of list.items; track item.id) {
          <li>
            <label [class.done]="isDone(item)">
              <input type="checkbox" [checked]="isDone(item)" (change)="tick(list.listId, item, $event)" />
              <span>{{ item.text }}</span>
            </label>
          </li>
        } @empty {
          @if (!list.valid) {
            <li>Invalid surface</li>
          }
        }
      </ul>
    </bx-card>
  `,
  styles: `
    .head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--bx-space-3);
    }
    .name {
      margin: 0;
      font-size: var(--bx-font-size-xl);
      font-weight: var(--bx-font-weight-medium);
    }
    .count {
      color: var(--bx-text-muted);
      font-size: var(--bx-font-size-sm);
    }
    .items {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--bx-space-2);
    }
    label {
      display: flex;
      align-items: center;
      gap: var(--bx-space-3);
      cursor: pointer;
    }
    input {
      accent-color: var(--bx-accent);
      inline-size: 18px;
      block-size: 18px;
      margin: 0;
    }
    .done span {
      text-decoration: line-through;
      color: var(--bx-text-muted);
    }
  `,
})
export class BxChecklistCard {
  readonly surface = input<unknown>();
  readonly itemToggle = output<ChecklistToggle>();

  protected readonly view = computed(() => {
    const r = validateSurfaceResult(this.surface());
    if (!r.ok || r.surface.component !== 'nerv-checklist-card') {
      return {
        valid: false,
        listId: '',
        name: 'Checklist',
        items: [] as ChecklistSurface['props']['items'],
      };
    }
    return { valid: true, ...r.surface.props };
  });

  /** Ticks shown before the next payload arrives; a new payload resets them. */
  private readonly local = linkedSignal<ReadonlyMap<string, boolean>>(() => {
    this.view();
    return new Map();
  });

  protected readonly doneCount = computed(
    () => this.view().items.filter((item) => this.isDone(item)).length,
  );

  protected isDone(item: { id: string; done: boolean }): boolean {
    return this.local().get(item.id) ?? item.done;
  }

  protected tick(listId: string, item: { id: string }, event: Event): void {
    const done = (event.target as HTMLInputElement).checked;
    this.local.update((m) => new Map(m).set(item.id, done));
    this.itemToggle.emit({ listId, itemId: item.id, done });
  }
}
