import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxAvatar } from './avatar';
import { BxButton } from './button';
import { BxComposer, type ComposerCommand } from './composer';
import { BxListbox, type ListboxOption } from './listbox';
import { BxMessage, BxMessageLog } from './message';

const COMMANDS: ComposerCommand[] = [
  { name: 'help', summary: 'List the commands' },
  { name: 'status', usage: '/status [node]', summary: 'Show node health', hasArgs: true },
  { name: 'stop', usage: '/stop TASK', summary: 'Stop a task', hasArgs: true },
];

@Component({
  imports: [BxAvatar, BxButton, BxComposer, BxMessage, BxMessageLog],
  template: `
    <bx-message-log id="log" label="Conversation" [follow]="follow()">
      @for (m of messages(); track m.id) {
        <bx-message [who]="m.who" time="09:14:05" datetime="2026-11-26T09:14:05" [own]="m.who === 'You'" [context]="m.context" [tone]="m.tone">
          <bx-avatar bx-message-avatar [name]="m.who" [decorative]="true" />
          {{ m.text }}
        </bx-message>
      }
    </bx-message-log>
    <bx-composer
      id="composer"
      label="Message the agent"
      placeholder="Ask something"
      [commands]="commands()"
      [(value)]="draft"
      (send)="sent.push($event)"
      (commandPick)="picked.push($event.name)"
    >
      <bx-button bx-composer-actions size="sm">Talk</bx-button>
    </bx-composer>
  `,
})
class Host {
  readonly follow = signal(true);
  readonly commands = signal<ComposerCommand[]>(COMMANDS);
  readonly draft = signal('');
  readonly sent: string[] = [];
  readonly picked: string[] = [];
  readonly messages = signal<
    { id: number; who: string; text: string; context: string; tone: 'none' | 'danger' }[]
  >([
    { id: 1, who: 'You', text: 'status', context: '', tone: 'none' },
    { id: 2, who: 'Agent', text: '<i>All nodes up</i>', context: 'T-0001', tone: 'danger' },
  ]);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const input = el.querySelector('#composer input') as HTMLInputElement;
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, cancelable: true });
    input.dispatchEvent(event);
    await fixture.whenStable();
    return event.defaultPrevented;
  };
  return { fixture, el, input, type, key, host: fixture.componentInstance };
}

describe('bx-message-log and bx-message', () => {
  it('is a named, focusable polite log of messages with a header and text-only body', async () => {
    const { el } = await render();
    const log = el.querySelector('#log')!;
    expect(log.getAttribute('role')).toBe('log');
    expect(log.getAttribute('aria-live')).toBe('polite');
    expect(log.getAttribute('aria-label')).toBe('Conversation');
    expect(log.getAttribute('tabindex')).toBe('0');
    const [mine, theirs] = Array.from(log.querySelectorAll('bx-message'));
    expect(mine!.getAttribute('data-own')).toBe('true');
    expect(mine!.querySelector('.head time')?.getAttribute('datetime')).toBe('2026-11-26T09:14:05');
    expect(mine!.querySelector('.who')?.textContent).toBe('You');
    expect(mine!.querySelector('bx-avatar')).not.toBeNull();
    expect(theirs!.hasAttribute('data-own')).toBe(false);
    expect(theirs!.getAttribute('data-tone')).toBe('danger');
    expect(theirs!.querySelector('.head')?.textContent).toContain('T-0001');
    expect(theirs!.querySelector('.body i')).toBeNull();
    expect(theirs!.querySelector('.body')?.textContent?.trim()).toBe('<i>All nodes up</i>');
  });

  it('keeps the end in view for a new message unless the reader scrolled up or follow is off', async () => {
    const { fixture, el, host } = await render();
    const log = el.querySelector('#log') as HTMLElement;
    let height = 1000;
    Object.defineProperty(log, 'scrollHeight', { get: () => height, configurable: true });
    Object.defineProperty(log, 'clientHeight', { get: () => 300, configurable: true });
    const add = async (id: number) => {
      height += 50;
      host.messages.update((m) => [
        ...m,
        { id, who: 'Agent', text: `m${id}`, context: '', tone: 'none' },
      ]);
      await fixture.whenStable();
    };
    await add(3);
    expect(log.scrollTop).toBe(1050);
    log.scrollTop = 100;
    log.dispatchEvent(new Event('scroll'));
    await add(4);
    expect(log.scrollTop).toBe(100);
    log.scrollTop = height - 300;
    log.dispatchEvent(new Event('scroll'));
    host.follow.set(false);
    await add(5);
    expect(log.scrollTop).toBe(800);
  });
});

