import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  BADGE_TONES,
  BUTTON_VARIANTS,
  BxAlert,
  BxAvatar,
  BxAvatarStack,
  BxBadge,
  BxButton,
  BxCard,
  BxDisclosure,
  BxIcon,
  BxInput,
  BxMeter,
  BxSelect,
  BxStat,
  BxTag,
  BxTimeline,
  BxTimelineItem,
  BxToggle,
  type SelectOption,
} from '@voidbrain/bricks/components';
import { ICON_NAMES } from '@voidbrain/bricks/foundations';
import { ACCENTS, MODES, THEMES, VARIANT_THEMES, themeChoice } from '@voidbrain/bricks/themes';
import { SEMANTIC_TOKENS } from '@voidbrain/bricks/tokens';
import { BxSurface } from '@voidbrain/bricks/surfaces';
import { CommsDemo } from './comms-demo';
import { LiveDemo } from './live-demo';
import { samples } from './samples';

function options(values: readonly string[]): readonly SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

const SPRITE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">' +
      '<rect width="8" height="8" fill="#1d3b5a"/><rect x="2" y="1" width="4" height="4" fill="#f2c79b"/>' +
      '<rect x="2" y="1" width="4" height="1" fill="#5a3a1d"/><rect x="3" y="3" width="1" height="1" fill="#000"/>' +
      '<rect x="5" y="3" width="1" height="1" fill="#000"/><rect x="1" y="5" width="6" height="3" fill="#3a7d44"/></svg>',
  );

/**
 * The bricks catalogue: every component and surface in every theme, side by side, and a Theme · Mode · Accent
 * switcher whose preview shows them in any of the 20 variant combinations. The browser suite
 * (e2e/catalogue.spec.ts) runs axe on this page and checks each theme defines every semantic token.
 */
