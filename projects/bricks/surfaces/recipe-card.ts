import { Component, computed, input } from '@angular/core';
import { BxBadge, BxCard } from '@voidbrain/bricks/components';
import { validateSurfaceResult, type RecipePhoto } from './surface';

/** `nerv-recipe-card`: a category, a title, a body kept as written, optional photos and working notes. */
@Component({
  selector: 'bx-recipe-card',
  imports: [BxCard, BxBadge],
  template: `
    @let r = view();
    <bx-card [label]="r.title">
      <bx-badge [tone]="r.valid ? 'accent' : 'danger'">{{ r.category }}</bx-badge>
      <h3 class="title">{{ r.title }}</h3>
      <pre class="body">{{ r.body }}</pre>
      @if (r.photos.length) {
        <div class="photos">
          @for (photo of r.photos; track photo.id) {
            <figure>
              <img [src]="photo.url" [alt]="photo.caption || r.title" loading="lazy" />
              @if (caption(photo); as text) {
                <figcaption>{{ text }}</figcaption>
              }
            </figure>
          }
        </div>
      }
      @if (r.working) {
        <p class="working">{{ r.working }}</p>
      }
    </bx-card>
  `,
  styles: `
    .title {
      margin: 0;
      font-size: var(--bx-font-size-xl);
      font-weight: var(--bx-font-weight-medium);
    }
    .body {
      margin: 0;
      font-family: inherit;
      white-space: pre-wrap;
      font-size: var(--bx-font-size-md);
    }
    .photos {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-3);
    }
    figure {
      margin: 0;
      max-width: 220px;
    }
    img {
      display: block;
      max-width: 100%;
      height: auto;
      border: var(--bx-line-width) solid var(--bx-border);
      border-radius: var(--bx-radius);
    }
    figcaption,
    .working {
      color: var(--bx-text-muted);
      font-size: var(--bx-font-size-sm);
    }
    .working {
      margin: 0;
      padding-top: var(--bx-space-3);
      border-top: var(--bx-line-width) solid var(--bx-border);
    }
  `,
})
export class BxRecipeCard {
  readonly surface = input<unknown>();

  protected readonly view = computed(() => {
    const r = validateSurfaceResult(this.surface());
    if (!r.ok || r.surface.component !== 'nerv-recipe-card') {
      return {
        valid: false,
        title: 'Recipe',
        category: 'ERROR',
        body: 'Invalid surface',
        working: '',
        photos: [] as RecipePhoto[],
      };
    }
    const p = r.surface.props;
    return { valid: true, ...p, working: p.working ?? '', photos: p.photos ?? [] };
  });

  protected caption(photo: RecipePhoto): string {
    const step =
      photo.stepIndex !== undefined && photo.stepIndex !== null
        ? `Step ${photo.stepIndex + 1}`
        : '';
    return [step, photo.caption].filter(Boolean).join(' — ');
  }
}
