import { Component, computed, input, numberAttribute } from '@angular/core';

export const CARD_HEADING_LEVELS = [2, 3, 4, 5, 6] as const;
export type CardHeadingLevel = (typeof CARD_HEADING_LEVELS)[number];

let nextHeadingId = 0;

function toHeadingLevel(value: unknown): CardHeadingLevel {
  const n = numberAttribute(value, 2);
  return (CARD_HEADING_LEVELS as readonly number[]).includes(n) ? (n as CardHeadingLevel) : 2;
}

/**
 * A raised panel. Give it a `heading` for a header row with a heading and a meta slot (`[bx-card-meta]`): the card
 * then is a region named by that heading. Without a heading, a `label` names the region instead. The header's look
 * comes from component tokens (`--bx-card-title`, `--bx-card-header-bg`, `--bx-card-header-fg`); eva fills it as a bar.
 */
@Component({
  selector: 'bx-card',
  template: `
    <section
      class="card"
      [attr.role]="named() ? 'region' : null"
      [attr.aria-labelledby]="heading() ? id() : null"
      [attr.aria-label]="!heading() && label() ? label() : null"
    >
      @if (heading()) {
        <header class="head">
          @switch (headingLevel()) {
            @case (3) {
              <h3 class="title" [id]="id()">{{ heading() }}</h3>
            }
            @case (4) {
              <h4 class="title" [id]="id()">{{ heading() }}</h4>
            }
            @case (5) {
              <h5 class="title" [id]="id()">{{ heading() }}</h5>
            }
            @case (6) {
              <h6 class="title" [id]="id()">{{ heading() }}</h6>
            }
            @default {
              <h2 class="title" [id]="id()">{{ heading() }}</h2>
            }
          }
          <span class="meta"><ng-content select="[bx-card-meta]" /></span>
        </header>
      }
      <div class="body">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }
    .card {
      border: var(--bx-line-width) solid var(--bx-card-border);
      border-radius: var(--bx-card-radius);
      background: var(--bx-card-bg);
      color: var(--bx-card-fg);
      box-shadow: var(--bx-card-glow);
      overflow: hidden;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--bx-space-2);
      padding: var(--bx-card-header-padding);
      border-block-end: var(--bx-line-width) solid var(--bx-card-border);
      background: var(--bx-card-header-bg);
      color: var(--bx-card-header-fg);
      font-size: var(--bx-font-size-sm);
    }
    .title {
      margin: 0;
      color: var(--bx-card-title);
      font-size: var(--bx-font-size-sm);
      font-weight: var(--bx-font-weight-bold);
      letter-spacing: 0.08em;
      line-height: var(--bx-line-height-tight);
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .meta {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .meta:empty {
      display: none;
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: var(--bx-card-gap);
      padding: var(--bx-card-padding);
    }
  `,
})
export class BxCard {
  /** Names a heading-less card as a region. */
  readonly label = input<string>('');
  /** The header's heading text; the card becomes a region named by it. */
  readonly heading = input<string>('');
  /** The heading's level, so it fits the page outline (2 to 6; anything else is 2). */
  readonly headingLevel = input<CardHeadingLevel, unknown>(2, { transform: toHeadingLevel });
  /** The heading's id (generated when empty), for links and `aria-labelledby` elsewhere. */
  readonly headingId = input<string>('');

  private readonly generatedId = `bx-card-heading-${nextHeadingId++}`;
  protected readonly id = computed(() => this.headingId() || this.generatedId);
  protected readonly named = computed(() => !!this.heading() || !!this.label());
}
