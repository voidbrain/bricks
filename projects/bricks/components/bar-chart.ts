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
  type ChartTable,
  type ChartTone,
  ChartRoving,
  bandScale,
  chartToneColor,
  formatChartNumber,
  linearDomain,
  linearScale,
  linearTicks,
} from './chart-base';

export interface BarChartDatum {
  readonly label: string;
  readonly value: number;
}

interface RenderedBar {
  readonly index: number;
  readonly datum: BarChartDatum;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** Where the value label sits, and its anchor. */
  readonly vx: number;
  readonly vy: number;
  readonly vAnchor: 'start' | 'middle' | 'end';
  /** Where the category label sits. */
  readonly cx: number;
  readonly cy: number;
  readonly valueText: string;
  readonly ariaLabel: string;
}

const VIEW_WIDTH = 800;
const PAD_VERTICAL = { l: 48, r: 16, t: 20, b: 28 };
const PAD_HORIZONTAL = { l: 140, r: 56, t: 8, b: 24 };

let nextBarChartId = 0;

/**
 * Plain-SVG bar chart (`bx-bar-chart`, F-014-T04): one series of values per category or period, vertical or
 * horizontal, from a zero baseline, a value label on every bar, roving keyboard focus across bars, `<title>` +
 * `<desc>`, and the shared frame's data table.
 */
@Component({
  selector: 'bx-bar-chart',
  imports: [BxChartFrame],
  template: `
    <bx-chart-frame
      [label]="label()"
      [empty]="!model()"
      [emptyText]="emptyText()"
      [activeText]="activeReadout()"
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

          @for (t of m.ticks; track $index) {
            <line class="grid" [attr.x1]="t.x1" [attr.x2]="t.x2" [attr.y1]="t.y1" [attr.y2]="t.y2" />
            <text class="tick" [attr.x]="t.tx" [attr.y]="t.ty" [attr.text-anchor]="t.anchor">
              {{ t.text }}
            </text>
          }

          @for (b of m.bars; track b.index) {
            <g
              #barEl
              class="datum"
              role="button"
              [attr.tabindex]="roving.tabStop() === b.index ? 0 : -1"
              [attr.aria-label]="b.ariaLabel"
              [attr.data-hovered]="roving.hovered() === b.index ? '' : null"
              (focus)="roving.focus(b.index)"
              (blur)="roving.blur(b.index)"
              (mouseenter)="roving.hovered.set(b.index)"
              (mouseleave)="roving.leave(b.index)"
              (click)="selectBar(b)"
              (keydown)="onKey($event, b)"
            >
              <rect
                class="bar"
                [attr.x]="b.x"
                [attr.y]="b.y"
                [attr.width]="b.w"
                [attr.height]="b.h"
                [style.fill]="color()"
              />
              <text class="value" [attr.x]="b.vx" [attr.y]="b.vy" [attr.text-anchor]="b.vAnchor">
                {{ b.valueText }}
              </text>
              <text
                class="tick"
                [attr.x]="b.cx"
                [attr.y]="b.cy"
                [attr.text-anchor]="m.horizontal ? 'end' : 'middle'"
              >
                {{ b.datum.label }}
              </text>
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
    .datum {
      cursor: pointer;
      outline: none;
    }
    .datum[data-hovered] .bar {
      stroke: var(--bx-chart-axis);
      stroke-width: 1;
    }
    .datum:focus-visible .bar,
    .datum:focus .bar {
      stroke: var(--bx-focus);
      stroke-width: var(--bx-focus-width);
    }
  `,
})
export class BxBarChart {
  readonly label = input.required<string>();
  /** Optional translated override for the SVG `<desc>` summary. */
  readonly description = input('');
  readonly unit = input('');
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly bars = input<readonly BarChartDatum[]>([]);
  readonly tone = input<ChartTone>('accent');
  readonly height = input(200, { transform: (v: unknown) => numberAttribute(v, 200) });
  readonly emptyText = input('No data');
  readonly tableLabel = input('Data table');
  readonly categoryHeader = input('Category');
  readonly valueHeader = input('Value');

  readonly barSelect = output<BarChartDatum>();

