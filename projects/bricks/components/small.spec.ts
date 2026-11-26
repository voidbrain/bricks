import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxAlert, type AlertAnnounce, type AlertTone } from './alert';
import { BxBadge } from './badge';
import { BxButton } from './button';
import { BxDisclosure } from './disclosure';
import { BxMeter } from './meter';

@Component({
  imports: [BxAlert, BxBadge, BxButton, BxDisclosure, BxMeter],
  template: `
    <bx-button id="sm" size="sm">Retry</bx-button>
    <bx-button id="md">Retry</bx-button>
    <bx-badge id="outline" tone="ok" appearance="outline">Approve ✓</bx-badge>
    <bx-badge id="dashed" tone="warn" appearance="dashed">Pending · shadow</bx-badge>
    <bx-badge id="neutral" tone="neutral" appearance="outline">Abstain</bx-badge>
    <bx-meter
      id="meter"
      label="Budget used"
      [value]="value()"
      [max]="200"
      [threshold]="threshold()"
      tone="warn"
    />
    <bx-meter id="words" label="Sync" [value]="40" valueText="40 percent, below threshold" />
    <bx-disclosure id="disc" summary="Show tools" [(open)]="open">
      <p>Inside</p>
    </bx-disclosure>
    <bx-alert id="alert" [tone]="tone()" [announce]="announce()">
      Shadow mode: votes are not counted.
      <bx-button bx-alert-actions size="sm">Dismiss</bx-button>
    </bx-alert>
  `,
})
class Host {
  readonly value = signal(50);
  readonly threshold = signal<number | null>(150);
  readonly open = signal(false);
  readonly tone = signal<AlertTone>('warn');
  readonly announce = signal<AlertAnnounce>('none');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('bx-button size', () => {
  it('marks a compact button and defaults to the normal size', async () => {
    const { el } = await render();
    expect(el.querySelector('#sm button')?.getAttribute('data-size')).toBe('sm');
    expect(el.querySelector('#md button')?.getAttribute('data-size')).toBe('md');
  });
});

describe('bx-badge appearance', () => {
  it('carries its appearance and tone', async () => {
    const { el } = await render();
    expect(el.querySelector('#outline')?.getAttribute('data-appearance')).toBe('outline');
    expect(el.querySelector('#dashed')?.getAttribute('data-appearance')).toBe('dashed');
    expect(el.querySelector('#neutral')?.getAttribute('data-tone')).toBe('neutral');
  });

  it('is solid by default', async () => {
    TestBed.overrideTemplate(Host, `<bx-badge>x</bx-badge>`);
    const { el } = await render();
    expect(el.querySelector('bx-badge')?.getAttribute('data-appearance')).toBe('solid');
  });
});

describe('bx-meter', () => {
  it('is a named meter with its range, value and a default value text', async () => {
    const { el } = await render();
    const m = el.querySelector('#meter')!;
    expect(m.getAttribute('role')).toBe('meter');
    expect(m.getAttribute('aria-label')).toBe('Budget used');
    expect(m.getAttribute('aria-valuemin')).toBe('0');
    expect(m.getAttribute('aria-valuemax')).toBe('200');
    expect(m.getAttribute('aria-valuenow')).toBe('50');
    expect(m.getAttribute('aria-valuetext')).toBe('50 of 200');
    expect(m.getAttribute('data-tone')).toBe('warn');
    expect(el.querySelector('#words')?.getAttribute('aria-valuetext')).toBe(
      '40 percent, below threshold',
    );
  });

  it('fills by value, clamps to the range and places the threshold mark', async () => {
    const { fixture, el } = await render();
    const fill = () => (el.querySelector('#meter .fill') as HTMLElement).style.inlineSize;
    const mark = () => el.querySelector('#meter .mark') as HTMLElement | null;
    expect(fill()).toBe('25%');
    expect(mark()?.style.insetInlineStart).toBe('75%');
    fixture.componentInstance.value.set(500);
    fixture.componentInstance.threshold.set(250);
    await fixture.whenStable();
    expect(fill()).toBe('100%');
    expect(el.querySelector('#meter')?.getAttribute('aria-valuenow')).toBe('200');
    expect(mark()).toBeNull();
    fixture.componentInstance.value.set(-5);
    fixture.componentInstance.threshold.set(null);
    await fixture.whenStable();
    expect(fill()).toBe('0%');
    expect(mark()).toBeNull();
  });
});

describe('bx-disclosure', () => {
  it('wraps a native details whose summary names it, bound two-way to open', async () => {
    const { fixture, el } = await render();
    const details = el.querySelector('#disc details') as HTMLDetailsElement;
    expect(details.querySelector('summary')?.textContent?.trim()).toBe('Show tools');
    expect(details.open).toBe(false);
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(details.open).toBe(true);
    details.open = false;
    details.dispatchEvent(new Event('toggle'));
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(details.querySelector('.content p')?.textContent).toBe('Inside');
  });
});

describe('bx-alert', () => {
  it('maps announce to note, status or alert and tone to an icon; actions go in their slot', async () => {
    const { fixture, el } = await render();
    const alert = el.querySelector('#alert')!;
    expect(alert.getAttribute('role')).toBe('note');
    expect(alert.getAttribute('data-tone')).toBe('warn');
    expect(alert.querySelector('.actions bx-button')?.textContent?.trim()).toBe('Dismiss');
    expect(alert.querySelector('.message')?.textContent).toContain('Shadow mode');
    expect(alert.querySelector('bx-icon svg')?.getAttribute('aria-hidden')).toBe('true');
    fixture.componentInstance.announce.set('assertive');
    fixture.componentInstance.tone.set('danger');
    await fixture.whenStable();
    expect(alert.getAttribute('role')).toBe('alert');
    fixture.componentInstance.announce.set('polite');
    await fixture.whenStable();
    expect(alert.getAttribute('role')).toBe('status');
  });
});
