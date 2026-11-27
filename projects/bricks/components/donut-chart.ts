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
  chartToneColor,
  formatChartNumber,
  formatChartShare,
  seriesPattern,
  seriesTone,
} from './chart-base';

export interface DonutChartSlice {
  readonly label: string;
  readonly value: number;
  readonly tone?: ChartTone;
}

interface RenderedSlice {
  readonly index: number;
  readonly label: string;
  readonly value: number;
  readonly tone: ChartTone;
  readonly color: string;
  readonly pattern: string;
  readonly patternId: string;
  readonly path: string;
  readonly share: string;
  readonly ariaLabel: string;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const OUTER = 92;
const INNER = 58;

let nextDonutId = 0;

/** The SVG path of a ring sector from angle `a0` to `a1` (radians, clockwise from twelve o'clock). */
function donutArc(a0: number, a1: number, outer = OUTER, inner = INNER): string {
  const full = a1 - a0 >= 2 * Math.PI - 1e-9;
  // a whole ring is drawn as two halves: one arc cannot start and end at the same point
  if (full)
    return donutArc(a0, a0 + Math.PI, outer, inner) + donutArc(a0 + Math.PI, a1, outer, inner);
  const at = (r: number, a: number) =>
    `${(CENTER + r * Math.sin(a)).toFixed(2)},${(CENTER - r * Math.cos(a)).toFixed(2)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return (
    `M${at(outer, a0)}A${outer},${outer} 0 ${large} 1 ${at(outer, a1)}` +
    `L${at(inner, a1)}A${inner},${inner} 0 ${large} 0 ${at(inner, a0)}Z`
  );
}

/**
 * Plain-SVG donut (`bx-donut-chart`, F-014-T06): shares of a whole with labels and percentages, a centre total,
 * at most `maxSlices` slices (the smallest grouped into an Other slice), slices told apart by colour and a fill
 * pattern (legend included), roving keyboard focus across slices, `<title>` + `<desc>`, and the shared frame's
 * data table.
 */
@Component({
  selector: 'bx-donut-chart',
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
          [attr.viewBox]="'0 0 ' + size + ' ' + size"
          role="group"
          [attr.aria-labelledby]="svgTitleId"
          [attr.aria-describedby]="svgDescId"
        >
          <title [id]="svgTitleId">{{ label() }}</title>
          <desc [id]="svgDescId">{{ descText() }}</desc>
          <defs>
            @for (s of m.slices; track s.index) {
              @if (s.pattern) {
                <pattern [id]="s.patternId" width="12" height="12" patternUnits="userSpaceOnUse">
                  <path class="pattern-mark" [attr.d]="s.pattern" />
                </pattern>
              }
            }
          </defs>

          @for (s of m.slices; track s.index) {
            <g
              #sliceEl
              class="datum"
              role="button"
              [attr.tabindex]="roving.tabStop() === s.index ? 0 : -1"
              [attr.aria-label]="s.ariaLabel"
              [attr.data-hovered]="roving.hovered() === s.index ? '' : null"
              (focus)="roving.focus(s.index)"
              (blur)="roving.blur(s.index)"
              (mouseenter)="roving.hovered.set(s.index)"
              (mouseleave)="roving.leave(s.index)"
              (click)="selectSlice(s)"
              (keydown)="onKey($event, s)"
            >
              <path class="slice" [attr.d]="s.path" [style.fill]="s.color" />
              @if (s.pattern) {
                <path class="overlay" [attr.d]="s.path" [attr.fill]="'url(#' + s.patternId + ')'" />
              }
            </g>
          }

          <text class="total-label" [attr.x]="center" [attr.y]="center - 8" text-anchor="middle">
            {{ totalLabel() }}
          </text>
          <text class="total" [attr.x]="center" [attr.y]="center + 14" text-anchor="middle">
            {{ m.totalText }}
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
      max-inline-size: calc(var(--bx-space-4) * 15);
      block-size: auto;
      margin-inline: auto;
    }
    .pattern-mark {
      fill: var(--bx-chart-bg);
      stroke: var(--bx-chart-bg);
      stroke-width: 2;
    }
    .slice {
      stroke: var(--bx-chart-bg);
      stroke-width: 1.5;
    }
    .total-label {
      fill: var(--bx-chart-axis);
      font-size: var(--bx-font-size-xs);
      font-family: var(--bx-font);
    }
    .total {
      fill: var(--bx-chart-fg);
      font-size: var(--bx-font-size-lg);
      font-weight: var(--bx-font-weight-bold);
      font-family: var(--bx-font);
      font-variant-numeric: tabular-nums;
    }
    .datum {
      cursor: pointer;
      outline: none;
    }
    .datum[data-hovered] .slice {
      stroke: var(--bx-chart-axis);
    }
    .datum:focus-visible .slice,
    .datum:focus .slice {
      stroke: var(--bx-focus);
      stroke-width: var(--bx-focus-width);
    }
  `,
})
export class BxDonutChart {
  readonly label = input.required<string>();
  /** Optional translated override for the SVG `<desc>` summary. */
  readonly description = input('');
  readonly unit = input('');
  readonly slices = input<readonly DonutChartSlice[]>([]);
  /** The most slices drawn; past it the smallest are grouped into one `otherLabel` slice. */
  readonly maxSlices = input(6, { transform: (v: unknown) => numberAttribute(v, 6) });
  readonly otherLabel = input('Other');
  readonly totalLabel = input('Total');
  readonly emptyText = input('No data');
  readonly tableLabel = input('Data table');
  readonly legendLabel = input('Slices');
  readonly sliceHeader = input('Slice');
  readonly valueHeader = input('Value');
  readonly shareHeader = input('Share');

