import { Component, computed, input } from '@angular/core';
import { BxBadge, BxCard, type BadgeTone } from '@voidbrain/bricks/components';
import { validateSurfaceResult, type StatusSurface } from './surface';

const TONE: Record<StatusSurface['props']['status'], BadgeTone> = {
  ok: 'ok',
  waiting: 'accent',
  error: 'danger',
};

/** `nerv-status-card`: a title, a detail and a status. Model output supplies data only; text is never parsed as HTML. */
@Component({
  selector: 'bx-status-card',
  imports: [BxCard, BxBadge],
  template: `
    <bx-card>
      <h3 class="title">{{ view().title }}</h3>
      <p class="detail">{{ view().detail }}</p>
      <bx-badge [tone]="view().tone" [live]="true">{{ view().status }}</bx-badge>
    </bx-card>
  `,
  styles: `
    .title {
      margin: 0;
      font-size: var(--bx-font-size-lg);
      font-weight: var(--bx-font-weight-medium);
    }
    .detail {
      margin: 0;
      color: var(--bx-text-muted);
      font-size: var(--bx-font-size-md);
    }
  `,
})
export class BxStatusCard {
  readonly surface = input<unknown>();
  protected readonly view = computed(() => {
    const r = validateSurfaceResult(this.surface());
    if (!r.ok || r.surface.component !== 'nerv-status-card') {
      return {
        title: 'Status',
        detail: 'Invalid surface',
        status: 'error',
        tone: 'danger' as BadgeTone,
      };
    }
    const p = r.surface.props;
    return { ...p, tone: TONE[p.status] };
  });
}
