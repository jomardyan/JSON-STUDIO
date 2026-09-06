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

async function formatInput(page: import('@playwright/test').Page, content: string) {
  await page.getByRole('textbox', { name: 'Input editor', exact: true }).fill(content);
  await page.getByRole('button', { name: /Format/ }).first().click();
}

test('keeps an empty editor clickable and its line numbers aligned', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear workspace' }).click();
  await page.getByRole('heading', { name: 'Data workspace' }).click();
  const editor = page.getByRole('textbox', { name: 'Input editor', exact: true });
  await editor.click({ position: { x: 20, y: 20 } });
  await editor.pressSequentially('{"ready":true}');
  await expect(editor).toHaveValue('{"ready":true}');
  const lineHeights = await page.evaluate(() => ['.input-editor', '.input-gutter'].map(selector => getComputedStyle(document.querySelector(selector)!).lineHeight));
  expect(lineHeights[0]).toBe(lineHeights[1]);
});

test('chooses conversion formats without overwriting output and reuses YAML correctly', async ({ page }) => {
  await formatInput(page, '{"name":"Ada","active":true}');
  const output = page.getByRole('region', { name: /Output/ });
  await page.getByLabel('Target format', { exact: true }).selectOption('yaml');
  await expect(output).toContainText('Formatted JSON');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(output).toContainText('JSON ➔ YAML');
  await page.getByRole('button', { name: 'Use output as input' }).click();
  await expect(page.getByLabel('Input format', { exact: true })).toHaveValue('yaml');
  await expect(page.getByRole('textbox', { name: 'Input editor', exact: true })).toHaveValue(/name: Ada/);
  await page.getByRole('button', { name: /Format/ }).first().click();
  await expect(output).toContainText('YAML ➔ JSON');
  await expect(output).toContainText('Ada');
});

test('exports the actual result format and marks format changes as stale', async ({ page }) => {
  await page.getByLabel('Target format', { exact: true }).selectOption('yaml');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.ya?ml$/);
  await page.getByLabel('Input format', { exact: true }).selectOption('json5');
  await expect(page.getByText('Input changed', { exact: true })).toBeVisible();
  await expect(page.getByTitle('Automatically detect the input format')).toHaveAttribute('aria-pressed', 'false');
});

test('expands tree branches repeatedly and reveals nested search matches', async ({ page }) => {
  await formatInput(page, '{"users":[{"profile":{"city":"Warsaw"}}],"unrelated":{"city":"Paris"}}');
  const output = page.getByRole('region', { name: /Output/ });
  await output.getByRole('button', { name: 'Tree', exact: true }).click();
  await output.getByRole('button', { name: 'Expand All', exact: true }).click();
  await output.getByRole('button', { name: 'Collapse $.users', exact: true }).click();
  await output.getByRole('button', { name: 'Expand All', exact: true }).click();
  await expect(output.getByText('"Warsaw"', { exact: true })).toBeVisible();
  await output.getByRole('button', { name: 'Collapse All', exact: true }).click();
  await output.getByRole('button', { name: 'Expand $', exact: true }).press('Enter');
  await output.getByRole('button', { name: 'Collapse All', exact: true }).click();
  await expect(output.getByRole('button', { name: 'Expand $', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search tree keys or values' }).fill('Warsaw');
  await expect(output.getByText('"Warsaw"', { exact: true })).toBeVisible();
  await expect(output.getByText('unrelated', { exact: true })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Search tree keys or values' }).fill('not-found');
  await expect(output.getByText('No keys or values match your search.')).toBeVisible();
});

test('sorts, filters nested values, and pages through table records', async ({ page }) => {
  const records = Array.from({ length: 125 }, (_, index) => ({ amount: 125 - index, profile: { city: index === 100 ? 'Warsaw' : 'Paris' } }));
  await formatInput(page, JSON.stringify(records));
  const output = page.getByRole('region', { name: /Output/ });
  await output.getByRole('button', { name: 'Table', exact: true }).click();
  const table = output.getByRole('table', { name: 'Output data' });
  await expect(table.locator('tbody tr')).toHaveCount(50);
  await page.getByRole('button', { name: 'Next table page' }).click();
  await expect(output.getByRole('status')).toContainText('51–100 of 125');
  await page.getByRole('button', { name: 'Sort by amount' }).click();
  await expect(table.locator('tbody tr').first().locator('td').nth(1)).toHaveText('1');
  await page.getByRole('textbox', { name: 'Search table rows' }).fill('warsaw');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.locator('tbody tr').first().locator('td').first()).toHaveText('101');
  await page.getByRole('textbox', { name: 'Search table rows' }).fill('not-found');
  await expect(output.getByText(/No rows match your search/)).toBeVisible();
  await page.getByRole('button', { name: 'Clear table search' }).click();
  await expect(table.locator('tbody tr')).toHaveCount(50);
});

test('renders false, zero, and null in structured views', async ({ page }) => {
  for (const value of ['false', '0', 'null']) {
    await formatInput(page, value);
    const output = page.getByRole('region', { name: /Output/ });
    await output.getByRole('button', { name: 'Tree', exact: true }).click();
    await expect(output.getByText(value, { exact: true })).toBeVisible();
    await output.getByRole('button', { name: 'Table', exact: true }).click();
    await expect(output.getByRole('table').locator('tbody tr').first().locator('td').nth(1)).toHaveText(value);
  }
});

test('keeps mobile commands reachable and keyboard focus inside the palette', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page.getByRole('button', { name: 'Search features and commands' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  const search = dialog.getByRole('combobox', { name: 'Search commands' });
  await expect(search).toBeFocused();
  await search.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close command palette' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Close command palette' }).press('Tab');
  await expect(search).toBeFocused();
  await search.fill('minify');
  await search.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('region', { name: /Output/ })).toContainText('Minified JSON');
  await trigger.click();
  await search.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('focus mode keeps both editors usable and exits with Escape', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Focus mode', exact: true }).click();
  await expect(page.getByRole('banner')).toBeHidden();
  await expect(page.getByRole('region', { name: /Input/ })).toBeVisible();
  await expect(page.getByRole('region', { name: /Output/ })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('workspace-focus-desktop.png') });
  await page.getByRole('textbox', { name: 'Input editor', exact: true }).press('Escape');
  await expect(page.getByRole('banner')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('workspace-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => {
    const input = await page.getByRole('region', { name: /Input/ }).boundingBox();
    const output = await page.getByRole('region', { name: /Output/ }).boundingBox();
    return output!.y - input!.y - input!.height;
  }).toBeLessThan(32);
  await page.screenshot({ path: testInfo.outputPath('workspace-mobile.png'), fullPage: true });
});
