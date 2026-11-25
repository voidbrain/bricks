import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { iconPaths } from '@voidbrain/bricks/foundations';
import { BxIcon } from './icon';

@Component({
  imports: [BxIcon],
  template: `
    <bx-icon id="decorative" name="check" />
    <bx-icon id="named" name="close" label="Close" />
    <bx-icon id="unknown" name="nope" label="Missing" />
  `,
})
class Host {}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('bx-icon', () => {
  it('draws the named icon inline in currentColor, with no external reference', async () => {
    const svg = (await render()).querySelector('#decorative svg') as SVGElement;
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect([...svg.querySelectorAll('path')].map((p) => p.getAttribute('d'))).toEqual(
      iconPaths('check'),
    );
    expect(svg.querySelector('use, image')).toBeNull();
  });

  it('hides a decorative icon from assistive technology', async () => {
    const svg = (await render()).querySelector('#decorative svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('role')).toBe(false);
    expect(svg.hasAttribute('aria-label')).toBe(false);
  });

  it('names an icon that carries meaning', async () => {
    const svg = (await render()).querySelector('#named svg') as SVGElement;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Close');
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });

  it('draws nothing for an unknown name rather than guessing', async () => {
    const host = (await render()).querySelector('#unknown') as HTMLElement;
    expect(host.querySelector('svg')).toBeNull();
  });
});
