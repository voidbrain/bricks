import { TestBed } from '@angular/core/testing';
import { ICON_NAMES } from '@voidbrain/bricks/foundations';
import { App } from './app';

describe('catalogue', () => {
  it('shows every surface sample in each of the three themes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const themes = [...el.querySelectorAll('section.theme')].map((s) =>
      s.getAttribute('data-bx-theme'),
    );
    expect(themes).toEqual(['base', 'plain', 'eva']);
    expect(el.querySelector('section[data-bx-theme="eva"] [data-bx-theme="base"]')).not.toBeNull();
    for (const section of el.querySelectorAll('section.theme')) {
      expect(section.querySelectorAll('bx-surface').length).toBe(9);
      expect(section.querySelectorAll('bx-surface [role=alert]').length).toBe(1);
      expect(section.querySelectorAll('[data-testid=alerts] bx-alert[role=alert]').length).toBe(1);
      expect(section.querySelectorAll('[data-testid=icons] bx-icon svg').length).toBe(
        ICON_NAMES.length + 1,
      );
      expect(section.querySelector('[data-testid=layout-columns].bx-columns')).not.toBeNull();
    }
  });
});
