import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BxInput, BxSelect, BxToggle, type SelectOption } from './public-api';

@Component({
  imports: [ReactiveFormsModule, BxInput, BxSelect, BxToggle],
  template: `
    <form [formGroup]="form">
      <bx-input ariaLabel="Callsign" formControlName="callsign" />
      <bx-select ariaLabel="Channel" [options]="channels" formControlName="channel" />
      <bx-toggle formControlName="relay">Telemetry relay</bx-toggle>
    </form>
  `,
})
class ReactiveHost {
  readonly channels: readonly SelectOption[] = [
    { value: 'ch-1', label: 'Channel 1' },
    { value: 'ch-2', label: 'Channel 2' },
  ];
  readonly form = new FormGroup({
    callsign: new FormControl('relay-01', { nonNullable: true }),
    channel: new FormControl('ch-2', { nonNullable: true }),
    relay: new FormControl(false, { nonNullable: true }),
  });
}

describe('form primitives with Angular forms (F-003-T01)', () => {
  it('bx-input, bx-select and bx-toggle read and write a reactive form', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('bx-input input')!;
    const select = el.querySelector<HTMLSelectElement>('bx-select select')!;
    const sw = el.querySelector<HTMLButtonElement>('bx-toggle button')!;

    expect(input.value).toBe('relay-01');
    expect(select.value).toBe('ch-2');
    expect(sw.getAttribute('aria-checked')).toBe('false');

    input.value = 'relay-07';
    input.dispatchEvent(new Event('input'));
    select.value = 'ch-1';
    select.dispatchEvent(new Event('change'));
    sw.click();
    await fixture.whenStable();
    expect(host.form.getRawValue()).toEqual({ callsign: 'relay-07', channel: 'ch-1', relay: true });

    input.dispatchEvent(new Event('blur'));
    expect(host.form.controls.callsign.touched).toBe(true);

    host.form.setValue({ callsign: 'relay-09', channel: 'ch-2', relay: false });
    await fixture.whenStable();
    expect(input.value).toBe('relay-09');
    expect(select.value).toBe('ch-2');
    expect(sw.getAttribute('aria-checked')).toBe('false');

    host.form.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(select.disabled).toBe(true);
    expect(sw.disabled).toBe(true);
  });
});
