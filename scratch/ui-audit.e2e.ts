import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const privacyButton = page.getByRole('button', { name: 'I Understand' });
  if (await privacyButton.isVisible()) await privacyButton.click();
});

test('keeps the workspace bounded and avoids horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    pageHeight: document.body.scrollHeight,
    editors: Array.from(document.querySelectorAll('[role="region"]')).map((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    })),
    overflowing: Array.from(document.querySelectorAll('body *'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          text: (element.textContent || '').trim().slice(0, 40),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          className: typeof element.className === 'string' ? element.className.slice(0, 100) : '',
        };
      })
      .filter((element) => element.right > window.innerWidth + 1 || element.left < -1)
      .slice(0, 10),
  }));

  expect(dimensions.overflowing, JSON.stringify(dimensions.overflowing, null, 2)).toEqual([]);
  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.pageHeight).toBeLessThan(2400);
  expect(dimensions.editors).toHaveLength(2);
  expect(dimensions.editors.every((editor) => editor.clientHeight <= 620)).toBe(true);
});

test('communicates stale output and clears the complete workspace', async ({ page }) => {
  const inputEditor = page.locator('textarea[spellcheck="false"]').first();

  await inputEditor.fill('{"name":"Ada"}');
  await expect(page.getByText('Input changed')).toBeVisible();

  await page.getByRole('button', { name: /Format/ }).first().click();
  await expect(page.getByText('Input changed')).toHaveCount(0);
  await expect(page.getByRole('region', { name: /Output/ })).toContainText('Ada');

  await page.getByRole('button', { name: 'Clear workspace' }).click();
  await expect(inputEditor).toHaveValue('');
  await expect(page.getByText('Output will appear here')).toBeVisible();
});
