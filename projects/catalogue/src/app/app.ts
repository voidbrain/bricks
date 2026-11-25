import { Component } from '@angular/core';
import { BADGE_TONES, BxBadge, BxCard } from '@voidbrain/bricks/components';
import { THEMES } from '@voidbrain/bricks/themes';
import { SEMANTIC_TOKENS } from '@voidbrain/bricks/tokens';
import { BxSurface } from '@voidbrain/bricks/surfaces';
import { samples } from './samples';

/**
 * The bricks catalogue: every component and surface in every theme, side by side. The browser suite
 * (e2e/catalogue.spec.ts) runs axe on this page and checks each theme defines every semantic token.
 */
@Component({
  selector: 'cat-root',
  imports: [BxBadge, BxCard, BxSurface],
  template: `
    <header class="page-head">
      <h1>Bricks catalogue</h1>
      <p>Every component and genUI surface in every theme. Themes: {{ themes.join(', ') }}.</p>
    </header>
    <main>
      @for (theme of themes; track theme) {
        <section class="theme" [attr.data-bx-theme]="theme" [attr.aria-labelledby]="'theme-' + theme">
          <h2 [id]="'theme-' + theme">Theme: {{ theme }}</h2>

          <h3>Semantic tokens</h3>
          <ul class="swatches">
            @for (token of colourTokens; track token) {
              <li><span class="swatch" [style.background]="'var(' + token + ')'"></span><code>{{ token }}</code></li>
            }
          </ul>

          <h3>Badge</h3>
          <div class="row">
            @for (tone of tones; track tone) {
              <bx-badge [tone]="tone">{{ tone }}</bx-badge>
            }
          </div>

          <h3>Card</h3>
          <bx-card><p class="flush">A card holds any content on the raised surface.</p></bx-card>

          <h3>Surfaces</h3>
          <div class="grid">
            @for (sample of samplesFor(theme); track sample.name) {
              <div>
                <h4>{{ sample.name }}</h4>
                <bx-surface [surface]="sample.surface" />
              </div>
            }
          </div>
        </section>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .page-head {
      padding: var(--bx-space-6) var(--bx-space-6) 0;
    }
    h1 {
      margin: 0;
      font-size: var(--bx-font-size-2xl);
    }
    .theme {
      padding: var(--bx-space-6);
      display: flex;
      flex-direction: column;
      gap: var(--bx-space-3);
    }
    h2,
    h3,
    h4,
    .flush {
      margin: 0;
    }
    h4 {
      font-size: var(--bx-font-size-sm);
      color: var(--bx-text-muted);
      margin-bottom: var(--bx-space-2);
    }
    .swatches {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--bx-space-2);
    }
    .swatches li {
      display: flex;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .swatch {
      inline-size: 24px;
      block-size: 24px;
      border: var(--bx-line-width) solid var(--bx-border);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bx-space-2);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--bx-space-4);
    }
  `,
})
export class App {
  protected readonly themes = THEMES;
  protected readonly tones = BADGE_TONES;
  protected readonly colourTokens = SEMANTIC_TOKENS.filter((t) => !/font|radius/.test(t));
  private readonly byTheme = new Map(THEMES.map((t) => [t, samples(t)]));
  protected samplesFor(theme: (typeof THEMES)[number]) {
    return this.byTheme.get(theme) ?? [];
  }
}
