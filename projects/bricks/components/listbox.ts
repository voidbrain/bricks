import {
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  model,
  output,
} from '@angular/core';

export interface ListboxOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

let nextListboxId = 0;

/**
 * The popup list of a combobox (WAI-ARIA combobox pattern, list autocomplete): `role="listbox"` with one
 * `role="option"` per entry. Focus stays in the combobox's input, which points at the `active` option with
 * `aria-activedescendant` (`optionId(i)`) and passes its keys to `handleKey`. A click picks an option without
 * taking focus from the input. `bx-composer` wires it for slash commands.
 */
@Component({
  selector: 'bx-listbox',
  host: { role: 'listbox', '[attr.id]': 'id', '[attr.aria-label]': 'label()' },
  template: `
    @for (option of options(); track option.value; let i = $index) {
      <div
        class="option"
        role="option"
        [id]="optionId(i)"
        [attr.aria-selected]="i === active()"
        [attr.aria-disabled]="option.disabled || null"
        (pointerdown)="$event.preventDefault()"
        (click)="choose(i)"
      >
        <span class="label">{{ option.label }}</span>
        @if (option.description) {
          <span class="description">{{ option.description }}</span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 2px;
      box-sizing: border-box;
      min-inline-size: 0;
      max-block-size: var(--bx-listbox-max-height);
      overflow-y: auto;
      padding: var(--bx-space-1);
      border: var(--bx-line-width) solid var(--bx-listbox-border);
      border-radius: var(--bx-radius);
      background: var(--bx-listbox-bg);
      color: var(--bx-text);
      font-size: var(--bx-font-size-sm);
    }
    .option {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0 var(--bx-space-2);
      min-block-size: 24px;
      padding: var(--bx-space-1) var(--bx-space-2);
      border: var(--bx-line-width) solid transparent;
      border-radius: var(--bx-radius);
      cursor: pointer;
    }
    .option:hover,
    .option[aria-selected='true'] {
      border-color: var(--bx-listbox-active);
    }
    .option[aria-selected='true'] {
      background: color-mix(in srgb, var(--bx-listbox-active) 12%, var(--bx-listbox-bg));
    }
    .option[aria-disabled='true'] {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .label {
      font-weight: var(--bx-font-weight-bold);
    }
    .description {
      color: var(--bx-text-muted);
    }
  `,
})
export class BxListbox {
  readonly options = input.required<readonly ListboxOption[]>();
  readonly label = input.required<string>();
  /** The active option's index, or -1 for none. */
  readonly active = model(-1);
  readonly pick = output<ListboxOption>();

  readonly id = `bx-listbox-${nextListboxId++}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    afterRenderEffect({
      write: () => {
        const i = this.active();
        const el = i < 0 ? null : this.host.querySelector<HTMLElement>(`#${this.optionId(i)}`);
        el?.scrollIntoView?.({ block: 'nearest' });
      },
    });
  }

  optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  /**
   * Handles a key pressed in the combobox's input: ArrowDown and ArrowUp move the active option (wrapping, past
   * disabled ones) and Enter picks it. Returns whether it used the key, so the caller prevents its default.
   */
  handleKey(key: string): boolean {
    const options = this.options();
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const step = key === 'ArrowDown' ? 1 : -1;
      let i = this.active();
      for (let n = 0; n < options.length; n++) {
        i = (i + step + options.length + (i < 0 && step < 0 ? 1 : 0)) % options.length;
        if (!options[i]?.disabled) {
          this.active.set(i);
          return true;
        }
      }
      return options.length > 0;
    }
    if (key === 'Enter' && this.active() >= 0) {
      this.choose(this.active());
      return true;
    }
    return false;
  }

  protected choose(index: number): void {
    const option = this.options()[index];
    if (!option || option.disabled) return;
    this.active.set(index);
    this.pick.emit(option);
  }
}
