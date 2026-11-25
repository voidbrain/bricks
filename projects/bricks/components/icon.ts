import { Component, computed, input } from '@angular/core';
import { ICON_VIEWBOX, iconPaths, isIconName } from '@voidbrain/bricks/foundations';

/**
 * An inline SVG icon from the bricks set, in `currentColor`. Decorative by default (hidden from screen readers);
 * give it a `label` when the icon alone carries meaning, as on an icon-only button. An unknown name draws nothing.
 */
@Component({
  selector: 'bx-icon',
  template: `
    @if (paths(); as paths) {
      <svg
        [attr.viewBox]="viewBox"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        focusable="false"
        [attr.role]="label() ? 'img' : null"
        [attr.aria-label]="label() || null"
        [attr.aria-hidden]="label() ? null : 'true'"
      >
        @for (d of paths; track $index) {
          <path [attr.d]="d" />
        }
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
      inline-size: var(--bx-icon-size);
      block-size: var(--bx-icon-size);
      flex: none;
    }
    svg {
      inline-size: 100%;
      block-size: 100%;
      stroke-width: var(--bx-icon-stroke);
    }
  `,
})
export class BxIcon {
  /** The icon's name in the set (`ICON_NAMES`). */
  readonly name = input.required<string>();
  /** The accessible name; empty for a decorative icon next to text that already says it. */
  readonly label = input('');
  protected readonly viewBox = ICON_VIEWBOX;
  protected readonly paths = computed(() => {
    const name = this.name();
    return isIconName(name) ? iconPaths(name) : null;
  });
}
