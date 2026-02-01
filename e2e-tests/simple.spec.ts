import { test, expect } from '@playwright/test';

test('simple homepage test', async ({ page }) => {
  await page.goto('/');
  
  // Check if the page loads
  await expect(page).toHaveTitle(/Global Business|GBES/);
  
  // Check if main heading exists
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  
  console.log('✅ Homepage loaded successfully');
});