describe('bx-composer', () => {
  it('labels its field, sends the trimmed text, clears it, and sends nothing when empty', async () => {
    const { el, input, type, host } = await render();
    expect(el.querySelector(`label[for="${input.id}"]`)?.textContent).toBe('Message the agent');
    expect(input.getAttribute('placeholder')).toBe('Ask something');
    expect(el.querySelector('#composer form bx-button[bx-composer-actions]')).not.toBeNull();
    const form = el.querySelector('#composer form') as HTMLFormElement;
    await type('  hello  ');
    expect(host.draft()).toBe('  hello  ');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(host.sent).toEqual(['hello']);
    expect(host.draft()).toBe('');
    await type('   ');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(host.sent).toEqual(['hello']);
  });

  it('is a plain text field without commands', async () => {
    const { fixture, input, host } = await render();
    host.commands.set([]);
    await fixture.whenStable();
    expect(input.hasAttribute('role')).toBe(false);
    expect(input.hasAttribute('aria-expanded')).toBe(false);
  });

  it('opens the slash menu as a combobox popup filtered by prefix', async () => {
    const { el, input, type } = await render();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    await type('/');
    const listbox = el.querySelector('#composer bx-listbox')!;
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    expect(listbox.getAttribute('role')).toBe('listbox');
    expect(listbox.getAttribute('aria-label')).toBe('Slash commands');
    expect(listbox.querySelectorAll('[role=option]').length).toBe(3);
    await type('/st');
    const labels = Array.from(listbox.querySelectorAll('[role=option] .label')).map(
      (o) => o.textContent,
    );
    expect(labels).toEqual(['/status [node]', '/stop TASK']);
    await type('/zz');
    expect(el.querySelector('#composer bx-listbox')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    await type('hello /st');
    expect(el.querySelector('#composer bx-listbox')).toBeNull();
  });

  it('moves the active option with the arrows, picks it with Enter and closes with Escape', async () => {
    const { el, input, type, key, host } = await render();
    await type('/');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect(await key('ArrowDown')).toBe(true);
    const options = () => Array.from(el.querySelectorAll('#composer [role=option]'));
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
    expect(options()[0]!.getAttribute('aria-selected')).toBe('true');
    expect(await key('ArrowUp')).toBe(true);
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[2]!.id);
    await key('ArrowDown');
    await key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[1]!.id);
    expect(await key('Enter')).toBe(true);
    expect(host.draft()).toBe('/status ');
    expect(input.value).toBe('/status ');
    expect(host.picked).toEqual(['status']);
    expect(host.sent).toEqual([]);
    expect(el.querySelector('#composer bx-listbox')).toBeNull();

    await type('/h');
    await key('ArrowDown');
    await key('Enter');
    expect(host.draft()).toBe('/help');
    expect(el.querySelector('#composer bx-listbox')).toBeNull();
    expect(await key('Enter')).toBe(false);

    await type('/s');
    expect(await key('Escape')).toBe(true);
    expect(el.querySelector('#composer bx-listbox')).toBeNull();
    expect(await key('ArrowDown')).toBe(true);
    expect(el.querySelector('#composer bx-listbox')).not.toBeNull();
  });

  it('picks a command on click', async () => {
    const { fixture, el, type, host } = await render();
    await type('/');
    (el.querySelectorAll('#composer [role=option]')[2] as HTMLElement).click();
    await fixture.whenStable();
    expect(host.draft()).toBe('/stop ');
    expect(host.picked).toEqual(['stop']);
  });
});

@Component({
  imports: [BxListbox],
  template: `<bx-listbox label="Pick" [options]="options" [(active)]="active" (pick)="picked = $event.value" />`,
})
class ListHost {
  readonly options: ListboxOption[] = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B', disabled: true },
    { value: 'c', label: 'C', description: 'third' },
  ];
  readonly active = signal(-1);
  picked = '';
}

describe('bx-listbox', () => {
  it('skips disabled options, wraps, and never picks a disabled one', async () => {
    const fixture = TestBed.createComponent(ListHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const listbox = fixture.debugElement.children[0]!.componentInstance as BxListbox;
    expect(listbox.handleKey('ArrowDown')).toBe(true);
    expect(fixture.componentInstance.active()).toBe(0);
    listbox.handleKey('ArrowDown');
    expect(fixture.componentInstance.active()).toBe(2);
    listbox.handleKey('ArrowDown');
    expect(fixture.componentInstance.active()).toBe(0);
    expect(listbox.handleKey('Tab')).toBe(false);
    await fixture.whenStable();
    const options = el.querySelectorAll('[role=option]');
    expect(options[1]!.getAttribute('aria-disabled')).toBe('true');
    expect(options[2]!.querySelector('.description')?.textContent).toBe('third');
    (options[1] as HTMLElement).click();
    expect(fixture.componentInstance.picked).toBe('');
    listbox.handleKey('Enter');
    expect(fixture.componentInstance.picked).toBe('a');
  });
});