@Component({
  selector: 'cat-root',
  imports: [
    BxAlert,
    BxAvatar,
    BxAvatarStack,
    BxBadge,
    BxButton,
    BxCard,
    BxDisclosure,
    BxIcon,
    BxInput,
    BxMeter,
    BxSelect,
    BxStat,
    BxSurface,
    BxTag,
    BxTimeline,
    BxTimelineItem,
    BxToggle,
    CommsDemo,
    LiveDemo,
    NgTemplateOutlet,
  ],
  template: `
    <header class="page-head">
      <h1>Bricks catalogue</h1>
      <p>Every foundation, component and genUI surface in every theme. Themes: {{ themes.join(', ') }}.</p>
    </header>
    <main class="bx-safe-area">
      @for (theme of themes; track theme) {
        <section class="theme" [attr.data-bx-theme]="theme" [attr.aria-labelledby]="'theme-' + theme">
          <h2 [id]="'theme-' + theme">Theme: {{ theme }}</h2>
          <ng-container *ngTemplateOutlet="body; context: { $implicit: theme }" />
        </section>
      }

      <section class="variants" aria-labelledby="theme-variants" data-testid="variants">
        <h2 id="theme-variants">Theme · Mode · Accent</h2>
        <p class="flush">
          simple and eva take a mode and an accent: 20 combinations. Pick one to see every component in it.
        </p>
        <div class="controls" data-testid="theme-switcher">
          <div class="field">
            <label for="variant-theme">Theme</label>
            <bx-select selectId="variant-theme" [options]="variantThemeOptions" [(value)]="variantTheme" />
          </div>
          <div class="field">
            <label for="variant-mode">Mode</label>
            <bx-select selectId="variant-mode" [options]="modeOptions" [(value)]="variantMode" />
          </div>
          <div class="field">
            <label for="variant-accent">Accent</label>
            <bx-select selectId="variant-accent" [options]="accentOptions" [(value)]="variantAccent" />
          </div>
        </div>
        <div
          class="variant"
          data-testid="variant-preview"
          [attr.data-bx-theme]="preview().theme"
          [attr.data-bx-mode]="preview().mode"
          [attr.data-bx-accent]="preview().accent"
        >
          <ng-container *ngTemplateOutlet="body; context: { $implicit: 'variant' }" />
        </div>
      </section>
    </main>

    <ng-template #body let-key>
      <h3>Semantic tokens</h3>
      <ul class="swatches">
        @for (token of colourTokens; track token) {
          <li><span class="swatch" [style.background]="'var(' + token + ')'"></span><code>{{ token }}</code></li>
        }
      </ul>

      <h3>Brand and series</h3>
      <div class="row" data-testid="brand-series">
        <span class="brand">Relay mark</span>
        <span class="series-green">uplink 12</span>
        <span class="series-orange">queue 4</span>
        <span class="series-blue">downlink 9</span>
      </div>

      <h3>Button</h3>
      <div class="row">
        @for (variant of buttonVariants; track variant) {
          <bx-button [variant]="variant">{{ variant }}</bx-button>
        }
        <bx-button variant="primary" [disabled]="true">disabled</bx-button>
      </div>
      <div class="row" data-testid="compact-buttons">
        <bx-button size="sm">compact</bx-button>
        <bx-button size="sm" variant="primary">compact primary</bx-button>
        <bx-button size="sm" variant="ghost">compact ghost</bx-button>
      </div>

      <h3>Input and select</h3>
      <div class="controls">
        <div class="field">
          <label [for]="'filter-' + key">Filter query ({{ key }})</label>
          <bx-input
            [inputId]="'filter-' + key"
            placeholder="Type a station code"
            [(value)]="filterText"
          />
        </div>
        <div class="field">
          <label [for]="'invalid-' + key">Invalid sample ({{ key }})</label>
          <bx-input
            [inputId]="'invalid-' + key"
            value="bad-port"
            [invalid]="true"
          />
        </div>
        <div class="field">
          <label [for]="'channel-' + key">Channel ({{ key }})</label>
          <bx-select
            [selectId]="'channel-' + key"
            [options]="channelOptions"
            [(value)]="selectedChannel"
          />
        </div>
      </div>

      <h3>Toggle</h3>
      <div class="row">
        <bx-toggle>Telemetry relay</bx-toggle>
        <bx-toggle [checked]="true">Auto reconnect</bx-toggle>
        <bx-toggle [disabled]="true">Maintenance lock</bx-toggle>
      </div>

      <h3>Tag</h3>
      <div class="row">
        <bx-tag>sector-north</bx-tag>
        <bx-tag [removable]="true" [removeLabel]="'Remove sector-east in ' + key">sector-east</bx-tag>
      </div>

      <h3>Badge</h3>
      <div class="row">
        @for (tone of tones; track tone) {
          <bx-badge [tone]="tone">{{ tone }}</bx-badge>
        }
      </div>
      <div class="row" data-testid="outline-badges">
        <bx-badge tone="ok" appearance="outline">Seat one: approve ✓</bx-badge>
        <bx-badge tone="danger" appearance="outline">Seat two: reject ✗</bx-badge>
        <bx-badge tone="warn" appearance="outline">Seat three: pending</bx-badge>
        <bx-badge tone="neutral" appearance="outline">Seat four: abstain ·</bx-badge>
        <bx-badge tone="ok" appearance="dashed">Peer: approve (shadow)</bx-badge>
      </div>

      <h3>Meter</h3>
      <div class="bx-stack bx-gap-2" data-testid="meters">
        <span class="hint">Budget 30 of 120, forecast mark at 90</span>
        <bx-meter label="Budget used" [value]="30" [max]="120" [threshold]="90" />
        <span class="hint">Sync 62 %, threshold 75 %</span>
        <bx-meter label="Sync" [value]="62" [threshold]="75" tone="warn" valueText="62 percent, below the 75 percent threshold" />
        <span class="hint">Storage 92 %</span>
        <bx-meter label="Storage" [value]="92" tone="danger" />
      </div>

      <h3>Disclosure</h3>
      <bx-disclosure summary="Show the route brief" data-testid="disclosure">
        <p class="flush">Three relays, two waypoints, one fallback channel.</p>
      </bx-disclosure>

      <h3>Inline alert</h3>
      <div class="bx-stack bx-gap-2" data-testid="alerts">
        <bx-alert tone="warn">
          Shadow mode: the extra seat votes, but its vote is not counted.
          <bx-button bx-alert-actions size="sm">Details</bx-button>
        </bx-alert>
        <bx-alert tone="info">A note read in place, with no live announcement.</bx-alert>
        <bx-alert tone="danger" announce="assertive">Relay unreachable: retry in 30 s.</bx-alert>
      </div>

      <h3>Timeline</h3>
      <bx-timeline label="Coming up" data-testid="timeline">
        <bx-timeline-item time="09:30" datetime="2026-11-27T09:30" detail="in 2 hours">
          <bx-badge bx-timeline-meta tone="neutral" appearance="outline">Reminder</bx-badge>
          Water the basil on the balcony
          <bx-button bx-timeline-actions size="sm">Edit</bx-button>
          <bx-button bx-timeline-actions size="sm" variant="ghost">Cancel</bx-button>
        </bx-timeline-item>
        <bx-timeline-item time="11:00" datetime="2026-11-27T11:00" detail="in 3 hours" tone="info">
          <bx-badge bx-timeline-meta tone="info">Trigger</bx-badge>
          Check the relay queue
        </bx-timeline-item>
        <bx-timeline-item time="2026-11-20" tone="ok" detail="release notes · relay log">
          <span bx-timeline-meta class="hint">v2.1</span>
          Second relay joined the mesh.
        </bx-timeline-item>
      </bx-timeline>

      <h3>Avatar</h3>
      <div class="row" data-testid="avatars">
        <bx-avatar-stack label="Crew on the relay node">
          <bx-avatar name="Robin Vale" [src]="sprite" [pixelated]="true" />
          <bx-avatar name="Sam Okafor" />
          <bx-avatar name="Kit" />
        </bx-avatar-stack>
        <bx-avatar name="Robin Vale" size="md" [src]="sprite" [pixelated]="true" />
        <bx-avatar name="Sam Okafor" size="md" />
        <span class="row"><bx-avatar name="Kit" [decorative]="true" /> Kit (decorative avatar)</span>
      </div>

      <h3>Message log and composer</h3>
      <cat-comms-demo [theme]="key" />

      <h3>Layout</h3>
      <div class="bx-stack bx-gap-4" data-testid="layout-stack">
        <div class="bx-cluster bx-gap-2">
          <bx-badge tone="info">cluster</bx-badge>
          <bx-badge tone="ok">wraps</bx-badge>
          <bx-badge tone="warn">on a phone</bx-badge>
        </div>
        <div class="bx-columns three" data-testid="layout-columns">
          <bx-card><p class="flush">One column on a phone.</p></bx-card>
          <bx-card><p class="flush">Three from the md breakpoint.</p></bx-card>
          <bx-card><p class="flush">Gaps on the spacing scale.</p></bx-card>
        </div>
        <div class="bx-columns bx-columns-phone" data-testid="layout-columns-phone">
          <bx-card><p class="flush">Two columns</p></bx-card>
          <bx-card><p class="flush">on a phone too.</p></bx-card>
        </div>
        <p class="flush">
          Visually hidden text follows<span class="bx-sr-only" data-testid="sr-only">, read only by a screen reader</span>.
        </p>
        <div class="bx-safe-area safe" data-testid="layout-safe-area">
          <p class="flush">A safe area: clear of a notch, at least 12 px in.</p>
        </div>
      </div>

      <h3>Icons</h3>
      <ul class="icons bx-grid bx-gap-2" data-testid="icons">
        @for (icon of icons; track icon) {
          <li><bx-icon [name]="icon" /><code>{{ icon }}</code></li>
        }
        <li><bx-icon name="warning" label="Warning" /><span>labelled: Warning</span></li>
      </ul>

      <h3>Card</h3>
      <bx-card><p class="flush">A card holds any content on the raised surface.</p></bx-card>
      <bx-card [heading]="'Relay health (' + key + ')'" [headingLevel]="4" data-testid="card-header">
        <span bx-card-meta>updated 2 min ago</span>
        <p class="flush">A card header: a heading and a meta slot.</p>
        <div class="bx-grid bx-gap-2 stats" data-testid="stats">
          <bx-stat label="Queue depth" value="12" detail="peak 40 at noon" />
          <bx-stat label="Uptime" value="99.2 %" detail="last 30 days" />
          <bx-stat label="Open alerts" value="0" />
        </div>
      </bx-card>

      <h3>Live-view helper</h3>
      <cat-live-demo />

      @if (key === 'eva') {
        <h3>Nested theme</h3>
        <div class="nested" data-bx-theme="base" data-testid="nested-theme">
          <bx-card><p class="flush">A base card inside eva: themes nest without leaking.</p></bx-card>
          <bx-badge tone="ok">ok</bx-badge>
        </div>
      }

      <h3>Surfaces</h3>
      <div class="grid">
        @for (sample of samplesFor(key); track sample.name) {
          <div>
            <h4>{{ sample.name }}</h4>
            <bx-surface [surface]="sample.surface" />
          </div>
        }
      </div>
    </ng-template>
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
    .theme,
    .variants,
    .variant {
      padding: var(--bx-space-6);
      display: flex;
      flex-direction: column;
      gap: var(--bx-space-3);
    }
    .variant {
      padding: var(--bx-space-3);
      border: var(--bx-line-width) solid var(--bx-border);
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
    .brand {
      padding: 2px var(--bx-space-2);
      background: var(--bx-brand-bg);
      color: var(--bx-brand-fg);
      font-weight: var(--bx-font-weight-bold);
    }
    .series-green {
      color: var(--bx-series-green);
    }
    .series-orange {
      color: var(--bx-series-orange);
    }
    .series-blue {
      color: var(--bx-series-blue);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
      gap: var(--bx-space-3);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--bx-space-1);
      min-inline-size: 0;
    }
    .field label {
      font-size: var(--bx-font-size-sm);
      color: var(--bx-text-muted);
    }
    .hint {
      font-size: var(--bx-font-size-sm);
      color: var(--bx-text-muted);
    }
    .stats {
      --bx-grid-min: 9rem;
    }
    .three {
      --bx-columns: 3;
    }
    .safe {
      --bx-safe-min: var(--bx-space-3);
      border: var(--bx-line-width) dashed var(--bx-border);
    }
    .icons {
      --bx-grid-min: 10rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .icons li {
      display: flex;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .nested {
      display: flex;
      flex-direction: column;
      gap: var(--bx-space-3);
      padding: var(--bx-space-4);
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
  /** An invented 8 × 8 pixel-art sprite, inline: the catalogue loads nothing from another origin. */
  protected readonly sprite = SPRITE;
  protected readonly tones = BADGE_TONES;
  protected readonly icons = ICON_NAMES;
  protected readonly buttonVariants = BUTTON_VARIANTS;
  protected readonly filterText = signal('relay-01');
  protected readonly selectedChannel = signal('ch-1');
  protected readonly channelOptions: readonly SelectOption[] = [
    { value: 'ch-1', label: 'Primary channel' },
    { value: 'ch-2', label: 'Backup channel' },
    { value: 'ch-3', label: 'Standby (offline)', disabled: true },
  ];
  protected readonly colourTokens = SEMANTIC_TOKENS.filter((t) => !/font|radius/.test(t));
  protected readonly variantThemeOptions = options(VARIANT_THEMES);
  protected readonly modeOptions = options(MODES);
  protected readonly accentOptions = options(ACCENTS);
  /** The switcher's choice, checked part by part, on the preview's data-bx-theme, -mode and -accent. */
  protected readonly variantTheme = signal<string>('simple');
  protected readonly variantMode = signal<string>('dark');
  protected readonly variantAccent = signal<string>('orange');
  protected readonly preview = computed(() =>
    themeChoice({
      theme: this.variantTheme(),
      mode: this.variantMode(),
      accent: this.variantAccent(),
    }),
  );
  private readonly byKey = new Map([...THEMES, 'variant'].map((k) => [k, samples(k)]));
  protected samplesFor(key: string) {
    return this.byKey.get(key) ?? [];
  }
}
