import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BxBadge } from './badge';
import { BxCard } from './card';

@Component({
  imports: [BxCard, BxBadge],
  template: `
    <bx-card label="Example"><bx-badge tone="danger" [live]="true">Down</bx-badge></bx-card>
    <bx-card id="plain"><p>Body</p></bx-card>
  `,
})
class Host {}

describe('components', () => {
  it('a labelled card is a named region; an unlabelled one is not', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const sections = fixture.nativeElement.querySelectorAll('section.card');
    expect(sections[0].getAttribute('role')).toBe('region');
    expect(sections[0].getAttribute('aria-label')).toBe('Example');
    expect(sections[1].hasAttribute('role')).toBe(false);
    expect(sections[1].hasAttribute('aria-label')).toBe(false);
  });

  it('a badge carries its tone and, when live, a status role', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('bx-badge');
    expect(badge.getAttribute('data-tone')).toBe('danger');
    expect(badge.querySelector('.badge')?.getAttribute('role')).toBe('status');
    expect(badge.textContent?.trim()).toBe('Down');
  });
});
