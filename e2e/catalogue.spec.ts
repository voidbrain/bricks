import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { THEMES } from '../projects/bricks/themes/themes';
import { SEMANTIC_TOKENS } from '../projects/bricks/tokens/tokens';

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
});