  /** The picked slice; for the Other slice, `otherLabel` and the grouped total. */
  readonly sliceSelect = output<DonutChartSlice>();

  protected readonly size = SIZE;
  protected readonly center = CENTER;
  private readonly uid = nextDonutId++;
  protected readonly svgTitleId = `bx-donut-title-${this.uid}`;
  protected readonly svgDescId = `bx-donut-desc-${this.uid}`;
  private readonly sliceEls = viewChildren<ElementRef<SVGGElement>>('sliceEl');

  private formatValue(v: number): string {
    const u = this.unit();
    return u ? `${formatChartNumber(v)} ${u}` : formatChartNumber(v);
  }

  protected readonly model = computed(() => {
    const given = this.slices().filter((s) => Number.isFinite(s.value) && s.value > 0);
    if (!given.length) return null;
    const max = Math.max(2, Math.trunc(this.maxSlices()) || 6);
    // keep the largest max - 1 in their given order and group the rest, when there are more than max
    let kept: readonly DonutChartSlice[] = given;
    if (given.length > max) {
      const largest = new Set([...given].sort((a, b) => b.value - a.value).slice(0, max - 1));
      const rest = given.filter((s) => !largest.has(s));
      kept = [
        ...given.filter((s) => largest.has(s)),
        { label: this.otherLabel(), value: rest.reduce((sum, s) => sum + s.value, 0) },
      ];
    }
    const total = kept.reduce((sum, s) => sum + s.value, 0);
    let angle = 0;
    const slices: RenderedSlice[] = kept.map((s, index) => {
      const a0 = angle;
      angle += (s.value / total) * 2 * Math.PI;
      const tone = seriesTone(index, s.tone);
      const share = formatChartShare(s.value, total);
      return {
        index,
        label: s.label,
        value: s.value,
        tone,
        color: chartToneColor(tone),
        pattern: seriesPattern(index),
        patternId: `bx-donut-${this.uid}-p${index}`,
        path: donutArc(a0, angle),
        share,
        ariaLabel: `${s.label}: ${this.formatValue(s.value)} (${share})`,
      };
    });
    const totalText = this.formatValue(total);
    return {
      slices,
      total,
      totalText,
      summary: `${this.label()}: ${slices.map((s) => s.ariaLabel).join('; ')}. ${this.totalLabel()} ${totalText}.`,
    };
  });

  protected readonly roving = new ChartRoving(this.model);
  protected readonly descText = computed(() => this.description() || this.model()?.summary || '');

  protected readonly activeReadout = computed(() => {
    const s = this.model()?.slices[this.roving.active()];
    return s ? s.ariaLabel : '';
  });

  protected readonly legendItems = computed<ChartLegendItem[]>(
    () =>
      this.model()?.slices.map((s) => ({
        key: `${s.index}-${s.label}`,
        label: s.label,
        tone: s.tone,
        pattern: s.pattern,
        detail: `${this.formatValue(s.value)} · ${s.share}`,
      })) ?? [],
  );

  protected readonly tableData = computed<ChartTable>(() => {
    const m = this.model();
    const valueHead = this.unit() ? `${this.valueHeader()} (${this.unit()})` : this.valueHeader();
    return {
      caption: this.label(),
      headers: m ? [this.sliceHeader(), valueHead, this.shareHeader()] : [],
      rows: m
        ? [
            ...m.slices.map((s) => [s.label, formatChartNumber(s.value), s.share]),
            [this.totalLabel(), formatChartNumber(m.total), '100 %'],
          ]
        : [],
    };
  });

  protected selectSlice(s: RenderedSlice): void {
    this.roving.focus(s.index);
    this.sliceSelect.emit({ label: s.label, value: s.value, tone: s.tone });
  }

  protected onKey(event: KeyboardEvent, s: RenderedSlice): void {
    const m = this.model();
    if (!m) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectSlice(s);
      return;
    }
    const next = this.roving.move(event, s.index, m.slices.length);
    if (next !== null) this.sliceEls()[next]?.nativeElement.focus();
  }
}
