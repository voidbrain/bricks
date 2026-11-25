import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BUTTON_VARIANTS,
  BxButton,
  BxInput,
  BxSelect,
  BxTag,
  BxToggle,
  type SelectOption,
} from './public-api';

@Component({
  imports: [BxButton, BxInput, BxSelect, BxToggle, BxTag],
  template: `
    <bx-button variant="primary" (pressed)="clicks.set(clicks() + 1)">Save preset</bx-button>
    <bx-button id="disabled-btn" variant="danger" [disabled]="true" (pressed)="clicks.set(clicks() + 1)">
      Reset link
    </bx-button>

    <bx-input
      inputId="callsign"
      ariaLabel="Callsign"
      placeholder="Enter callsign"
      [(value)]="query"
      [invalid]="invalid()"
    />

    <bx-select selectId="channel" ariaLabel="Channel" [options]="channels" [(value)]="channel" />

    <bx-toggle [(checked)]="armed">Telemetry relay</bx-toggle>

    <bx-tag>uplink</bx-tag>
    <bx-tag id="removable-tag" [removable]="true" removeLabel="Remove filter north" (removed)="removed.set(true)">
      north
    </bx-tag>
  `,
})
class PrimitivesHost {
  readonly clicks = signal(0);
  readonly query = signal('relay-01');
  readonly invalid = signal(false);
  readonly channel = signal('ch-2');
  readonly armed = signal(false);
  readonly removed = signal(false);
  readonly channels: readonly SelectOption[] = [
    { value: 'ch-1', label: 'Channel 1' },
    { value: 'ch-2', label: 'Channel 2' },
    { value: 'ch-3', label: 'Channel 3 (standby)', disabled: true },
  ];
}

describe('form primitives (F-003-T01)', () => {
  it('bx-button exposes variants, emits pressed when active, and respects disabled', async () => {
    expect(BUTTON_VARIANTS).toEqual(['primary', 'secondary', 'danger', 'ghost']);
    const fixture = TestBed.createComponent(PrimitivesHost);
    await fixture.whenStable();

    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('bx-button button');
    expect(buttons[0].getAttribute('data-variant')).toBe('primary');
    expect(buttons[0].type).toBe('button');
    buttons[0].click();
    expect(fixture.componentInstance.clicks()).toBe(1);

    expect(buttons[1].disabled).toBe(true);
    buttons[1].click();
    expect(fixture.componentInstance.clicks()).toBe(1);
  });

  it('bx-input binds value two-way and sets aria-invalid only when invalid', async () => {
    const fixture = TestBed.createComponent(PrimitivesHost);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('bx-input input');
    expect(input.id).toBe('callsign');
    expect(input.getAttribute('aria-label')).toBe('Callsign');
    expect(input.value).toBe('relay-01');
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    input.value = 'relay-04';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.query()).toBe('relay-04');

    fixture.componentInstance.invalid.set(true);
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('bx-select renders options with disabled flags and updates model on change', async () => {
    const fixture = TestBed.createComponent(PrimitivesHost);
    await fixture.whenStable();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('bx-select select');
    expect(select.options.length).toBe(3);
    expect(select.options[2].disabled).toBe(true);
    expect(select.value).toBe('ch-2');

    select.value = 'ch-1';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.channel()).toBe('ch-1');
  });

  it('bx-toggle renders an accessible switch role and flips checked state', async () => {
    const fixture = TestBed.createComponent(PrimitivesHost);
    await fixture.whenStable();

    const sw: HTMLButtonElement = fixture.nativeElement.querySelector(
      'bx-toggle button[role="switch"]',
    );
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(sw.textContent).toContain('Telemetry relay');

    sw.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.armed()).toBe(true);
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });

  it('bx-tag renders static and removable chips with an accessible remove button', async () => {
    const fixture = TestBed.createComponent(PrimitivesHost);
    await fixture.whenStable();

    const tags = fixture.nativeElement.querySelectorAll('bx-tag');
    expect(tags[0].querySelector('button')).toBeNull();

    const removeBtn: HTMLButtonElement | null = tags[1].querySelector('button');
    expect(removeBtn).not.toBeNull();
    expect(removeBtn?.getAttribute('aria-label')).toBe('Remove filter north');
    removeBtn?.click();
    expect(fixture.componentInstance.removed()).toBe(true);
  });
});
