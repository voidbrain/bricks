import {
  Component,
  computed,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { BxButton } from './button';
import { BxListbox, type ListboxOption } from './listbox';

/** A slash command the composer offers once the text starts with `/`. */
export interface ComposerCommand {
  readonly name: string;
  /** How it is typed, shown in the menu (`/why S-0001`); default `/name`. */
  readonly usage?: string;
  readonly summary?: string;
  /** Whether it takes arguments: picking it then leaves a space after the name. */
  readonly hasArgs?: boolean;
}

let nextComposerId = 0;

/**
 * A message composer: a labelled text field, an optional `[bx-composer-avatar]`, a `[bx-composer-actions]` slot
 * (push to talk, attach) and a send button, bound with `[(value)]`. Submitting emits `send` with the trimmed text
 * and clears the field; empty text sends nothing. With `commands`, typing `/` opens a slash-command menu (WAI-ARIA
 * combobox with a listbox popup): ArrowDown and ArrowUp move through it, Enter picks the active command into the
 * field, Escape closes it, a click picks too. Enter with no active command sends.
 */
@Component({
  selector: 'bx-composer',
  imports: [BxButton, BxListbox],
  template: `
    @if (menuOpen()) {
      <bx-listbox
        class="menu"
        [options]="options()"
        [label]="commandsLabel()"
        [(active)]="active"
        (pick)="pickCommand($event)"
      />
    }
    <form class="row" (submit)="submit($event)">
      <ng-content select="[bx-composer-avatar]" />
      <label class="bx-sr-only" [for]="inputId">{{ label() }}</label>
      <input
        class="input"
        type="text"
        autocomplete="off"
        [id]="inputId"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [attr.maxlength]="maxLength() || null"
        [attr.role]="commands().length ? 'combobox' : null"
        [attr.aria-autocomplete]="commands().length ? 'list' : null"
        [attr.aria-expanded]="commands().length ? menuOpen() : null"
        [attr.aria-controls]="menuOpen() ? listbox()?.id : null"
        [attr.aria-activedescendant]="activeId()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="dismissed.set(true)"
      />
      <ng-content select="[bx-composer-actions]" />
      <bx-button type="submit" variant="primary" [disabled]="disabled()">{{ sendLabel() }}</bx-button>
    </form>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--bx-composer-gap);
      min-inline-size: 0;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-composer-gap);
      margin: 0;
    }
    .input {
      flex: 1 1 10rem;
      box-sizing: border-box;
      min-inline-size: 0;
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
    .input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class BxComposer {
  readonly value = model('');
  /** The field's accessible name (visually hidden), such as `Message the agent`. */
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly sendLabel = input('Send');
  readonly disabled = input(false);
  readonly maxLength = input(0);
  readonly commands = input<readonly ComposerCommand[]>([]);
  readonly commandsLabel = input('Slash commands');
  /** The trimmed text, on submit. */
  readonly send = output<string>();
  /** The command picked from the menu. */
  readonly commandPick = output<ComposerCommand>();

  protected readonly inputId = `bx-composer-${nextComposerId++}`;
  protected readonly listbox = viewChild(BxListbox);
  /** Escape, blur or a pick closes the menu until the text changes. */
  protected readonly dismissed = signal(false);

  private readonly matches = computed(() => {
    const m = /^\/(\S*)$/.exec(this.value());
    if (!m) return [];
    const query = m[1]!.toLowerCase();
    return this.commands().filter((c) => c.name.toLowerCase().startsWith(query));
  });
  protected readonly options = computed<ListboxOption[]>(() =>
    this.matches().map((c) => ({
      value: c.name,
      label: c.usage || `/${c.name}`,
      description: c.summary,
    })),
  );
  protected readonly menuOpen = computed(() => !this.dismissed() && this.options().length > 0);
  protected readonly active = linkedSignal({ source: this.options, computation: () => -1 });
  protected readonly activeId = computed(() => {
    const listbox = this.listbox();
    const active = this.active();
    return this.menuOpen() && listbox && active >= 0 ? listbox.optionId(active) : null;
  });

  protected onInput(event: Event): void {
    this.dismissed.set(false);
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.menuOpen()) {
      this.dismissed.set(true);
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowDown' && !this.menuOpen() && this.options().length) {
      this.dismissed.set(false);
      event.preventDefault();
      return;
    }
    const listbox = this.listbox();
    if (this.menuOpen() && listbox?.handleKey(event.key)) event.preventDefault();
  }

  protected pickCommand(option: ListboxOption): void {
    const command = this.matches().find((c) => c.name === option.value);
    if (!command) return;
    this.value.set(`/${command.name}${command.hasArgs ? ' ' : ''}`);
    this.dismissed.set(true);
    this.commandPick.emit(command);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const text = this.value().trim();
    if (!text || this.disabled()) return;
    this.send.emit(text);
    this.value.set('');
    this.dismissed.set(false);
  }
}