  protected readonly viewWidth = VIEW_WIDTH;
  private readonly uid = nextBarChartId++;
  protected readonly svgTitleId = `bx-bar-title-${this.uid}`;
  protected readonly svgDescId = `bx-bar-desc-${this.uid}`;
  private readonly barEls = viewChildren<ElementRef<SVGGElement>>('barEl');

  protected readonly color = computed(() => chartToneColor(this.tone()));

  private formatValue(v: number): string {
    const u = this.unit();
    return u ? `${formatChartNumber(v)} ${u}` : formatChartNumber(v);
  }

  protected readonly model = computed(() => {
    const data = this.bars().filter((d) => Number.isFinite(d.value));
    if (!data.length) return null;
    const horizontal = this.orientation() === 'horizontal';
    const pad = horizontal ? PAD_HORIZONTAL : PAD_VERTICAL;
    const rawH = this.height();
    const minH = horizontal ? pad.t + pad.b + data.length * 24 : 120;
    const h = Math.max(minH, Number.isFinite(rawH) && rawH > 0 ? rawH : 200);
    const dom = linearDomain(
      data.map((d) => d.value),
      { includeZero: true, padRatio: 0.08 },
    );
    // the value axis runs left to right when horizontal, bottom to top when vertical
    const value = horizontal
      ? linearScale(dom, [pad.l, VIEW_WIDTH - pad.r])
      : linearScale(dom, [h - pad.b, pad.t]);
    const slots = horizontal
      ? bandScale(data.length, [pad.t, h - pad.b])
      : bandScale(data.length, [pad.l, VIEW_WIDTH - pad.r]);
    const zero = value(0);

    const bars: RenderedBar[] = data.map((datum, index) => {
      const end = value(datum.value);
      const lo = Math.min(zero, end);
      const len = Math.abs(end - zero);
      const s = slots.start(index);
      const mid = s + slots.width / 2;
      const valueText = this.formatValue(datum.value);
      const neg = datum.value < 0;
      const common = { index, datum, valueText, ariaLabel: `${datum.label}: ${valueText}` };
      return horizontal
        ? {
            ...common,
            x: lo,
            y: s,
            w: len,
            h: slots.width,
            vx: neg ? lo - 4 : lo + len + 4,
            vy: mid + 4,
            vAnchor: neg ? 'end' : 'start',
            cx: pad.l - 6,
            cy: mid + 4,
          }
        : {
            ...common,
            x: s,
            y: lo,
            w: slots.width,
            h: len,
            vx: mid,
            vy: neg ? lo + len + 14 : lo - 4,
            vAnchor: 'middle',
            cx: mid,
            cy: h - 8,
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
    const base = horizontal
      ? { x1: zero, x2: zero, y1: pad.t, y2: h - pad.b }
      : { x1: pad.l, x2: VIEW_WIDTH - pad.r, y1: zero, y2: zero };

    return {
      h,
      horizontal,
      bars,
      ticks,
      base,
      summary: `${this.label()}: ${bars.map((b) => b.ariaLabel).join('; ')}.`,
    };
  });

  protected readonly roving = new ChartRoving(this.model);
  protected readonly descText = computed(() => this.description() || this.model()?.summary || '');

  protected readonly activeReadout = computed(() => {
    const bar = this.model()?.bars[this.roving.active()];
    return bar ? bar.ariaLabel : '';
  });

  protected readonly tableData = computed<ChartTable>(() => {
    const m = this.model();
    const valueHead = this.unit() ? `${this.valueHeader()} (${this.unit()})` : this.valueHeader();
    return {
      caption: this.label(),
      headers: m ? [this.categoryHeader(), valueHead] : [],
      rows: m ? m.bars.map((b) => [b.datum.label, formatChartNumber(b.datum.value)]) : [],
    };
  });

  protected selectBar(b: RenderedBar): void {
    this.roving.focus(b.index);
    this.barSelect.emit(b.datum);
  }

  protected onKey(event: KeyboardEvent, b: RenderedBar): void {
    const m = this.model();
    if (!m) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectBar(b);
      return;
    }
    const next = this.roving.move(event, b.index, m.bars.length);
    if (next !== null) this.barEls()[next]?.nativeElement.focus();
  }
}
