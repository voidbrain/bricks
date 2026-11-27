import {
  Component,
  type Signal,
  type WritableSignal,
  computed,
  input,
  linkedSignal,
} from '@angular/core';
import { cssVar } from '@voidbrain/bricks/tokens';
import { BxDisclosure } from './disclosure';

export const CHART_TONES = [
  'accent',
  'green',
  'orange',
  'blue',
  'info',
  'ok',
  'warn',
  'danger',
] as const;
export type ChartTone = (typeof CHART_TONES)[number];

/** Default series palette: distinct semantic tokens that meet 4.5:1 on every theme surface. */
export const DEFAULT_SERIES_TONES: readonly ChartTone[] = [
  'accent',
  'green',
  'orange',
  'blue',
  'info',
  'warn',
];

export const CHART_SHAPES = ['circle', 'square', 'diamond', 'triangle'] as const;
export type ChartShape = (typeof CHART_SHAPES)[number];

const DASH_PATTERNS = ['', '6 3', '2 3', '8 3 2 3'] as const;

/**
 * Fill overlays on a 12-unit tile, drawn in the plot colour over a series' tone so filled shapes (bars, segments,
 * slices) differ without colour: none, hatch, dots, cross (F-014-T05).
 */
export const CHART_PATTERNS = [
  '',
  'M0,12L12,0M-3,3L3,-3M9,15L15,9',
  'M3,3h3v3h-3zM9,9h3v3h-3z',
  'M0,6H12M6,0V12',
] as const;

/** The fill overlay (a `CHART_PATTERNS` path, `''` for none) for series `index`. */
export function seriesPattern(index: number): string {
  return CHART_PATTERNS[index % CHART_PATTERNS.length]!;
}

/** Maps a `ChartTone` to its semantic CSS custom property (`var(--bx-…)`). */
export function chartToneColor(tone: ChartTone): string {
  switch (tone) {
    case 'green':
      return cssVar('--bx-series-green');
    case 'orange':
      return cssVar('--bx-series-orange');
    case 'blue':
      return cssVar('--bx-series-blue');
    case 'info':
      return cssVar('--bx-info');
    case 'ok':
      return cssVar('--bx-ok');
    case 'warn':
      return cssVar('--bx-warn');
    case 'danger':
      return cssVar('--bx-danger');
    default:
      return cssVar('--bx-accent');
  }
}

export function seriesTone(index: number, explicit?: ChartTone): ChartTone {
  return explicit ?? DEFAULT_SERIES_TONES[index % DEFAULT_SERIES_TONES.length]!;
}

/** Stroke dash pattern for series `index` when more than one series is drawn, so lines differ without colour. */
export function seriesDash(index: number, totalSeries = 2): string {
  return totalSeries <= 1 ? '' : DASH_PATTERNS[index % DASH_PATTERNS.length]!;
}

/** Point glyph shape for series `index` so points differ without colour. */
export function seriesShape(index: number): ChartShape {
  return CHART_SHAPES[index % CHART_SHAPES.length]!;
}

/** Computes a `[min, max]` domain from values, handling empty or flat inputs and optional zero baseline. */
export function linearDomain(
  values: readonly number[],
  options?: { readonly includeZero?: boolean; readonly padRatio?: number },
): readonly [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) return [0, 1];
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (options?.includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (hi - lo < 1e-9) {
    if (options?.includeZero && lo === 0) {
      hi = 1;
    } else {
      lo -= 1;
      hi += 1;
    }
  } else if (options?.padRatio) {
    const pad = (hi - lo) * options.padRatio;
    if (!(options.includeZero && lo === 0)) lo -= pad;
    if (!(options.includeZero && hi === 0)) hi += pad;
  }
  return [lo, hi];
}

/** Maps a value in `domain` linearly onto `range`, clamped to `domain` when `clamp` is true. */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
  clamp = false,
): (value: number) => number {
  const span = domain[1] - domain[0];
  return (value: number) => {
    if (Math.abs(span) < 1e-12) return range[0];
    const v = clamp
      ? Math.min(Math.max(value, Math.min(domain[0], domain[1])), Math.max(domain[0], domain[1]))
      : value;
    return range[0] + ((v - domain[0]) / span) * (range[1] - range[0]);
  };
}

/** Evenly spaced tick values across `domain` (`count` >= 2). */
export function linearTicks(domain: readonly [number, number], count = 4): number[] {
  const n = Math.max(2, Math.trunc(count));
  const [lo, hi] = domain;
  return Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}

