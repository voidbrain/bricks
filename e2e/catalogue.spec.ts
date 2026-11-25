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

  test('fits a 320 px phone without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
