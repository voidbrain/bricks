import {
  Component,
  ElementRef,
  afterRenderEffect,
  contentChildren,
  inject,
  input,
} from '@angular/core';

export const MESSAGE_TONES = ['none', 'info', 'ok', 'warn', 'danger'] as const;
export type MessageTone = (typeof MESSAGE_TONES)[number];

/**
 * One message in a `bx-message-log`: an optional `[bx-message-avatar]`, a header line (the `time`, the sender `who`
 * and a muted `context`, such as a task id) and the projected body (text, or a surface card). `own` tints the
 * person's own messages; `tone` draws a side bar (a hint only: the text says what happened).
 */
@Component({
  selector: 'bx-message',
  host: { '[attr.data-tone]': 'tone()', '[attr.data-own]': 'own() || null' },
  template: `
    <ng-content select="[bx-message-avatar]" />
    <div class="main">
      <div class="head">
        @if (time()) {
          <time class="muted" [attr.datetime]="datetime() || null">{{ time() }}</time>
        }
        <b class="who">{{ who() }}</b>
        @if (context()) {
          <span class="muted">{{ context() }}</span>
        }
      </div>
      <div class="body"><ng-content /></div>
    </div>
  `,
  styles: `
    :host {
      --tone: transparent;
      display: flex;
      align-items: flex-start;
      gap: var(--bx-message-gap);
      min-inline-size: 0;
      padding: var(--bx-space-1) var(--bx-space-2);
      border-inline-start: 2px solid var(--tone);
      color: var(--bx-text);
      font-size: var(--bx-font-size-sm);
      line-height: var(--bx-line-height-body);
    }
    :host([data-own]) {
      background: color-mix(in srgb, var(--bx-accent) var(--bx-message-own-tint), transparent);
    }
    :host([data-tone='info']) {
      --tone: var(--bx-info);
    }
    :host([data-tone='ok']) {
      --tone: var(--bx-ok);
    }
    :host([data-tone='warn']) {
      --tone: var(--bx-warn);
    }
    :host([data-tone='danger']) {
      --tone: var(--bx-danger);
    }
    .main {
      flex: 1;
      min-inline-size: 0;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 var(--bx-space-2);
    }
    .muted {
      color: var(--bx-message-muted);
    }
    .who {
      letter-spacing: 0.06em;
    }
    .body {
      overflow-wrap: anywhere;
    }
  `,
})
export class BxMessage {
  readonly who = input.required<string>();
  /** The time as the project formats it (`09:14:05`); `datetime` is the machine-readable value. */
  readonly time = input<string>('');
  readonly datetime = input<string>('');
  readonly context = input<string>('');
  readonly own = input(false);
  readonly tone = input<MessageTone>('none');
}

/**
 * A scrolling message log (`role="log"`, polite): the `bx-message` rows the project gives it, oldest first. It is
 * named by `label` and focusable, so the keyboard can scroll it. While the reader is at the end, a new message keeps
 * the end in view; once they scroll up to read, it stays where they are (`follow` turns this off).
 */
@Component({
  selector: 'bx-message-log',
  host: {
    role: 'log',
    'aria-live': 'polite',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '(scroll)': 'onScroll()',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 2px;
      box-sizing: border-box;
      min-inline-size: 0;
      max-block-size: var(--bx-log-max-height);
      overflow-y: auto;
      padding: var(--bx-log-padding);
      border: var(--bx-line-width) solid var(--bx-log-border);
      border-radius: var(--bx-radius);
      background: var(--bx-log-bg);
      color: var(--bx-text);
    }
  `,
})
export class BxMessageLog {
  readonly label = input.required<string>();
  readonly follow = input(true);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly messages = contentChildren(BxMessage);
  private atEnd = true;

  constructor() {
    afterRenderEffect({
      write: () => {
        this.messages();
        const follow = this.follow();
        if (follow && this.atEnd) this.scrollToEnd();
      },
    });
  }

  /** Scrolls to the newest message. */
  scrollToEnd(): void {
    this.host.scrollTop = this.host.scrollHeight;
    this.atEnd = true;
  }

  protected onScroll(): void {
    const h = this.host;
    this.atEnd = h.scrollHeight - h.scrollTop - h.clientHeight <= 24;
  }
}
