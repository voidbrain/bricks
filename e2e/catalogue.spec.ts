import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { THEMES } from '../projects/bricks/themes/themes';
import { ICON_NAMES } from '../projects/bricks/foundations/icons';
import { BREAKPOINTS } from '../projects/bricks/foundations/layout';
import { COMPONENT_TOKENS, SEMANTIC_TOKENS } from '../projects/bricks/tokens/tokens';

test.describe('catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('section.theme')).toHaveCount(THEMES.length);
  });

  test('the whole page passes axe (WCAG 2.2 AA, colour contrast included)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(
      results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      ),
    ).toEqual([]);
  });

  for (const theme of THEMES) {
    test(`theme ${theme} passes axe on its own and defines every semantic token`, async ({
      page,
    }) => {
      const selector = `section[data-bx-theme="${theme}"]`;
      const results = await new AxeBuilder({ page })
        .include(selector)
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
      const missing = await page
        .locator(selector)
        .evaluate(
          (el, tokens) =>
            tokens.filter((t) => getComputedStyle(el).getPropertyValue(t).trim() === ''),
          [...SEMANTIC_TOKENS],
        );
      expect(missing).toEqual([]);
    });
  }

  test('a theme changes colours, not components', async ({ page }) => {
    const bg = (theme: string) =>
      page
        .locator(`section[data-bx-theme="${theme}"] bx-card .card`)
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(new Set([await bg('base'), await bg('plain'), await bg('eva')]).size).toBe(3);
  });

  test('a checklist tick shows at once and keyboard focus is visible', async ({ page }) => {
    const box = page
      .locator('section[data-bx-theme="eva"] bx-checklist-card input[type=checkbox]')
      .nth(1);
    await box.focus();
    await page.keyboard.press('Space');
    await expect(box).toBeChecked();
    const outline = await box.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('every theme renders all five form primitives with keyboard operation and focus outline', async ({
    page,
  }) => {
    for (const theme of THEMES) {
      const section = page.locator(`section[data-bx-theme="${theme}"]`);
      await expect(section.locator('bx-button button').first()).toBeVisible();
      await expect(section.locator('bx-input input').first()).toBeVisible();
      await expect(section.locator('bx-select select').first()).toBeVisible();
      await expect(section.locator('bx-toggle button[role="switch"]').first()).toBeVisible();
      await expect(section.locator('bx-tag').first()).toBeVisible();
    }

    const toggle = page
      .locator('section[data-bx-theme="eva"] bx-toggle button[role="switch"]')
      .first();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    const outline = await toggle.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('live-view demo renders in every theme, keeps DOM nodes on unchanged updates, and patches single values', async ({
    page,
  }) => {
    for (const theme of THEMES) {
      await expect(
        page.locator(`section[data-bx-theme="${theme}"] [data-testid="live-demo"]`),
      ).toBeVisible();
    }

    const demo = page.locator('section[data-bx-theme="eva"] [data-testid="live-demo"]');
    const details = demo.locator('details').first();
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');

    await demo.getByRole('button', { name: 'Replay unchanged' }).click();
    await expect(demo.locator('[data-testid="live-mutations"]')).toHaveText('0');
    await expect(details).toHaveAttribute('open', '');

    await demo.getByRole('button', { name: 'Tick one value' }).click();
    await expect(demo.locator('[data-testid="live-mutations"]')).toHaveText('1');
    await expect(details).toHaveAttribute('open', '');
  });

  test('fits a 320 px phone without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
  test('a theme nested inside another takes its own tokens, and nothing leaks either way', async ({
    page,
  }) => {
    const nested = page.locator('[data-testid="nested-theme"]');
    await expect(nested).toHaveAttribute('data-bx-theme', 'base');
    const read = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            bg: s.backgroundColor,
            fg: s.color,
            card: s.getPropertyValue('--bx-card-bg').trim(),
          };
        });
    const inner = await read('[data-testid="nested-theme"] bx-card .card');
    const outer = await read('section[data-bx-theme="eva"] > bx-card .card');
    const base = await read('section[data-bx-theme="base"] > bx-card .card');
    expect(inner.bg).toBe(base.bg);
    expect(inner.fg).toBe(base.fg);
    expect(inner.card).toBe('#ffffff');
    expect(outer.bg).not.toBe(base.bg);
    expect(outer.card).toBe('#0d0d12');
    const results = await new AxeBuilder({ page })
      .include('[data-testid="nested-theme"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('layout: columns stack on a phone and widen from the md breakpoint, gaps follow the spacing scale', async ({
    page,
  }) => {
    const columns = (theme: string) =>
      page
        .locator(`section[data-bx-theme="${theme}"] [data-testid="layout-columns"]`)
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    await page.setViewportSize({ width: BREAKPOINTS.md - 1, height: 800 });
    for (const theme of THEMES) expect(await columns(theme)).toBe(1);
    await page.setViewportSize({ width: BREAKPOINTS.md, height: 800 });
    for (const theme of THEMES) expect(await columns(theme)).toBe(3);
    const gap = await page
      .locator('section[data-bx-theme="base"] [data-testid="layout-stack"]')
      .evaluate((el) => getComputedStyle(el).rowGap);
    expect(gap).toBe('16px');
  });

  test('layout: a safe area keeps at least its minimum padding and reads the inset tokens', async ({
    page,
  }) => {
    const area = page.locator('section[data-bx-theme="base"] [data-testid="layout-safe-area"]');
    const read = await area.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        padding: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft],
        top: s.getPropertyValue('--bx-safe-top').trim(),
      };
    });
    expect(read.padding).toEqual(['12px', '12px', '12px', '12px']);
    expect(read.top).not.toBe('');
  });

  test('icons: every icon in every theme is inline, in currentColor, and named or hidden', async ({
    page,
  }) => {
    for (const theme of THEMES) {
      const icons = page.locator(`section[data-bx-theme="${theme}"] [data-testid="icons"] bx-icon`);
      await expect(icons).toHaveCount(ICON_NAMES.length + 1);
    }
    const problems = await page.locator('bx-icon svg').evaluateAll((svgs) =>
      svgs.flatMap((svg) => {
        const out: string[] = [];
        const named = svg.getAttribute('role') === 'img' && !!svg.getAttribute('aria-label');
        if (!named && svg.getAttribute('aria-hidden') !== 'true')
          out.push('neither named nor hidden');
        if (getComputedStyle(svg).stroke !== getComputedStyle(svg.parentElement!).color)
          out.push('stroke is not currentColor');
        if (svg.querySelector('use, image, foreignObject')) out.push('external reference');
        return out;
      }),
    );
    expect(problems).toEqual([]);
  });

  test('loads nothing from another origin: no icon font, no CDN', async ({ page, baseURL }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      if (new URL(r.url()).origin !== new URL(baseURL!).origin) foreign.push(r.url());
    });
    await page.reload();
    await expect(page.locator('section.theme')).toHaveCount(THEMES.length);
    expect(foreign).toEqual([]);
  });

  test('every component token resolves in every theme', async ({ page }) => {
    for (const theme of THEMES) {
      const missing = await page
        .locator(`section[data-bx-theme="${theme}"]`)
        .evaluate(
          (el, tokens) =>
            tokens.filter((t) => getComputedStyle(el).getPropertyValue(t).trim() === ''),
          [...COMPONENT_TOKENS],
        );
      expect(missing, theme).toEqual([]);
    }
  });

  test('card header: a named region with a heading and meta; eva fills the bar and glows', async ({
    page,
  }) => {
    const read = (theme: string) =>
      page
        .locator(`section[data-bx-theme="${theme}"] [data-testid="card-header"]`)
        .evaluate((host) => {
          const card = host.querySelector('section.card')!;
          const head = host.querySelector('header.head')!;
          const root = host.closest('[data-bx-theme]')!;
          return {
            bar: getComputedStyle(head).backgroundColor,
            accent: getComputedStyle(root).getPropertyValue('--bx-accent').trim(),
            glow: getComputedStyle(card).boxShadow,
          };
        });
    for (const theme of THEMES) {
      const card = page.locator(`section[data-bx-theme="${theme}"] [data-testid="card-header"]`);
      await expect(card.getByRole('region', { name: `Relay health (${theme})` })).toBeVisible();
      await expect(card.getByRole('heading', { level: 4 })).toHaveText(`Relay health (${theme})`);
      await expect(card.locator('header [bx-card-meta]')).toHaveText('updated 2 min ago');
      await expect(card.getByRole('group', { name: 'Queue depth' })).toContainText('12');
    }
    const eva = await read('eva');
    expect(eva.bar).toBe('rgb(255, 102, 0)');
    expect(eva.glow).not.toBe('none');
    for (const theme of ['base', 'plain']) {
      const r = await read(theme);
      expect(r.bar).toBe('rgba(0, 0, 0, 0)');
      expect(r.glow).toBe('none');
    }
  });

  test('stat tiles wrap to one column at 320 px without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const columns = await page
      .locator('section[data-bx-theme="base"] [data-testid="stats"]')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
  });

  test('compact buttons keep a 24 px target and are smaller than the default', async ({ page }) => {
    for (const theme of THEMES) {
      const section = page.locator(`section[data-bx-theme="${theme}"]`);
      const compact = await section
        .locator('[data-testid="compact-buttons"] button')
        .first()
        .boundingBox();
      const normal = await section.locator('bx-button button').first().boundingBox();
      expect(compact!.height).toBeGreaterThanOrEqual(24);
      expect(compact!.height).toBeLessThan(normal!.height);
    }
  });

  test('outlined and dashed badges draw the tone as border and text', async ({ page }) => {
    const read = await page
      .locator('section[data-bx-theme="eva"] [data-testid="outline-badges"] .badge')
      .evaluateAll((els) =>
        els.map((el) => {
          const s = getComputedStyle(el);
          return {
            border: s.borderTopColor,
            color: s.color,
            style: s.borderTopStyle,
            bg: s.backgroundColor,
          };
        }),
      );
    expect(read).toHaveLength(5);
    for (const r of read) {
      expect(r.border).toBe(r.color);
      expect(r.bg).toBe('rgba(0, 0, 0, 0)');
    }
    expect(read.map((r) => r.style)).toEqual(['solid', 'solid', 'solid', 'solid', 'dashed']);
  });

  test('meters expose value and range, fill by value and place the threshold mark', async ({
    page,
  }) => {
    for (const theme of THEMES) {
      const meter = page
        .locator(`section[data-bx-theme="${theme}"]`)
        .getByRole('meter', { name: 'Budget used' });
      await expect(meter).toHaveAttribute('aria-valuenow', '30');
      await expect(meter).toHaveAttribute('aria-valuemax', '120');
      const geo = await meter.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const fill = el.querySelector('.fill')!.getBoundingClientRect();
        const mark = el.querySelector('.mark')!.getBoundingClientRect();
        const border = parseFloat(getComputedStyle(el).borderLeftWidth);
        const inner = box.width - 2 * border;
        return {
          fill: fill.width / inner,
          mark: (mark.left + mark.width / 2 - box.left - border) / inner,
        };
      });
      expect(geo.fill).toBeCloseTo(0.25, 2);
      expect(geo.mark).toBeCloseTo(0.75, 2);
    }
  });

  test('a disclosure opens and closes from the keyboard', async ({ page }) => {
    const disclosure = page.locator('section[data-bx-theme="plain"] [data-testid="disclosure"]');
    const summary = disclosure.locator('summary');
    const details = disclosure.locator('details');
    await summary.focus();
    expect(await summary.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await expect(disclosure.getByText('Three relays')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(details).not.toHaveAttribute('open', '');
  });

  test('inline alerts take the role their announce asks for', async ({ page }) => {
    for (const theme of THEMES) {
      const alerts = page.locator(
        `section[data-bx-theme="${theme}"] [data-testid="alerts"] bx-alert`,
      );
      expect(await alerts.evaluateAll((els) => els.map((el) => el.getAttribute('role')))).toEqual([
        'note',
        'note',
        'alert',
      ]);
    }
  });

  test('bx-columns-phone keeps two columns at 320 px; bx-sr-only hides text but keeps it readable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const theme of THEMES) {
      const section = page.locator(`section[data-bx-theme="${theme}"]`);
      const columns = await section
        .locator('[data-testid="layout-columns-phone"]')
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(2);
      const hidden = section.locator('[data-testid="sr-only"]');
      const box = await hidden.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(1);
      await expect(hidden).toHaveText(', read only by a screen reader');
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('timeline: a named list whose markers sit on its line, in every theme', async ({ page }) => {
    for (const theme of THEMES) {
      const timeline = page
        .locator(`section[data-bx-theme="${theme}"]`)
        .getByRole('list', { name: 'Coming up' });
      await expect(timeline.getByRole('listitem')).toHaveCount(3);
      const geo = await timeline.evaluate((el) => {
        const line = getComputedStyle(el, '::before');
        const box = el.getBoundingClientRect();
        const lineX = box.left + parseFloat(line.left) + parseFloat(line.width) / 2;
        return [...el.querySelectorAll('.marker')].map((m) => {
          const r = m.getBoundingClientRect();
          return { offset: Math.abs(r.left + r.width / 2 - lineX), width: r.width };
        });
      });
      expect(geo).toHaveLength(3);
      for (const g of geo) {
        expect(g.offset).toBeLessThanOrEqual(1);
        expect(g.width).toBe(8);
      }
      await expect(timeline.locator('time').first()).toHaveAttribute(
        'datetime',
        '2026-11-27T09:30',
      );
    }
  });

  test('avatars: 20 and 32 px, an image or named initials, decorative ones hidden', async ({
    page,
  }) => {
    for (const theme of THEMES) {
      const avatars = page.locator(`section[data-bx-theme="${theme}"] [data-testid="avatars"]`);
      const stack = avatars.getByRole('group', { name: 'Crew on the relay node' });
      await expect(stack.locator('bx-avatar')).toHaveCount(3);
      await expect(stack.getByRole('img', { name: 'Robin Vale' })).toHaveCount(1);
      await expect(stack.getByRole('img', { name: 'Sam Okafor' })).toHaveText('SO');
      const sizes = await avatars
        .locator('bx-avatar')
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
      expect(sizes).toEqual([20, 20, 20, 32, 32, 20]);
      const sprite = avatars.locator('img').first();
      await sprite.scrollIntoViewIfNeeded();
      await expect
        .poll(() => sprite.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
        .toBeGreaterThan(0);
      await expect(avatars.getByRole('img', { name: 'Kit' })).toHaveCount(1);
    }
  });
});
