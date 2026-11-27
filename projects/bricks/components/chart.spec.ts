import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CHART_TONES,
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
