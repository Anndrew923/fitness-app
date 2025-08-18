import { test, expect } from '@playwright/test';

test.describe('basic navigation', () => {
  test('open settings and visit info pages', async ({ page }) => {
    // dev server assumed running via `npm run dev` separately
    await page.goto('http://localhost:5173/');
    await page.click('text=設定'); // bottom nav might require text check; fallback to path
    // Open Privacy Policy
    await page.click('text=前往隱私權政策頁');
    await expect(page).toHaveURL(/privacy-policy/);
    await page.goBack();
    // Open Terms
    await page.click('text=使用條款');
    await expect(page).toHaveURL(/terms/);
  });
});