/** Slots for `count` bars across `range`: the slot step, the bar width and each bar's start; `gap` (0–1) of a slot stays empty. */
export function bandScale(
  count: number,
  range: readonly [number, number],
  gap = 0.3,
): { readonly step: number; readonly width: number; readonly start: (index: number) => number } {
  const step = count > 0 ? (range[1] - range[0]) / count : 0;
  const width = step * (1 - gap);
  return { step, width, start: (index) => range[0] + step * index + (step - width) / 2 };
}

/** A share of a whole as text, `40 %`, one decimal at most. */
export function formatChartShare(part: number, whole: number): string {
  if (!(whole > 0) || !Number.isFinite(part)) return '—';
  return `${Number(((part / whole) * 100).toFixed(1))} %`;
}

/** Concise axis and table number formatter with no trailing `.00` noise. */
export function formatChartNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 1000 && Number.isInteger(value)) return String(value);
  const rounded = Number(value.toFixed(2));
  return String(rounded);
}

/** Formats a UTC timestamp (`ms`) as `HH:mm` within a 48 h span, otherwise `MM-DD`. */
export function formatChartTime(ms: number, spanMs: number): string {
  if (!Number.isFinite(ms)) return '—';
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (spanMs <= 48 * 3_600_000) {
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Roving-tabindex keyboard step across `count` focusable chart items; returns the next index or `null`. */
export function stepChartIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * Roving keyboard focus, focus and hover across a chart's focusable items, reset whenever `source` (the chart's
 * model) changes: one tab stop, arrows, Home and End move it; the readout follows focus, else hover.
 */
export class ChartRoving {
  readonly tabStop: WritableSignal<number>;
  readonly focused: WritableSignal<number>;
  readonly hovered: WritableSignal<number>;
  readonly active: Signal<number>;

  constructor(source: Signal<unknown>) {
    this.tabStop = linkedSignal({ source, computation: () => 0 });
    this.focused = linkedSignal({ source, computation: () => -1 });
    this.hovered = linkedSignal({ source, computation: () => -1 });
    this.active = computed(() => (this.focused() >= 0 ? this.focused() : this.hovered()));
  }

  focus(index: number): void {
    this.tabStop.set(index);
    this.focused.set(index);
  }

  blur(index: number): void {
    if (this.focused() === index) this.focused.set(-1);
  }

  leave(index: number): void {
    if (this.hovered() === index) this.hovered.set(-1);
  }

  /** Moves focus for an arrow, Home or End key and returns the index to focus, else `null`. */
  move(event: KeyboardEvent, index: number, count: number): number | null {
    const next = stepChartIndex(event.key, index, count);
    if (next === null) return null;
    event.preventDefault();
    this.focus(next);
    return next;
  }
}

export interface ChartLegendItem {
  readonly key: string;
  readonly label: string;
  readonly tone: ChartTone;
  readonly dash?: string;
  readonly shape?: ChartShape;
  /** A `CHART_PATTERNS` overlay for a filled swatch. */
  readonly pattern?: string;
  readonly detail?: string;
}

export interface ChartTable {
  readonly caption: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

let nextFrameId = 0;

/**
 * Shared frame for every bricks chart (F-014-T03): a named `<figure>` with header and meta, empty state,
 * live active-datum readout, non-colour legend swatches, and a `<bx-disclosure>` data-table fallback.
 */
@Component({
  selector: 'bx-chart-frame',
  imports: [BxDisclosure],
  template: `
    <figure class="frame" [attr.aria-labelledby]="titleId">
      <figcaption class="head">
        <span class="title" [id]="titleId">{{ label() }}</span>
        @if (meta()) {
          <span class="meta">{{ meta() }}</span>
        }
      </figcaption>
      @if (empty()) {
        <p class="empty">{{ emptyText() }}</p>
      } @else {
        <div class="canvas">
          <ng-content />
        </div>
        @if (activeText()) {
          <p class="readout">{{ activeText() }}</p>
        }
        @if (legend().length > 0) {
          <ul class="legend" [attr.aria-label]="legendLabel()">
            @for (item of legend(); track item.key) {
              <li class="legend-item">
                <svg class="swatch" viewBox="0 0 20 12" aria-hidden="true">
                  @if (item.dash !== undefined || item.shape !== undefined) {
                    <line
                      x1="1"
                      y1="6"
                      x2="19"
                      y2="6"
                      [style.stroke]="toneColor(item.tone)"
                      [attr.stroke-dasharray]="item.dash || null"
                      stroke-width="2"
                    />
                    @switch (item.shape) {
                      @case ('square') {
                        <rect
                          x="7"
                          y="3"
                          width="6"
                          height="6"
                          [style.fill]="toneColor(item.tone)"
                        />
                      }
                      @case ('diamond') {
                        <polygon
                          points="10,2 14,6 10,10 6,6"
                          [style.fill]="toneColor(item.tone)"
                        />
                      }
                      @case ('triangle') {
                        <polygon
                          points="10,2 14,10 6,10"
                          [style.fill]="toneColor(item.tone)"
                        />
                      }
                      @default {
                        <circle cx="10" cy="6" r="3" [style.fill]="toneColor(item.tone)" />
                      }
                    }
                  } @else {
                    <rect
                      x="2"
                      y="1"
                      width="16"
                      height="10"
                      rx="2"
                      [style.fill]="toneColor(item.tone)"
                    />
                    @if (item.pattern) {
                      <defs>
                        <pattern
                          [id]="titleId + '-swatch-' + $index"
                          width="12"
                          height="12"
                          patternUnits="userSpaceOnUse"
                          patternTransform="scale(0.5)"
                        >
                          <path class="pattern-mark" [attr.d]="item.pattern" />
                        </pattern>
                      </defs>
                      <rect
                        x="2"
                        y="1"
                        width="16"
                        height="10"
                        rx="2"
                        [attr.fill]="'url(#' + titleId + '-swatch-' + $index + ')'"
                      />
                    }
                  }
                </svg>
                <span class="legend-label">{{ item.label }}</span>
                @if (item.detail) {
                  <span class="legend-detail">{{ item.detail }}</span>
                }
              </li>
            }
          </ul>
        }
        <bx-disclosure [summary]="tableLabel()">
          <div class="table-wrap">
            <table class="data-table">
              <caption class="bx-sr-only">{{ table().caption }}</caption>
              <thead>
                <tr>
                  @for (header of table().headers; track $index) {
                    <th scope="col">{{ header }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of table().rows; track $index) {
                  <tr>
                    @for (cell of row; track $index; let first = $first) {
                      @if (first) {
                        <th scope="row">{{ cell }}</th>
                      } @else {
                        <td>{{ cell }}</td>
                      }
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </bx-disclosure>
      }
    </figure>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }
    .frame {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--bx-space-2);
      min-inline-size: 0;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--bx-space-2);
    }
    .title {
      font-size: var(--bx-font-size-xs);
      font-weight: var(--bx-font-weight-bold);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--bx-chart-axis);
    }
    .meta {
      font-size: var(--bx-font-size-sm);
      color: var(--bx-chart-fg);
      font-variant-numeric: tabular-nums;
    }
    .canvas {
      min-inline-size: 0;
    }
    .empty,
    .readout {
      margin: 0;
      font-size: var(--bx-font-size-sm);
      color: var(--bx-chart-axis);
      font-variant-numeric: tabular-nums;
    }
    .readout {
      color: var(--bx-chart-fg);
    }
    .legend {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-2) var(--bx-space-4);
      font-size: var(--bx-font-size-xs);
      color: var(--bx-chart-fg);
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: var(--bx-space-1);
    }
    .swatch {
      inline-size: 20px;
      block-size: 12px;
      flex: none;
    }
    .pattern-mark {
      fill: var(--bx-chart-bg);
      stroke: var(--bx-chart-bg);
      stroke-width: 2;
    }
    .legend-detail {
      color: var(--bx-chart-axis);
      font-variant-numeric: tabular-nums;
    }
    .table-wrap {
      overflow-x: auto;
      max-inline-size: 100%;
    }
    .data-table {
      inline-size: 100%;
      border-collapse: collapse;
      font-size: var(--bx-font-size-xs);
      color: var(--bx-chart-fg);
      font-variant-numeric: tabular-nums;
    }
    .data-table th,
    .data-table td {
      padding: var(--bx-space-1) var(--bx-space-2);
      border-block-end: var(--bx-line-width) solid var(--bx-chart-border);
      text-align: start;
    }
    .data-table thead th {
      color: var(--bx-chart-axis);
      font-weight: var(--bx-font-weight-bold);
    }
  `,
})
export class BxChartFrame {
  readonly label = input.required<string>();
  readonly meta = input('');
  readonly empty = input(false);
  readonly emptyText = input('No data');
  readonly activeText = input('');
  readonly legend = input<readonly ChartLegendItem[]>([]);
  readonly legendLabel = input('Series');
  readonly tableLabel = input('Data table');
  readonly table = input<ChartTable>({ caption: '', headers: [], rows: [] });

  protected readonly titleId = `bx-chart-title-${nextFrameId++}`;
  protected toneColor(tone: ChartTone): string {
    return chartToneColor(tone);
  }
}
