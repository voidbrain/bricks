import {
  Component,
  ElementRef,
  computed,
  input,
  linkedSignal,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';
import {
  BxChartFrame,
  type ChartLegendItem,
  type ChartShape,
  type ChartTable,
  type ChartTone,
  chartToneColor,
  formatChartNumber,
  formatChartTime,
  linearDomain,
  linearScale,
  linearTicks,
  seriesDash,
  seriesShape,
  seriesTone,
  stepChartIndex,
} from './chart-base';

export interface LineChartPoint {
  readonly x: number;
  readonly y: number;
  readonly label?: string;
}

export interface LineChartSeries {
  readonly id?: string;
  readonly name: string;
  readonly points: readonly LineChartPoint[];
  readonly tone?: ChartTone;
}

export interface LineChartBand {
  readonly from?: number;
  readonly to?: number;
  readonly min: number;
  readonly max: number;
  readonly label?: string;
  readonly tone?: ChartTone;
}

export interface LineChartMarker {
  readonly at: number;
  readonly label: string;
}

export interface LineChartSelection {
  readonly series: string;
  readonly x: number;
  readonly y: number;
}

interface RenderedPoint {
  readonly flatIndex: number;
  readonly seriesName: string;
  readonly xVal: number;
  readonly yVal: number;
  readonly cx: number;
  readonly cy: number;
  readonly color: string;
  readonly shape: ChartShape;
  readonly ariaLabel: string;
}

const VIEW_WIDTH = 800;
const PAD = { l: 48, r: 16, t: 16, b: 28 };

let nextLineChartId = 0;

function validDomain(d: readonly [number, number] | null): readonly [number, number] | null {
  return d && Number.isFinite(d[0]) && Number.isFinite(d[1]) ? d : null;
}

/**
 * Plain-SVG line chart (`bx-line-chart`, F-014-T03): one or more series over a number or UTC-time axis,
 * optional target bands and vertical markers, non-colour series dashes and point shapes, roving keyboard
 * focus across points, `<title>` + `<desc>`, and a `<bx-disclosure>` data-table fallback.
 */
@Component({
  selector: 'bx-line-chart',
  imports: [BxChartFrame],
  template: `
    <bx-chart-frame
      [label]="label()"
      [meta]="metaText()"
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

          @for (b of m.bands; track $index) {
            <rect
              class="band"
              [attr.x]="b.x"
              [attr.y]="b.y"
              [attr.width]="b.w"
              [attr.height]="b.h"
              [style.--band-color]="b.color"
            />
            <line
              class="band-edge"
              [attr.x1]="b.x"
              [attr.x2]="b.x + b.w"
              [attr.y1]="b.y"
              [attr.y2]="b.y"
              [style.stroke]="b.color"
            />
            <line
              class="band-edge"
              [attr.x1]="b.x"
              [attr.x2]="b.x + b.w"
              [attr.y1]="b.y + b.h"
              [attr.y2]="b.y + b.h"
              [style.stroke]="b.color"
            />
          }

          @for (t of m.yTicks; track $index) {
            <line
              class="grid"
              [attr.x1]="pad.l"
              [attr.x2]="viewWidth - pad.r"
              [attr.y1]="t.y"
              [attr.y2]="t.y"
            />
            <text class="tick" [attr.x]="pad.l - 6" [attr.y]="t.y + 4" text-anchor="end">
              {{ t.text }}
            </text>
          }

          @for (mk of m.markers; track $index) {
            <line
              class="marker"
              [attr.x1]="mk.x"
              [attr.x2]="mk.x"
              [attr.y1]="pad.t"
              [attr.y2]="m.h - pad.b"
            >
              <title>{{ mk.label }}</title>
            </line>
          }

          @for (s of m.lines; track s.key) {
            @if (s.path) {
              <path
                class="line"
                [attr.d]="s.path"
                [style.stroke]="s.color"
                [attr.stroke-dasharray]="s.dash || null"
              />
            }
          }

          @for (p of m.points; track p.flatIndex) {
            <g
              #datumEl
              class="datum"
              role="button"
              [attr.tabindex]="tabStopIndex() === p.flatIndex ? 0 : -1"
              [attr.aria-label]="p.ariaLabel"
              [attr.data-hovered]="hoveredIndex() === p.flatIndex ? '' : null"
              (focus)="onFocus(p.flatIndex)"
              (blur)="onBlur(p.flatIndex)"
              (mouseenter)="hoveredIndex.set(p.flatIndex)"
              (mouseleave)="onLeave(p.flatIndex)"
              (click)="selectPoint(p)"
              (keydown)="onKey($event, p)"
            >
              <circle class="hit" [attr.cx]="p.cx" [attr.cy]="p.cy" r="10" />
              @switch (p.shape) {
                @case ('square') {
                  <rect
                    class="glyph"
                    [attr.x]="p.cx - 3.5"
                    [attr.y]="p.cy - 3.5"
                    width="7"
                    height="7"
                    [style.fill]="p.color"
                  />
                }
                @case ('diamond') {
                  <polygon
                    class="glyph"
                    [attr.points]="diamondPoints(p.cx, p.cy, 4.5)"
                    [style.fill]="p.color"
                  />
                }
                @case ('triangle') {
                  <polygon
                    class="glyph"
                    [attr.points]="trianglePoints(p.cx, p.cy, 4.5)"
                    [style.fill]="p.color"
                  />
                }
                @default {
                  <circle
                    class="glyph"
                    [attr.cx]="p.cx"
                    [attr.cy]="p.cy"
                    r="3.5"
                    [style.fill]="p.color"
                  />
                }
              }
            </g>
          }

          <text class="tick" [attr.x]="pad.l" [attr.y]="m.h - 6">{{ m.xStart }}</text>
          @if (m.xMid) {
            <text
              class="tick"
              [attr.x]="(pad.l + viewWidth - pad.r) / 2"
              [attr.y]="m.h - 6"
              text-anchor="middle"
            >
              {{ m.xMid }}
            </text>
          }
          <text class="tick" [attr.x]="viewWidth - pad.r" [attr.y]="m.h - 6" text-anchor="end">
            {{ m.xEnd }}
          </text>
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
    .band {
      fill: color-mix(in srgb, var(--band-color) var(--bx-chart-band-tint), transparent);
    }
    .band-edge {
      stroke-dasharray: 4 4;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .grid {
      stroke: var(--bx-chart-grid);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .marker {
      stroke: var(--bx-chart-axis);
      stroke-dasharray: 3 3;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .tick {
      fill: var(--bx-chart-axis);
      font-size: var(--bx-font-size-xs);
      font-family: var(--bx-font);
    }
    .line {
      fill: none;
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
    .datum {
      cursor: pointer;
      outline: none;
    }
    .hit {
      fill: transparent;
    }
    .glyph {
      stroke: var(--bx-chart-bg);
      stroke-width: 1.5;
    }
    .datum[data-hovered] .hit {
      stroke: var(--bx-chart-axis);
      stroke-width: 1;
    }
    .datum:focus-visible .hit,
    .datum:focus .hit {
      stroke: var(--bx-focus);
      stroke-width: var(--bx-focus-width);
    }
  `,
})
export class BxLineChart {
  readonly label = input.required<string>();
  /** Optional translated override for the SVG `<desc>` summary. */
  readonly description = input('');
  readonly unit = input('');
  readonly axisMode = input<'number' | 'time'>('number');
  readonly series = input<readonly LineChartSeries[]>([]);
  readonly bands = input<readonly LineChartBand[]>([]);
  readonly markers = input<readonly LineChartMarker[]>([]);
  readonly domainX = input<readonly [number, number] | null>(null);
  readonly domainY = input<readonly [number, number] | null>(null);
  readonly height = input(200, { transform: (v: unknown) => numberAttribute(v, 200) });
  readonly emptyText = input('No data');
  readonly tableLabel = input('Data table');
  readonly legendLabel = input('Series');
  readonly xHeader = input('X');
  readonly yHeader = input('Value');

  readonly pointSelect = output<LineChartSelection>();

  protected readonly viewWidth = VIEW_WIDTH;
  protected readonly pad = PAD;
  private readonly uid = nextLineChartId++;
  protected readonly svgTitleId = `bx-line-title-${this.uid}`;
  protected readonly svgDescId = `bx-line-desc-${this.uid}`;
  private readonly datumEls = viewChildren<ElementRef<SVGGElement>>('datumEl');

  private formatX(x: number, span: number): string {
    return this.axisMode() === 'time' ? formatChartTime(x, span) : formatChartNumber(x);
  }

  private formatY(y: number): string {
    const u = this.unit();
    return u ? `${formatChartNumber(y)} ${u}` : formatChartNumber(y);
  }

  protected readonly model = computed(() => {
    const cleaned = this.series()
      .map((s) => ({
        ...s,
        points: s.points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
      }))
      .filter((s) => s.points.length > 0);
    if (!cleaned.length) return null;

    const rawH = this.height();
    const h = Number.isFinite(rawH) && rawH > 0 ? Math.max(120, rawH) : 200;
    const allX = cleaned.flatMap((s) => s.points.map((p) => p.x));
    const xDom = validDomain(this.domainX()) ?? linearDomain(allX);
    const x0 = xDom[0];
    const x1 = Math.max(xDom[1], x0 + 1e-6);
    const xSpan = x1 - x0;

    const visibleBands = this.bands().filter((b) => {
      const bf = b.from ?? x0;
      const bt = b.to ?? x1;
      return (
        Number.isFinite(b.min) &&
        Number.isFinite(b.max) &&
        Number.isFinite(bf) &&
        Number.isFinite(bt) &&
        bt > x0 &&
        bf < x1
      );
    });
    const allY = [
      ...cleaned.flatMap((s) => s.points.map((p) => p.y)),
      ...visibleBands.flatMap((b) => [b.min, b.max]),
    ];
    const yDom = validDomain(this.domainY()) ?? linearDomain(allY, { padRatio: 0.08 });

    const scaleX = linearScale([x0, x1], [PAD.l, VIEW_WIDTH - PAD.r], true);
    const scaleY = linearScale(yDom, [h - PAD.b, PAD.t]);

    const points: RenderedPoint[] = [];
    let flatIndex = 0;
    const lines = cleaned.map((s, idx) => {
      const tone = seriesTone(idx, s.tone);
      const color = chartToneColor(tone);
      const dash = seriesDash(idx, cleaned.length);
      const shape = seriesShape(idx);
      const path =
        s.points.length >= 2
          ? s.points
              .map((p, i) => `${i ? 'L' : 'M'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`)
              .join('')
          : '';
      for (const p of s.points) {
        const xLabel = p.label ?? this.formatX(p.x, xSpan);
        const yLabel = this.formatY(p.y);
        points.push({
          flatIndex: flatIndex++,
          seriesName: s.name,
          xVal: p.x,
          yVal: p.y,
          cx: Number(scaleX(p.x).toFixed(1)),
          cy: Number(scaleY(p.y).toFixed(1)),
          color,
          shape,
          ariaLabel: `${s.name}, ${xLabel}: ${yLabel}`,
        });
      }
      return {
        key: s.id ?? `${idx}-${s.name}`,
        name: s.name,
        points: s.points,
        count: s.points.length,
        tone,
        color,
        dash,
        shape,
        path,
        last: s.points.at(-1)!,
      };
    });

    const yTicks = linearTicks(yDom, 4).map((v) => ({
      v,
      y: Number(scaleY(v).toFixed(1)),
      text: formatChartNumber(v),
    }));

    const bands = visibleBands.map((b) => {
      const bx0 = scaleX(b.from ?? x0);
      const bx1 = scaleX(b.to ?? x1);
      const byTop = scaleY(b.max);
      const byBot = scaleY(b.min);
      return {
        x: bx0,
        w: Math.max(0, bx1 - bx0),
        y: Math.min(byTop, byBot),
        h: Math.abs(byBot - byTop),
        color: chartToneColor(b.tone ?? 'ok'),
        label: b.label,
        tone: b.tone ?? 'ok',
      };
    });

    const markers = this.markers()
      .filter((m) => Number.isFinite(m.at) && m.at >= x0 && m.at <= x1)
      .map((m) => ({ x: Number(scaleX(m.at).toFixed(1)), label: m.label }));

    const summaryParts = lines.map((l) => {
      const noun = l.count === 1 ? '1 point' : `${l.count} points`;
      return `${l.name} (${noun}, latest ${this.formatY(l.last.y)})`;
    });
    const markerNote = markers.length
      ? ` Markers: ${markers.map((mk) => mk.label).join(', ')}.`
      : '';

    return {
      h,
      xSpan,
      lines,
      points,
      yTicks,
      bands,
      markers,
      xStart: this.formatX(x0, xSpan),
      xMid: points.length > 2 ? this.formatX(x0 + xSpan / 2, xSpan) : '',
      xEnd: this.formatX(x1, xSpan),
      summary: `${this.label()}: ${summaryParts.join('; ')}.${markerNote}`,
    };
  });

  protected readonly descText = computed(() => this.description() || this.model()?.summary || '');
  protected readonly tabStopIndex = linkedSignal({ source: this.model, computation: () => 0 });
  protected readonly focusedIndex = linkedSignal({ source: this.model, computation: () => -1 });
  protected readonly hoveredIndex = linkedSignal({ source: this.model, computation: () => -1 });
  protected readonly activeIndex = computed(() => {
    const f = this.focusedIndex();
    return f >= 0 ? f : this.hoveredIndex();
  });

  protected readonly metaText = computed(() => {
    const m = this.model();
    if (!m || m.lines.length !== 1) return '';
    return this.formatY(m.lines[0]!.last.y);
  });

  protected readonly activeReadout = computed(() => {
    const m = this.model();
    const idx = this.activeIndex();
    if (!m || idx < 0 || idx >= m.points.length) return '';
    return m.points[idx]!.ariaLabel;
  });

  protected readonly legendItems = computed<ChartLegendItem[]>(() => {
    const m = this.model();
    if (!m) return [];
    const items: ChartLegendItem[] =
      m.lines.length > 1
        ? m.lines.map((l) => ({
            key: l.key,
            label: l.name,
            tone: l.tone,
            dash: l.dash,
            shape: l.shape,
            detail: this.formatY(l.last.y),
          }))
        : [];
    for (const [i, b] of m.bands.entries()) {
      if (b.label) {
        items.push({ key: `band-${i}`, label: b.label, tone: b.tone });
      }
    }
    return items;
  });

  protected readonly tableData = computed<ChartTable>(() => {
    const m = this.model();
    if (!m) return { caption: this.label(), headers: [], rows: [] };
    const multi = m.lines.length > 1;
    const yHead = this.unit() ? `${this.yHeader()} (${this.unit()})` : this.yHeader();
    const headers = multi ? [this.legendLabel(), this.xHeader(), yHead] : [this.xHeader(), yHead];
    const rows = m.lines.flatMap((l) =>
      l.points.map((p) => {
        const xText = p.label ?? this.formatX(p.x, m.xSpan);
        const yText = formatChartNumber(p.y);
        return multi ? [l.name, xText, yText] : [xText, yText];
      }),
    );
    return { caption: this.label(), headers, rows };
  });

  protected diamondPoints(cx: number, cy: number, r: number): string {
    return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
  }

  protected trianglePoints(cx: number, cy: number, r: number): string {
    return `${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}`;
  }

  protected onFocus(index: number): void {
    this.tabStopIndex.set(index);
    this.focusedIndex.set(index);
  }

  protected onBlur(index: number): void {
    if (this.focusedIndex() === index) this.focusedIndex.set(-1);
  }

  protected onLeave(index: number): void {
    if (this.hoveredIndex() === index) this.hoveredIndex.set(-1);
  }

  protected selectPoint(p: RenderedPoint): void {
    this.tabStopIndex.set(p.flatIndex);
    this.focusedIndex.set(p.flatIndex);
    this.pointSelect.emit({ series: p.seriesName, x: p.xVal, y: p.yVal });
  }

  protected onKey(event: KeyboardEvent, p: RenderedPoint): void {
    const m = this.model();
    if (!m) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectPoint(p);
      return;
    }
    const next = stepChartIndex(event.key, p.flatIndex, m.points.length);
    if (next !== null) {
      event.preventDefault();
      this.tabStopIndex.set(next);
      this.focusedIndex.set(next);
      this.datumEls()[next]?.nativeElement.focus();
    }
  }
}
