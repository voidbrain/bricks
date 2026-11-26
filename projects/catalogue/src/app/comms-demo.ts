import { Component, input, signal } from '@angular/core';
import {
  BxAvatar,
  BxButton,
  BxComposer,
  BxMessage,
  BxMessageLog,
  type ComposerCommand,
  type MessageTone,
} from '@voidbrain/bricks/components';

interface DemoMessage {
  readonly id: number;
  readonly who: string;
  readonly time: string;
  readonly text: string;
  readonly context?: string;
  readonly tone?: MessageTone;
}

const COMMANDS: readonly ComposerCommand[] = [
  { name: 'help', summary: 'List the commands' },
  { name: 'status', usage: '/status [node]', summary: 'Show node health', hasArgs: true },
  { name: 'stop', usage: '/stop TASK', summary: 'Stop a running task', hasArgs: true },
  { name: 'queue', summary: 'Show the relay queue' },
];

/**
 * A working comms sample: a message log and a composer with slash commands. Sending appends the message to the
 * log (invented text; no network). The browser suite drives it by keyboard.
 */
@Component({
  selector: 'cat-comms-demo',
  imports: [BxAvatar, BxButton, BxComposer, BxMessage, BxMessageLog],
  template: `
    <div class="bx-stack bx-gap-2">
      <bx-message-log [label]="'Conversation (' + theme() + ')'" data-testid="message-log">
        @for (m of messages(); track m.id) {
          <bx-message [who]="m.who" [time]="m.time" [own]="m.who === 'You'" [context]="m.context ?? ''" [tone]="m.tone ?? 'none'">
            <bx-avatar bx-message-avatar [name]="m.who" [decorative]="true" />
            {{ m.text }}
          </bx-message>
        }
      </bx-message-log>
      <bx-composer
        data-testid="composer"
        [label]="'Message the agent (' + theme() + ')'"
        placeholder="Ask, or type / for commands"
        [commands]="commands"
        (send)="send($event)"
      >
        <bx-avatar bx-composer-avatar name="You" [decorative]="true" />
        <bx-button bx-composer-actions variant="ghost">Talk</bx-button>
      </bx-composer>
    </div>
  `,
})
export class CommsDemo {
  readonly theme = input.required<string>();
  protected readonly commands = COMMANDS;
  protected readonly messages = signal<readonly DemoMessage[]>([
    { id: 1, who: 'You', time: '09:14:02', text: 'How is the relay mesh?' },
    {
      id: 2,
      who: 'Agent',
      time: '09:14:05',
      text: 'Three relays up, one on standby.',
      context: 'T-0007',
    },
    {
      id: 3,
      who: 'Agent',
      time: '09:14:09',
      text: 'Relay four did not answer its heartbeat.',
      context: 'T-0007',
      tone: 'danger',
    },
  ]);

  protected send(text: string): void {
    this.messages.update((list) => [
      ...list,
      { id: list.length + 1, who: 'You', time: '09:15:00', text },
    ]);
  }
}
