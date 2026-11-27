import {
  Component,
  ElementRef,
  computed,
  input,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';
import {
  BxChartFrame,
  type ChartLegendItem,
  type ChartTable,
  type ChartTone,
  ChartRoving,
  bandScale,
  chartToneColor,
  formatChartNumber,
  formatChartShare,
  linearDomain,
  linearScale,
  linearTicks,
  seriesPattern,
  seriesTone,
} from './chart-base';

export interface StackedBarSeries {
  readonly name: string;
  /** One value per category, in the order of `categories`; parts of a whole, so never below zero. */
  readonly values: readonly number[];
  readonly tone?: ChartTone;
}

export interface StackedBarSelection {
  readonly series: string;
  readonly category: string;
  readonly value: number;
}

interface RenderedSegment {
  readonly index: number;
  readonly series: string;
  readonly category: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly color: string;
  readonly pattern: string;
  readonly patternId: string;
  readonly ariaLabel: string;
}

const VIEW_WIDTH = 800;
const PAD_VERTICAL = { l: 48, r: 16, t: 20, b: 28 };
const PAD_HORIZONTAL = { l: 140, r: 56, t: 8, b: 24 };

let nextStackedId = 0;

/** A part as a non-negative number: anything else counts as nothing. */
const part = (v: number | undefined): number =>
  v !== undefined && Number.isFinite(v) && v > 0 ? v : 0;

/**
 * Plain-SVG stacked bar chart (`bx-stacked-bar-chart`, F-014-T05): several series stacked per category,
 * vertical or horizontal, a total on every bar, segments told apart by colour and a fill pattern (legend
 * included), roving keyboard focus across segments, `<title>` + `<desc>`, and the shared frame's data table.
 */
@Component({
  selector: 'bx-stacked-bar-chart',
  imports: [BxChartFrame],
  template: `
    <bx-chart-frame
      [label]="label()"
      [empty]="!model()"
      [emptyText]="emptyText()"
      [activeText]="activeReadout()"
      [legend]="legendItems()"
      [legendLabel]="legendLabel()"
      [tableLabel]="tableLabel()"
      [table]="tableData()"
    >
      @if (model(); as m) {
        <svg
          class="svg"
          [attr.viewBox]="'0 0 ' + viewWidth + ' ' + m.h"
          role="group"
          [attr.aria-labelledby]="svgTitleId"
          [attr.aria-describedby]="svgDescId"
        >
          <title [id]="svgTitleId">{{ label() }}</title>
          <desc [id]="svgDescId">{{ descText() }}</desc>
          <defs>
            @for (p of m.patterns; track p.id) {
              <pattern [id]="p.id" width="12" height="12" patternUnits="userSpaceOnUse">
                <path class="pattern-mark" [attr.d]="p.d" />
              </pattern>
            }
          </defs>

          @for (t of m.ticks; track $index) {
            <line class="grid" [attr.x1]="t.x1" [attr.x2]="t.x2" [attr.y1]="t.y1" [attr.y2]="t.y2" />
            <text class="tick" [attr.x]="t.tx" [attr.y]="t.ty" [attr.text-anchor]="t.anchor">
              {{ t.text }}
            </text>
          }

          @for (c of m.categories; track $index) {
            <text class="tick" [attr.x]="c.cx" [attr.y]="c.cy" [attr.text-anchor]="c.cAnchor">
              {{ c.label }}
            </text>
            <text class="value" [attr.x]="c.tx" [attr.y]="c.ty" [attr.text-anchor]="c.tAnchor">
              {{ c.totalText }}
            </text>
          }

          @for (s of m.segments; track s.index) {
            <g
              #segmentEl
              class="datum"
              role="button"
              [attr.tabindex]="roving.tabStop() === s.index ? 0 : -1"
              [attr.aria-label]="s.ariaLabel"
              [attr.data-hovered]="roving.hovered() === s.index ? '' : null"
              (focus)="roving.focus(s.index)"
              (blur)="roving.blur(s.index)"
              (mouseenter)="roving.hovered.set(s.index)"
              (mouseleave)="roving.leave(s.index)"
              (click)="selectSegment(s)"
              (keydown)="onKey($event, s)"
            >
              <rect
                class="segment"
                [attr.x]="s.x"
                [attr.y]="s.y"
                [attr.width]="s.w"
                [attr.height]="s.h"
                [style.fill]="s.color"
              />
              @if (s.pattern) {
                <rect
                  class="overlay"
                  [attr.x]="s.x"
                  [attr.y]="s.y"
                  [attr.width]="s.w"
                  [attr.height]="s.h"
                  [attr.fill]="'url(#' + s.patternId + ')'"
                />
              }
            </g>
          }

          <line
            class="baseline"
            [attr.x1]="m.base.x1"
            [attr.x2]="m.base.x2"
            [attr.y1]="m.base.y1"
            [attr.y2]="m.base.y2"
          />
        </svg>
      }
    </bx-chart-frame>
  `,
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }
    .svg {
      display: block;
      inline-size: 100%;
      block-size: auto;
      background: var(--bx-chart-bg);
      border: var(--bx-line-width) solid var(--bx-chart-border);
      border-radius: var(--bx-chart-radius);
    }
    .grid {
      stroke: var(--bx-chart-grid);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .baseline {
      stroke: var(--bx-chart-axis);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .tick {
      fill: var(--bx-chart-axis);
      font-size: var(--bx-font-size-xs);
      font-family: var(--bx-font);
    }
    .value {
      fill: var(--bx-chart-fg);
      font-size: var(--bx-font-size-xs);
      font-family: var(--bx-font);
      font-variant-numeric: tabular-nums;
    }
    .pattern-mark {
      fill: var(--bx-chart-bg);
      stroke: var(--bx-chart-bg);
      stroke-width: 2;
    }
    .segment {
      stroke: var(--bx-chart-bg);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .datum {
      cursor: pointer;
      outline: none;
    }
    .datum[data-hovered] .segment {
      stroke: var(--bx-chart-axis);
    }
    .datum:focus-visible .segment,
    .datum:focus .segment {
      stroke: var(--bx-focus);
      stroke-width: var(--bx-focus-width);
    }
  `,
})
export class BxStackedBarChart {
  readonly label = input.required<string>();
  /** Optional translated override for the SVG `<desc>` summary. */
  readonly description = input('');
  readonly unit = input('');
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly categories = input<readonly string[]>([]);
  readonly series = input<readonly StackedBarSeries[]>([]);
  readonly height = input(200, { transform: (v: unknown) => numberAttribute(v, 200) });
  readonly emptyText = input('No data');
  readonly tableLabel = input('Data table');
  readonly legendLabel = input('Series');
  readonly categoryHeader = input('Category');
  readonly totalHeader = input('Total');

  readonly segmentSelect = output<StackedBarSelection>();

  protected readonly viewWidth = VIEW_WIDTH;
  private readonly uid = nextStackedId++;
  protected readonly svgTitleId = `bx-stacked-title-${this.uid}`;
  protected readonly svgDescId = `bx-stacked-desc-${this.uid}`;
  private readonly segmentEls = viewChildren<ElementRef<SVGGElement>>('segmentEl');

  private formatValue(v: number): string {
    const u = this.unit();
    return u ? `${formatChartNumber(v)} ${u}` : formatChartNumber(v);
  }

  private readonly styled = computed(() =>
    this.series().map((s, i) => ({
      ...s,
      tone: seriesTone(i, s.tone),
      pattern: seriesPattern(i),
      patternId: `bx-stacked-${this.uid}-p${i}`,
    })),
  );

  protected readonly model = computed(() => {
    const series = this.styled();
    const cats = this.categories();
    const totals = cats.map((_, c) => series.reduce((sum, s) => sum + part(s.values[c]), 0));
    if (!series.length || !totals.some((t) => t > 0)) return null;

    const horizontal = this.orientation() === 'horizontal';
    const pad = horizontal ? PAD_HORIZONTAL : PAD_VERTICAL;
    const rawH = this.height();
    const minH = horizontal ? pad.t + pad.b + cats.length * 24 : 120;
    const h = Math.max(minH, Number.isFinite(rawH) && rawH > 0 ? rawH : 200);
    const dom = linearDomain(totals, { includeZero: true, padRatio: 0.08 });
    const value = horizontal
      ? linearScale(dom, [pad.l, VIEW_WIDTH - pad.r])
      : linearScale(dom, [h - pad.b, pad.t]);
    const slots = horizontal
      ? bandScale(cats.length, [pad.t, h - pad.b])
      : bandScale(cats.length, [pad.l, VIEW_WIDTH - pad.r]);

    const segments: RenderedSegment[] = [];
    const categories = cats.map((category, c) => {
      const s0 = slots.start(c);
      const mid = s0 + slots.width / 2;
      let acc = 0;
      for (const s of series) {
        const v = part(s.values[c]);
        if (!v) continue;
        const a = value(acc);
        const b = value(acc + v);
        acc += v;
        const geometry = horizontal
          ? { x: a, y: s0, w: b - a, h: slots.width }
          : { x: s0, y: b, w: slots.width, h: a - b };
        segments.push({
          index: segments.length,
          series: s.name,
          category,
          value: v,
          ...geometry,
          color: chartToneColor(s.tone),
          pattern: s.pattern,
          patternId: s.patternId,
          ariaLabel: `${s.name}, ${category}: ${this.formatValue(v)} (${formatChartShare(v, totals[c]!)})`,
        });
      }
      const end = value(totals[c]!);
      return {
        label: category,
        totalText: this.formatValue(totals[c]!),
        ...(horizontal
          ? {
              cx: pad.l - 6,
              cy: mid + 4,
              cAnchor: 'end',
              tx: end + 4,
              ty: mid + 4,
              tAnchor: 'start',
            }
          : { cx: mid, cy: h - 8, cAnchor: 'middle', tx: mid, ty: end - 4, tAnchor: 'middle' }),
      };
    });

    const ticks = linearTicks(dom, 4).map((v) => {
      const at = value(v);
      const text = formatChartNumber(v);
      return horizontal
        ? { x1: at, x2: at, y1: pad.t, y2: h - pad.b, tx: at, ty: h - 6, anchor: 'middle', text }
        : {
            x1: pad.l,
            x2: VIEW_WIDTH - pad.r,
            y1: at,
            y2: at,
            tx: pad.l - 6,
            ty: at + 4,
            anchor: 'end',
            text,
          };
    });
    const zero = value(0);
    const base = horizontal
      ? { x1: zero, x2: zero, y1: pad.t, y2: h - pad.b }
      : { x1: pad.l, x2: VIEW_WIDTH - pad.r, y1: zero, y2: zero };

    return {
      h,
      totals,
      segments,
      categories,
      ticks,
      base,
      patterns: series.filter((s) => s.pattern).map((s) => ({ id: s.patternId, d: s.pattern })),
      summary: `${this.label()}: ${cats
        .map((c, i) => `${c} ${this.formatValue(totals[i]!)}`)
        .join('; ')}. ${series.map((s) => s.name).join(', ')}.`,
    };
  });

  protected readonly roving = new ChartRoving(this.model);
  protected readonly descText = computed(() => this.description() || this.model()?.summary || '');

  protected readonly activeReadout = computed(() => {
    const s = this.model()?.segments[this.roving.active()];
    return s ? s.ariaLabel : '';
  });

  protected readonly legendItems = computed<ChartLegendItem[]>(() =>
    this.model()
      ? this.styled().map((s, i) => ({
          key: `${i}-${s.name}`,
          label: s.name,
          tone: s.tone,
          pattern: s.pattern,
        }))
      : [],
  );

  protected readonly tableData = computed<ChartTable>(() => {
    const m = this.model();
    if (!m) return { caption: this.label(), headers: [], rows: [] };
    const series = this.styled();
    const unit = this.unit() ? ` (${this.unit()})` : '';
    return {
      caption: this.label(),
      headers: [
        this.categoryHeader(),
        ...series.map((s) => s.name),
        `${this.totalHeader()}${unit}`,
      ],
      rows: this.categories().map((c, i) => [
        c,
        ...series.map((s) => formatChartNumber(part(s.values[i]))),
        formatChartNumber(m.totals[i]!),
      ]),
    };
  });

  protected selectSegment(s: RenderedSegment): void {
    this.roving.focus(s.index);
    this.segmentSelect.emit({ series: s.series, category: s.category, value: s.value });
  }

  protected onKey(event: KeyboardEvent, s: RenderedSegment): void {
    const m = this.model();
    if (!m) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectSegment(s);
      return;
    }
    const next = this.roving.move(event, s.index, m.segments.length);
    if (next !== null) this.segmentEls()[next]?.nativeElement.focus();
  }
}
