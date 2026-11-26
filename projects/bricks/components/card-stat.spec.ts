import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxBadge } from './badge';
import { BxCard } from './card';
import { BxStat } from './stat';

@Component({
  imports: [BxCard, BxBadge, BxStat],
  template: `
    <bx-card heading="Relay status" [headingLevel]="level()" id="headed">
      <bx-badge bx-card-meta tone="ok">3 online</bx-badge>
      <p>Body</p>
    </bx-card>
    <bx-card heading="Fixed id" headingId="fixed-heading" label="Ignored" id="fixed"><p>Body</p></bx-card>
    <bx-card heading="No meta" id="bare"><p>Body</p></bx-card>
    <bx-stat label="Queue depth" value="12" detail="last hour" id="full" />
    <bx-stat label="Uptime" [value]="value()" id="short" />
  `,
})
class Host {
  readonly level = signal<unknown>(2);
  readonly value = signal('99 %');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  return { fixture, el };
}

describe('bx-card header', () => {
  it('renders the heading and names the region by it', async () => {
    const { el } = await render();
    const section = el.querySelector('#headed section.card')!;
    const h2 = section.querySelector('header h2')!;
    expect(h2.textContent?.trim()).toBe('Relay status');
    expect(section.getAttribute('role')).toBe('region');
    expect(section.getAttribute('aria-labelledby')).toBe(h2.id);
    expect(section.hasAttribute('aria-label')).toBe(false);
  });

  it('projects meta content into the header, and body content below it', async () => {
    const { el } = await render();
    const card = el.querySelector('#headed')!;
    expect(card.querySelector('header .meta bx-badge')?.textContent?.trim()).toBe('3 online');
    expect(card.querySelector('.body p')?.textContent).toBe('Body');
    expect(card.querySelector('.body bx-badge')).toBeNull();
  });

  it('uses the given heading level and falls back to 2 for anything else', async () => {
    const { fixture, el } = await render();
    fixture.componentInstance.level.set('4');
    await fixture.whenStable();
    expect(el.querySelector('#headed h4')?.textContent?.trim()).toBe('Relay status');
    fixture.componentInstance.level.set(9);
    await fixture.whenStable();
    expect(el.querySelector('#headed h2')).not.toBeNull();
    expect(el.querySelector('#headed h4')).toBeNull();
  });

  it('keeps a given heading id; a heading takes precedence over label', async () => {
    const { el } = await render();
    const section = el.querySelector('#fixed section.card')!;
    expect(section.querySelector('h2')?.id).toBe('fixed-heading');
    expect(section.getAttribute('aria-labelledby')).toBe('fixed-heading');
    expect(section.hasAttribute('aria-label')).toBe(false);
  });

  it('gives every card its own generated heading id', async () => {
    const { el } = await render();
    const a = el.querySelector('#headed h2')!.id;
    const b = el.querySelector('#bare h2')!.id;
    expect(a).toMatch(/^bx-card-heading-\d+$/);
    expect(a).not.toBe(b);
  });

  it('renders a heading as text, never markup', async () => {
    TestBed.overrideTemplate(Host, `<bx-card heading="<img src=x onerror=alert(1)>" />`);
    const { el } = await render();
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('h2')?.textContent).toContain('<img');
  });
});

describe('bx-stat', () => {
  it('is a group named by its label, with value and detail', async () => {
    const { el } = await render();
    const stat = el.querySelector('#full')!;
    const label = stat.querySelector('.label')!;
    expect(stat.getAttribute('role')).toBe('group');
    expect(stat.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.textContent).toBe('Queue depth');
    expect(stat.querySelector('.value')?.textContent).toBe('12');
    expect(stat.querySelector('.detail')?.textContent).toBe('last hour');
  });

  it('omits an empty detail and updates its value in place', async () => {
    const { fixture, el } = await render();
    const stat = el.querySelector('#short')!;
    expect(stat.querySelector('.detail')).toBeNull();
    const value = stat.querySelector('.value')!;
    fixture.componentInstance.value.set('98 %');
    await fixture.whenStable();
    expect(stat.querySelector('.value')).toBe(value);
    expect(value.textContent).toBe('98 %');
    expect(el.querySelector('#full .label')!.id).not.toBe(stat.querySelector('.label')!.id);
  });
});
