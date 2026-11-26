import { Component, computed, input, linkedSignal } from '@angular/core';

export const AVATAR_SIZES = ['sm', 'md'] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number];

/** Up to two initials from a name: the first letter of its first two words (`Pen Pen` → `PP`, `Aoba` → `A`). */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]!.toUpperCase())
    .join('');
}

/**
 * An avatar: an image when `src` is given and loads, otherwise the initials of `name` on a well. `name` is its
 * accessible name; set `decorative` when the name is already written next to it (a message's sender), so a screen
 * reader does not hear it twice. `pixelated` keeps pixel-art sprites sharp. Sizes `sm` (20 px) and `md` (32 px).
 */
@Component({
  selector: 'bx-avatar',
  host: {
    '[attr.role]': 'showImage() || decorative() ? null : "img"',
    '[attr.aria-label]': 'showImage() || decorative() ? null : name()',
    '[attr.data-size]': 'size()',
    '[attr.data-pixelated]': 'pixelated() || null',
  },
  template: `
    @if (showImage()) {
      <img
        class="image"
        [src]="src()"
        [alt]="decorative() ? '' : name()"
        width="32"
        height="32"
        loading="lazy"
        decoding="async"
        (error)="failed.set(true)"
      />
    } @else {
      <span class="initials" aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styles: `
    :host {
      --size: var(--bx-avatar-size-sm);
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      inline-size: var(--size);
      block-size: var(--size);
      overflow: hidden;
      border: var(--bx-line-width) solid var(--bx-avatar-border);
      border-radius: var(--bx-avatar-radius);
      background: var(--bx-avatar-bg);
      color: var(--bx-avatar-fg);
      vertical-align: middle;
    }
    :host([data-size='md']) {
      --size: var(--bx-avatar-size-md);
    }
    .image {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
    :host([data-pixelated]) .image {
      image-rendering: pixelated;
    }
    .initials {
      font-size: calc(var(--size) * 0.45);
      font-weight: var(--bx-font-weight-bold);
      line-height: 1;
      letter-spacing: 0;
    }
  `,
})
export class BxAvatar {
  readonly name = input.required<string>();
  readonly src = input<string>('');
  readonly size = input<AvatarSize>('sm');
  readonly decorative = input(false);
  readonly pixelated = input(false);

  /** A failed load shows the initials; a new `src` tries again. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly initials = computed(() => initialsOf(this.name()));
}

/**
 * A row of avatars named as a group (`role="group"`, `label`): the people or units on a node. Avatars keep their
 * own names; the stack only spaces them (`--bx-avatar-stack-gap`).
 */
@Component({
  selector: 'bx-avatar-stack',
  host: { role: 'group', '[attr.aria-label]': 'label()' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-avatar-stack-gap);
    }
  `,
})
export class BxAvatarStack {
  readonly label = input.required<string>();
}
