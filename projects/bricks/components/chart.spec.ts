import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxBarChart, type BarChartDatum } from './bar-chart';
import {
  CHART_TONES,
  bandScale,
  formatChartShare,
  seriesPattern,
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
import {
  BxLineChart,
  type LineChartBand,
  type LineChartMarker,
  type LineChartSelection,
  type LineChartSeries,
} from './line-chart';
import { BxDonutChart, type DonutChartSlice } from './donut-chart';
import {
  BxStackedBarChart,
  type StackedBarSelection,
  type StackedBarSeries,
} from './stacked-bar-chart';

@Component({
  imports: [BxLineChart],
  template: `
    <bx-line-chart
      id="line"
      [label]="label()"
      [description]="description()"
      [unit]="unit()"
      [axisMode]="axisMode()"
      [series]="series()"
      [bands]="bands()"
      [markers]="markers()"
      [height]="height()"
      emptyText="Nessun dato"
      tableLabel="Tabella dati"
      xHeader="Ciclo"
      yHeader="Resistenza"
      (pointSelect)="picked.set($event)"
    />
  `,
})
class LineHost {
  readonly label = signal('Internal resistance');
  readonly description = signal('');
  readonly unit = signal('mΩ');
  readonly axisMode = signal<'number' | 'time'>('number');
  readonly height = signal(200);
  readonly series = signal<readonly LineChartSeries[]>([
    {
      id: 'c1',
      name: 'Cell 1',
      points: [
        { x: 1, y: 12.4 },
        { x: 5, y: 14.1 },
        { x: 10, y: 16.5 },
      ],
    },
  ]);
  readonly bands = signal<readonly LineChartBand[]>([
    { min: 20, max: 30, tone: 'danger', label: 'Retire above 20 mΩ' },
  ]);
  readonly markers = signal<readonly LineChartMarker[]>([{ at: 5, label: 'Field event' }]);
  readonly picked = signal<LineChartSelection | null>(null);
}

async function renderLine() {
  const fixture = TestBed.createComponent(LineHost);
  await fixture.whenStable();
  return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
}

describe('chart-base helpers', () => {
  it('maps every chart tone to a semantic token variable and cycles defaults, dashes and shapes', () => {
    for (const tone of CHART_TONES) {
      expect(chartToneColor(tone)).toMatch(/^var\(--bx-/);
    }
    expect(seriesTone(0)).toBe('accent');
    expect(seriesTone(1, 'danger')).toBe('danger');
    expect(seriesDash(1, 1)).toBe('');
    expect(seriesDash(1, 3)).toBe('6 3');
    expect([0, 1, 2, 3].map(seriesShape)).toEqual(['circle', 'square', 'diamond', 'triangle']);
  });

  it('computes domains, scales, ticks, formatters and roving index steps', () => {
    expect(linearDomain([])).toEqual([0, 1]);
    expect(linearDomain([5, 5])).toEqual([4, 6]);
    expect(linearDomain([0, 0], { includeZero: true })).toEqual([0, 1]);
    expect(linearDomain([10, 20], { includeZero: true, padRatio: 0.1 })).toEqual([0, 22]);
    expect(linearDomain([-20, -10], { includeZero: true, padRatio: 0.1 })).toEqual([-22, 0]);
    const [lo, hi] = linearDomain([10, 20], { padRatio: 0.1 });
    expect(lo).toBeCloseTo(9);
    expect(hi).toBeCloseTo(21);

    const s = linearScale([0, 10], [0, 100], true);
    expect(s(5)).toBe(50);
    expect(s(-5)).toBe(0);
    expect(s(25)).toBe(100);
    expect(linearScale([3, 3], [10, 90])(3)).toBe(10);
    expect(linearTicks([0, 30], 4)).toEqual([0, 10, 20, 30]);

    expect(formatChartNumber(Number.NaN)).toBe('—');
    expect(formatChartNumber(0)).toBe('0');
    expect(formatChartNumber(1200)).toBe('1200');
    expect(formatChartNumber(12.345)).toBe('12.35');
    expect(formatChartTime(Number.NaN, 1000)).toBe('—');
    expect(formatChartTime(Date.UTC(2026, 10, 27, 9, 5), 6 * 3_600_000)).toBe('09:05');
    expect(formatChartTime(Date.UTC(2026, 10, 27, 9, 5), 7 * 86_400_000)).toBe('11-27');

    expect(stepChartIndex('ArrowRight', 2, 3)).toBe(0);
    expect(stepChartIndex('ArrowDown', 0, 3)).toBe(1);
    expect(stepChartIndex('ArrowLeft', 0, 3)).toBe(2);
    expect(stepChartIndex('ArrowUp', 2, 3)).toBe(1);
    expect(stepChartIndex('Home', 2, 3)).toBe(0);
    expect(stepChartIndex('End', 0, 3)).toBe(2);
    expect(stepChartIndex('Tab', 0, 3)).toBeNull();
    expect(stepChartIndex('ArrowRight', 0, 0)).toBeNull();
  });
});

describe('bx-line-chart', () => {
  it('draws SVG with title/desc, band, marker, latest meta and data table, and handles empty and non-finite inputs', async () => {
    const { fixture, host, el } = await renderLine();
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('group');
    expect(svg.querySelector('title')?.textContent).toBe('Internal resistance');
    expect(svg.querySelector('desc')?.textContent).toContain('Cell 1 (3 points, latest 16.5 mΩ)');
    expect(svg.querySelector('desc')?.textContent).toContain('Markers: Field event.');
    expect(el.querySelector('.meta')?.textContent?.trim()).toBe('16.5 mΩ');
    expect(svg.querySelectorAll('rect.band')).toHaveLength(1);
    expect(svg.querySelectorAll('line.marker')).toHaveLength(1);
    expect(svg.querySelectorAll('path.line')).toHaveLength(1);

    const rows = [...el.querySelectorAll('table.data-table tbody tr')].map((r) =>
      [...r.querySelectorAll('th, td')].map((c) => c.textContent?.trim()),
    );
    expect(rows).toEqual([
      ['1', '12.4'],
      ['5', '14.1'],
      ['10', '16.5'],
    ]);

    host.description.set('Riepilogo resistenza celle');
    host.height.set(Number.POSITIVE_INFINITY);
    host.series.set([
      {
        name: '<img src=x onerror=1>',
        points: [
          { x: 1, y: 12.4 },
          { x: Number.NaN, y: 99 },
        ],
      },
    ]);
    await fixture.whenStable();
    expect(el.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 800 200');
    expect(el.querySelector('svg desc')?.textContent).toBe('Riepilogo resistenza celle');
    expect(el.querySelector('svg path.line')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('g.datum')?.getAttribute('aria-label')).toContain(
      '<img src=x onerror=1>',
    );

    host.series.set([{ name: 'Bad', points: [{ x: Number.NaN, y: Number.POSITIVE_INFINITY }] }]);
    await fixture.whenStable();
    expect(el.querySelector('svg')).toBeNull();
    expect(el.querySelector('.empty')?.textContent?.trim()).toBe('Nessun dato');
  });

  it('differentiates four series with dashes and marker shapes, and separates focus, blur and hover states', async () => {
    const { fixture, host, el } = await renderLine();
    const t0 = Date.UTC(2026, 10, 27, 6, 0);
    const t1 = Date.UTC(2026, 10, 27, 12, 0);
    host.axisMode.set('time');
    host.series.set([
      {
        name: 'Cell 1',
        points: [
          { x: t0, y: 11 },
          { x: t1, y: 12 },
        ],
      },
      {
        name: 'Cell 2',
        tone: 'green',
        points: [
          { x: t0, y: 13 },
          { x: t1, y: 14 },
        ],
      },
      {
        name: 'Cell 3',
        tone: 'orange',
        points: [
          { x: t0, y: 15 },
          { x: t1, y: 16 },
        ],
      },
      {
        name: 'Cell 4',
        tone: 'blue',
        points: [
          { x: t0, y: 17 },
          { x: t1, y: 18 },
        ],
      },
    ]);
    await fixture.whenStable();

    const paths = [...el.querySelectorAll('svg.svg path.line')];
    expect(paths).toHaveLength(4);
    expect(paths.map((p) => p.getAttribute('stroke-dasharray'))).toEqual([
      null,
      '6 3',
      '2 3',
      '8 3 2 3',
    ]);
    expect(el.querySelectorAll('.legend-item')).toHaveLength(5);

    const points = [...el.querySelectorAll<SVGGElement>('g.datum')];
    expect(points).toHaveLength(8);
    expect(points[0]!.getAttribute('tabindex')).toBe('0');
    expect(points[1]!.getAttribute('tabindex')).toBe('-1');

    points[0]!.focus();
    points[0]!.dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(el.querySelector('.readout')?.textContent).toContain('Cell 1, 06:00: 11 mΩ');

    points[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(points[1]!.getAttribute('tabindex')).toBe('0');

    // Hovering and leaving another point while point 1 has focus keeps point 1's readout and tabStop.
    points[2]!.dispatchEvent(new MouseEvent('mouseenter'));
    points[2]!.dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(el.querySelector('.readout')?.textContent).toContain('Cell 1, 12:00: 12 mΩ');
    expect(points[1]!.getAttribute('tabindex')).toBe('0');

    points[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(host.picked()).toEqual({ series: 'Cell 1', x: t1, y: 12 });

    // Blurring clears the active readout while preserving the roving tabStop at index 1.
    points[1]!.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(el.querySelector('.readout')).toBeNull();
    expect(points[1]!.getAttribute('tabindex')).toBe('0');
  });
});

@Component({
  imports: [BxBarChart, BxStackedBarChart, BxDonutChart],
  template: `
    <bx-bar-chart
      label="Flights per month"
      unit="flights"
      [orientation]="orientation()"
      [bars]="bars()"
      categoryHeader="Mese"
      (barSelect)="pickedBar.set($event)"
    />
    <bx-stacked-bar-chart
      label="Records per status"
      [orientation]="orientation()"
      [categories]="categories()"
      [series]="stacks()"
      (segmentSelect)="pickedSegment.set($event)"
    />
    <bx-donut-chart
      label="Battery states"
      unit="packs"
      [slices]="slices()"
      [maxSlices]="maxSlices()"
      otherLabel="Altro"
      totalLabel="Totale"
      (sliceSelect)="pickedSlice.set($event)"
    />
  `,
})
class ChartsHost {
  readonly orientation = signal<'vertical' | 'horizontal'>('vertical');
  readonly bars = signal<readonly BarChartDatum[]>([
    { label: 'Sep', value: 4 },
    { label: 'Oct', value: 9 },
    { label: 'Nov', value: Number.NaN },
    { label: 'Dec', value: 6 },
  ]);
  readonly categories = signal<readonly string[]>(['alpha', 'beta']);
  readonly stacks = signal<readonly StackedBarSeries[]>([
    { name: 'Open', values: [3, 1] },
    { name: 'Done', values: [5, -2] },
    { name: 'Blocked', values: [Number.NaN, 2] },
  ]);
  readonly slices = signal<readonly DonutChartSlice[]>([
    { label: 'Ready', value: 6 },
    { label: 'Storage', value: 3 },
    { label: 'Check due', value: 1 },
  ]);
  readonly maxSlices = signal(6);
  readonly pickedBar = signal<BarChartDatum | null>(null);
  readonly pickedSegment = signal<StackedBarSelection | null>(null);
  readonly pickedSlice = signal<DonutChartSlice | null>(null);
}

async function renderCharts() {
  const fixture = TestBed.createComponent(ChartsHost);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const rows = (chart: string) =>
    [...el.querySelectorAll(`${chart} table.data-table tbody tr`)].map((r) =>
      [...r.querySelectorAll('th, td')].map((c) => c.textContent?.trim()),
    );
  return { fixture, host: fixture.componentInstance, el, rows };
}

describe('chart-base band, share and pattern helpers', () => {
  it('places bars in slots, formats shares and cycles fill patterns', () => {
    const b = bandScale(4, [0, 400], 0.5);
    expect([b.step, b.width, b.start(0), b.start(3)]).toEqual([100, 50, 25, 325]);
    expect(bandScale(0, [0, 400]).width).toBe(0);
    expect(formatChartShare(1, 3)).toBe('33.3 %');
    expect(formatChartShare(1, 0)).toBe('—');
    expect(seriesPattern(0)).toBe('');
    // one pattern per default tone, so no two default series share both
    expect(new Set([0, 1, 2, 3, 4, 5].map(seriesPattern)).size).toBe(6);
    expect(seriesPattern(6)).toBe('');
  });
});

describe('bx-bar-chart', () => {
  it('draws one bar per finite value with a value label, from zero, vertical and horizontal, with a data table', async () => {
    const { fixture, host, el, rows } = await renderCharts();
    const chart = el.querySelector('bx-bar-chart')!;
    const svg = chart.querySelector('svg')!;
    expect(svg.querySelector('title')?.textContent).toBe('Flights per month');
    expect(svg.querySelector('desc')?.textContent).toBe(
      'Flights per month: Sep: 4 flights; Oct: 9 flights; Dec: 6 flights.',
    );
    const bars = [...chart.querySelectorAll<SVGRectElement>('rect.bar')];
    expect(bars).toHaveLength(3);
    const heights = bars.map((r) => Number(r.getAttribute('height')));
    expect(heights[1]).toBeGreaterThan(heights[2]!);
    expect(heights[2]).toBeGreaterThan(heights[0]!);
    expect([...chart.querySelectorAll('text.value')].map((t) => t.textContent?.trim())).toEqual([
      '4 flights',
      '9 flights',
      '6 flights',
    ]);
    expect(rows('bx-bar-chart')).toEqual([
      ['Sep', '4'],
      ['Oct', '9'],
      ['Dec', '6'],
    ]);
    expect(chart.querySelector('thead')?.textContent).toContain('Mese');

    host.orientation.set('horizontal');
    await fixture.whenStable();
    const wide = [...chart.querySelectorAll<SVGRectElement>('rect.bar')].map((r) =>
      Number(r.getAttribute('width')),
    );
    expect(wide[1]).toBeGreaterThan(wide[0]!);

    const datums = [...chart.querySelectorAll<SVGGElement>('g.datum')];
    datums[0]!.dispatchEvent(new FocusEvent('focus'));
    datums[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(datums[2]!.getAttribute('tabindex')).toBe('0');
    expect(chart.querySelector('.readout')?.textContent).toContain('Dec: 6 flights');
    datums[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(host.pickedBar()).toEqual({ label: 'Dec', value: 6 });

    // a negative value hangs from the zero baseline, its label past its end, in both orientations
    host.bars.set([
      { label: 'Gain', value: 4 },
      { label: 'Loss', value: -2 },
    ]);
    for (const orientation of ['horizontal', 'vertical'] as const) {
      host.orientation.set(orientation);
      await fixture.whenStable();
      const base = chart.querySelector('line.baseline')!;
      const [gain, loss] = [...chart.querySelectorAll<SVGRectElement>('rect.bar')].map((r) => ({
        x: Number(r.getAttribute('x')),
        y: Number(r.getAttribute('y')),
        w: Number(r.getAttribute('width')),
        h: Number(r.getAttribute('height')),
      }));
      const lossLabel = chart.querySelectorAll('text.value')[1]!;
      if (orientation === 'horizontal') {
        const zero = Number(base.getAttribute('x1'));
        expect(gain!.x).toBeCloseTo(zero);
        expect(loss!.x + loss!.w).toBeCloseTo(zero);
        expect(lossLabel.getAttribute('text-anchor')).toBe('end');
        expect(Number(lossLabel.getAttribute('x'))).toBeLessThan(loss!.x);
      } else {
        const zero = Number(base.getAttribute('y1'));
        expect(gain!.y + gain!.h).toBeCloseTo(zero);
        expect(loss!.y).toBeCloseTo(zero);
        expect(Number(lossLabel.getAttribute('y'))).toBeGreaterThan(loss!.y + loss!.h);
      }
      expect(gain!.h > 0 && loss!.h > 0 && gain!.w > 0 && loss!.w > 0).toBe(true);
    }

    host.bars.set([{ label: 'Bad', value: Number.POSITIVE_INFINITY }]);
    await fixture.whenStable();
    expect(chart.querySelector('svg')).toBeNull();
    expect(chart.querySelector('.empty')?.textContent?.trim()).toBe('No data');
  });
});

describe('bx-stacked-bar-chart', () => {
  it('stacks non-negative parts per category with totals, patterns in bars and legend, and a table with totals', async () => {
    const { fixture, host, el, rows } = await renderCharts();
    const chart = el.querySelector('bx-stacked-bar-chart')!;
    // negative and non-finite parts count as nothing: alpha 3 + 5, beta 1 + 2
    expect(chart.querySelectorAll('rect.segment')).toHaveLength(4);
    expect([...chart.querySelectorAll('text.value')].map((t) => t.textContent?.trim())).toEqual([
      '8',
      '3',
    ]);
    expect(rows('bx-stacked-bar-chart')).toEqual([
      ['alpha', '3', '5', '0', '8'],
      ['beta', '1', '0', '2', '3'],
    ]);
    // series 2 and 3 carry a fill pattern in the bars and in their legend swatch: not colour alone
    expect(chart.querySelectorAll('svg.svg pattern')).toHaveLength(2);
    expect(chart.querySelectorAll('rect.overlay')).toHaveLength(2);
    expect(chart.querySelectorAll('.legend-item')).toHaveLength(3);
    expect(chart.querySelectorAll('.legend pattern')).toHaveLength(2);
    const labels = [...chart.querySelectorAll('g.datum')].map((g) => g.getAttribute('aria-label'));
    expect(labels).toEqual([
      'Open, alpha: 3 (37.5 %)',
      'Done, alpha: 5 (62.5 %)',
      'Open, beta: 1 (33.3 %)',
      'Blocked, beta: 2 (66.7 %)',
    ]);
    // pattern ids are unique per chart, so two charts on a page never share a fill
    const ids = [...el.querySelectorAll('pattern')].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    const datums = [...chart.querySelectorAll<SVGGElement>('g.datum')];
    datums[3]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(datums[0]!.getAttribute('tabindex')).toBe('0');
    datums[1]!.dispatchEvent(new MouseEvent('click'));
    expect(host.pickedSegment()).toEqual({ series: 'Done', category: 'alpha', value: 5 });

    host.stacks.set([{ name: 'Open', values: [0, -1] }]);
    await fixture.whenStable();
    expect(chart.querySelector('svg')).toBeNull();
  });
});

describe('bx-donut-chart', () => {
  it('draws shares with percentages and a centre total, and groups the smallest into Other past maxSlices', async () => {
    const { fixture, host, el, rows } = await renderCharts();
    const chart = el.querySelector('bx-donut-chart')!;
    expect(chart.querySelectorAll('path.slice')).toHaveLength(3);
    expect(chart.querySelector('text.total')?.textContent?.trim()).toBe('10 packs');
    expect(chart.querySelector('text.total-label')?.textContent?.trim()).toBe('Totale');
    expect([...chart.querySelectorAll('.legend-detail')].map((d) => d.textContent?.trim())).toEqual(
      ['6 packs · 60 %', '3 packs · 30 %', '1 packs · 10 %'],
    );
    expect(rows('bx-donut-chart')).toEqual([
      ['Ready', '6', '60 %'],
      ['Storage', '3', '30 %'],
      ['Check due', '1', '10 %'],
      ['Totale', '10', '100 %'],
    ]);

    host.slices.set([
      { label: 'A', value: 1 },
      { label: 'B', value: 8 },
      { label: 'C', value: 2 },
      { label: 'D', value: 5 },
      { label: 'E', value: 0 },
    ]);
    host.maxSlices.set(3);
    await fixture.whenStable();
    expect(rows('bx-donut-chart').map((r) => r[0])).toEqual(['B', 'D', 'Altro', 'Totale']);
    expect(rows('bx-donut-chart')[2]).toEqual(['Altro', '3', '18.8 %']);

    // one slice is a whole ring, drawn as two half arcs
    host.slices.set([{ label: 'Only', value: 4 }]);
    await fixture.whenStable();
    expect(chart.querySelector('path.slice')?.getAttribute('d')?.match(/M/g)).toHaveLength(2);
    const only = chart.querySelector<SVGGElement>('g.datum')!;
    only.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(host.pickedSlice()).toEqual({ label: 'Only', value: 4, tone: 'accent' });

    host.slices.set([{ label: 'Zero', value: 0 }]);
    await fixture.whenStable();
    expect(chart.querySelector('svg')).toBeNull();
  });
});
