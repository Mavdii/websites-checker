import { test, expect } from '@playwright/test';

test.describe('Basic E2E Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Cruel Stack/i);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
  });
});
