import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxChecklistCard, type ChecklistToggle } from './checklist-card';
import { BxNoticeCard } from './notice-card';
import { BxRecipeCard } from './recipe-card';
import { BxStatusCard } from './status-card';
import { BxSurface } from './surface-renderer';

const hostile = '<img src=x onerror=alert(1)><script>bad()</script>';

async function render<T>(type: new () => T, surface: unknown): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(type);
  fixture.componentRef.setInput('surface', surface);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function noMarkup(el: HTMLElement): void {
  expect(el.querySelector('script')).toBeNull();
  expect(el.querySelector('img[onerror]')).toBeNull();
}

describe('surface cards', () => {
  it('status card shows hostile text as text', async () => {
    const el = await render(BxStatusCard, {
      version: 1,
      component: 'nerv-status-card',
      props: { title: hostile, detail: hostile, status: 'error' },
    });
    noMarkup(el);
    expect(el.querySelector('h3')?.textContent).toBe(hostile);
    expect(el.querySelector('bx-badge')?.getAttribute('data-tone')).toBe('danger');
    expect(el.querySelector('[role=status]')?.textContent?.trim()).toBe('error');
  });

  it('status card shows a fallback for a payload of another component', async () => {
    const el = await render(BxStatusCard, {
      version: 1,
      component: 'nerv-notice-card',
      props: { topic: 't', message: 'm', tone: 'info' },
    });
    expect(el.querySelector('.detail')?.textContent).toBe('Invalid surface');
  });

  it('notice card maps the tone to a badge', async () => {
    const el = await render(BxNoticeCard, {
      version: 1,
      component: 'nerv-notice-card',
      props: { topic: hostile, message: 'Disk almost full', tone: 'warn' },
    });
    noMarkup(el);
    expect(el.querySelector('bx-badge')?.getAttribute('data-tone')).toBe('warn');
    expect(el.querySelector('bx-badge')?.textContent?.trim()).toBe('WARN');
  });

  it('recipe card keeps the body as written and captions photos by step', async () => {
    const el = await render(BxRecipeCard, {
      version: 1,
      component: 'nerv-recipe-card',
      props: {
        title: 'Soup',
        category: 'Dinner',
        body: `1. Boil\n${hostile}`,
        photos: [{ id: 'p1', url: '/api/photos/p1', caption: 'Pot', stepIndex: 0 }],
      },
    });
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('pre')?.textContent).toContain('<script>bad()</script>');
    expect(el.querySelector('img')?.getAttribute('src')).toBe('/api/photos/p1');
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('Pot');
    expect(el.querySelector('figcaption')?.textContent).toBe('Step 1 — Pot');
    expect(el.querySelector('.working')).toBeNull();
  });
});

@Component({
  imports: [BxChecklistCard],
  template: `<bx-checklist-card [surface]="surface()" (itemToggle)="toggles.push($event)" />`,
})
class ChecklistHost {
  readonly surface = signal<unknown>(
    list([
      { id: 'a', text: 'Charger', done: false },
      { id: 'b', text: 'Goggles', done: true },
    ]),
  );
  readonly toggles: ChecklistToggle[] = [];
}

function list(items: { id: string; text: string; done: boolean }[]): unknown {
  return {
    version: 1,
    component: 'nerv-checklist-card',
    props: { listId: 'l1', name: 'Pack', items },
  };
}

describe('checklist card', () => {
  it('counts, emits a toggle and keeps rows keyed by id across payloads', async () => {
    const fixture = TestBed.createComponent(ChecklistHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.count')?.textContent).toBe('1/2');

    const box = el.querySelector<HTMLInputElement>('input')!;
    box.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.toggles).toEqual([{ listId: 'l1', itemId: 'a', done: true }]);
    expect(el.querySelector('.count')?.textContent).toBe('2/2');

    const rowB = el.querySelectorAll('li')[1];
    fixture.componentInstance.surface.set(
      list([
        { id: 'b', text: 'Goggles', done: true },
        { id: 'a', text: 'Charger', done: true },
        { id: 'c', text: 'Props', done: false },
      ]),
    );
    await fixture.whenStable();
    const rows = el.querySelectorAll('li');
    expect(rows.length).toBe(3);
    expect(rows[0]).toBe(rowB);
    expect(el.querySelector('.count')?.textContent).toBe('2/3');
  });
});

@Component({
  imports: [BxSurface],
  template: `<bx-surface [surface]="surface()" (rejected)="reasons.push($event)" />`,
})
class RendererHost {
  readonly surface = signal<unknown>({
    version: 1,
    component: 'nerv-status-card',
    props: { title: 'Nodo', detail: 'Up', status: 'ok' },
  });
  readonly reasons: string[] = [];
}

describe('bx-surface', () => {
  it('renders a registered surface and rejects anything else', async () => {
    const fixture = TestBed.createComponent(RendererHost);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('bx-status-card')).not.toBeNull();
    expect(fixture.componentInstance.reasons).toEqual([]);

    fixture.componentInstance.surface.set({
      version: 1,
      component: 'nerv-iframe',
      props: { src: 'https://evil.test' },
    });
    await fixture.whenStable();
    expect(el.querySelector('bx-status-card')).toBeNull();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('rejected');
    expect(el.querySelector('iframe')).toBeNull();
    expect(fixture.componentInstance.reasons[0]).toContain('nerv-iframe');
  });
});
