import { Component, computed, input } from '@angular/core';
import { BxBadge, BxCard, type BadgeTone } from '@voidbrain/bricks/components';
import { validateSurfaceResult, type NoticeSurface } from './surface';

const TONE: Record<NoticeSurface['props']['tone'], BadgeTone> = {
  info: 'info',
  warn: 'warn',
  success: 'ok',
};

/** `nerv-notice-card`: a topic, a message and a tone. */
@Component({
  selector: 'bx-notice-card',
  imports: [BxCard, BxBadge],
  template: `
    <bx-card>
      <h3 class="topic">{{ view().topic }}</h3>
      <p class="message">{{ view().message }}</p>
      <bx-badge [tone]="view().badge" [live]="true">{{ view().tone.toUpperCase() }}</bx-badge>
    </bx-card>
  `,
  styles: `
    .topic {
      margin: 0;
      font-size: var(--bx-font-size-lg);
      font-weight: var(--bx-font-weight-medium);
    }
    .message {
      margin: 0;
      color: var(--bx-text-muted);
      font-size: var(--bx-font-size-md);
    }
  `,
})
export class BxNoticeCard {
  readonly surface = input<unknown>();
  protected readonly view = computed(() => {
    const r = validateSurfaceResult(this.surface());
    if (!r.ok || r.surface.component !== 'nerv-notice-card') {
      return {
        topic: 'Notice',
        message: 'Invalid surface',
        tone: 'error',
        badge: 'danger' as BadgeTone,
      };
    }
    const p = r.surface.props;
    return { ...p, badge: TONE[p.tone] };
  });
}
