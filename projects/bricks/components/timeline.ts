import { Component, input } from '@angular/core';

export const TIMELINE_TONES = ['accent', 'info', 'ok', 'warn', 'danger', 'neutral'] as const;
export type TimelineTone = (typeof TIMELINE_TONES)[number];

/**
 * A vertical timeline: a list (`role="list"`, named by `label`) of `bx-timeline-item` rows on one line, in the
 * order the project gives them (soonest first for what is coming up, newest first for a chronicle). An empty
 * timeline renders nothing: the project shows its own empty text.
 */
@Component({
  selector: 'bx-timeline',
  host: { role: 'list', '[attr.aria-label]': 'label() || null' },
  template: `<ng-content />`,
  styles: `
    :host {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--bx-timeline-gap);
      min-inline-size: 0;
      padding-inline-start: var(--bx-timeline-indent);
    }
    :host::before {
      content: '';
      position: absolute;
      inset-block: var(--bx-space-1);
      inset-inline-start: calc(var(--bx-timeline-marker-size) / 2);
      inline-size: var(--bx-line-width);
      background: var(--bx-timeline-line);
    }
  `,
})
export class BxTimeline {
  readonly label = input<string>('');
}

/**
 * One timeline row (`role="listitem"`): a `time` line (a `<time>`, with `datetime` when given), an optional
 * `[bx-timeline-meta]` slot beside it (a badge, a version), the projected body, an optional muted `detail` line and
 * an `[bx-timeline-actions]` slot. The marker's `tone` is a hint only: the text or a badge says the kind.
 */
@Component({
  selector: 'bx-timeline-item',
  host: { role: 'listitem', '[attr.data-tone]': 'tone()' },
  template: `
    <span class="marker" aria-hidden="true"></span>
    <div class="head">
      <time class="time" [attr.datetime]="datetime() || null">{{ time() }}</time>
      <ng-content select="[bx-timeline-meta]" />
    </div>
    <div class="body"><ng-content /></div>
    @if (detail()) {
      <div class="detail">{{ detail() }}</div>
    }
    <div class="actions"><ng-content select="[bx-timeline-actions]" /></div>
  `,
  styles: `
    :host {
      --tone: var(--bx-accent);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-inline-size: 0;
      font-size: var(--bx-font-size-sm);
      line-height: var(--bx-line-height-body);
      color: var(--bx-text);
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
    :host([data-tone='neutral']) {
      --tone: var(--bx-text-muted);
    }
    .marker {
      position: absolute;
      inset-block-start: calc((1lh - var(--bx-timeline-marker-size)) / 2);
      inset-inline-start: calc(-1 * var(--bx-timeline-indent));
      box-sizing: border-box;
      inline-size: var(--bx-timeline-marker-size);
      block-size: var(--bx-timeline-marker-size);
      border-radius: var(--bx-timeline-marker-radius);
      background: var(--tone);
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .time {
      font-weight: var(--bx-font-weight-bold);
    }
    .body {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .detail {
      color: var(--bx-text-muted);
      font-size: var(--bx-font-size-xs);
      overflow-wrap: anywhere;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-2);
    }
    .actions:empty {
      display: none;
    }
  `,
})
export class BxTimelineItem {
  /** The time as the project formats it (`09:30`, `2026-11-20`); `datetime` is the machine-readable value. */
  readonly time = input.required<string>();
  readonly datetime = input<string>('');
  readonly detail = input<string>('');
  readonly tone = input<TimelineTone>('accent');
}
