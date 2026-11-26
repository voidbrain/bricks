import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxAvatar, BxAvatarStack } from './avatar';
import { BxBadge } from './badge';
import { BxButton } from './button';
import { BxTimeline, BxTimelineItem, type TimelineTone } from './timeline';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

@Component({
  imports: [BxAvatar, BxAvatarStack, BxBadge, BxButton, BxTimeline, BxTimelineItem],
  template: `
    <bx-timeline id="tl" label="Coming up">
      @for (row of rows(); track row.id) {
        <bx-timeline-item [time]="row.time" [datetime]="row.at" [detail]="row.detail" [tone]="row.tone">
          <bx-badge bx-timeline-meta tone="info">{{ row.kind }}</bx-badge>
          {{ row.title }}
          <bx-button bx-timeline-actions size="sm">Edit</bx-button>
        </bx-timeline-item>
      }
    </bx-timeline>
    <bx-timeline id="plain"><bx-timeline-item time="2026-11-20">Version two</bx-timeline-item></bx-timeline>
    <bx-avatar-stack id="stack" label="On this node">
      <bx-avatar id="img" name="Ada Lovelace" [src]="src()" [pixelated]="true" />
      <bx-avatar id="initials" name="ada  lovelace byron" size="md" />
      <bx-avatar id="deco" name="Grace Hopper" [decorative]="true" />
      <bx-avatar id="deco-img" name="Grace Hopper" [src]="pixel" [decorative]="true" />
    </bx-avatar-stack>
  `,
})
class Host {
  readonly pixel = PIXEL;
  readonly src = signal(PIXEL);
  readonly rows = signal<
    {
      id: string;
      time: string;
      at: string;
      title: string;
      kind: string;
      detail: string;
      tone: TimelineTone;
    }[]
  >([
    {
      id: 'a',
      time: '09:30',
      at: '2026-11-26T09:30',
      title: 'Water the basil',
      kind: 'Reminder',
      detail: 'in 2 hours',
      tone: 'accent',
    },
    {
      id: 'b',
      time: '11:00',
      at: '2026-11-26T11:00',
      title: '<b>not bold</b>',
      kind: 'Trigger',
      detail: '',
      tone: 'info',
    },
  ]);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('bx-timeline', () => {
  it('is a named list of items with a time, meta, body, detail and actions', async () => {
    const { el } = await render();
    const tl = el.querySelector('#tl')!;
    expect(tl.getAttribute('role')).toBe('list');
    expect(tl.getAttribute('aria-label')).toBe('Coming up');
    const items = tl.querySelectorAll('bx-timeline-item');
    expect(items.length).toBe(2);
    const first = items[0]!;
    expect(first.getAttribute('role')).toBe('listitem');
    expect(first.getAttribute('data-tone')).toBe('accent');
    const time = first.querySelector('time')!;
    expect(time.textContent).toBe('09:30');
    expect(time.getAttribute('datetime')).toBe('2026-11-26T09:30');
    expect(first.querySelector('.head bx-badge')?.textContent?.trim()).toBe('Reminder');
    expect(first.querySelector('.body')?.textContent?.trim()).toBe('Water the basil');
    expect(first.querySelector('.detail')?.textContent).toBe('in 2 hours');
    expect(first.querySelector('.actions bx-button')?.textContent?.trim()).toBe('Edit');
    expect(first.querySelector('.marker')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders text as text, leaves out an empty detail and an unset datetime and label', async () => {
    const { el } = await render();
    const second = el.querySelectorAll('#tl bx-timeline-item')[1]!;
    expect(second.querySelector('.body b')).toBeNull();
    expect(second.querySelector('.body')?.textContent?.trim()).toBe('<b>not bold</b>');
    expect(second.querySelector('.detail')).toBeNull();
    expect(second.getAttribute('data-tone')).toBe('info');
    const plain = el.querySelector('#plain')!;
    expect(plain.hasAttribute('aria-label')).toBe(false);
    expect(plain.querySelector('time')?.hasAttribute('datetime')).toBe(false);
  });

  it('keeps row nodes when the rows update', async () => {
    const { fixture, el } = await render();
    const before = el.querySelectorAll('#tl bx-timeline-item')[0];
    fixture.componentInstance.rows.update((rows) => [
      { ...rows[0]!, detail: 'in 1 hour' },
      rows[1]!,
    ]);
    await fixture.whenStable();
    const after = el.querySelectorAll('#tl bx-timeline-item')[0];
    expect(after).toBe(before);
    expect(after!.querySelector('.detail')?.textContent).toBe('in 1 hour');
  });
});

describe('bx-avatar', () => {
  it('shows the image named by its alt, sharp when pixelated', async () => {
    const { el } = await render();
    const av = el.querySelector('#img')!;
    const img = av.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('Ada Lovelace');
    expect(av.hasAttribute('role')).toBe(false);
    expect(av.getAttribute('data-pixelated')).toBe('true');
    expect(av.getAttribute('data-size')).toBe('sm');
  });

  it('falls back to initials on a failed load and tries again for a new src', async () => {
    const { fixture, el } = await render();
    const av = el.querySelector('#img')!;
    av.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(av.querySelector('img')).toBeNull();
    expect(av.querySelector('.initials')?.textContent).toBe('AL');
    expect(av.getAttribute('role')).toBe('img');
    expect(av.getAttribute('aria-label')).toBe('Ada Lovelace');
    fixture.componentInstance.src.set(PIXEL + '#2');
    await fixture.whenStable();
    expect(av.querySelector('img')).not.toBeNull();
  });

  it('shows up to two initials as a named image, or hides itself when decorative', async () => {
    const { el } = await render();
    const initials = el.querySelector('#initials')!;
    expect(initials.querySelector('.initials')?.textContent).toBe('AL');
    expect(initials.querySelector('.initials')?.getAttribute('aria-hidden')).toBe('true');
    expect(initials.getAttribute('role')).toBe('img');
    expect(initials.getAttribute('data-size')).toBe('md');
    const deco = el.querySelector('#deco')!;
    expect(deco.hasAttribute('role')).toBe(false);
    expect(deco.hasAttribute('aria-label')).toBe(false);
    expect(el.querySelector('#deco-img img')?.getAttribute('alt')).toBe('');
  });
});

describe('bx-avatar-stack', () => {
  it('is a group named by its label holding the avatars', async () => {
    const { el } = await render();
    const stack = el.querySelector('#stack')!;
    expect(stack.getAttribute('role')).toBe('group');
    expect(stack.getAttribute('aria-label')).toBe('On this node');
    expect(stack.querySelectorAll('bx-avatar').length).toBe(4);
  });
});
