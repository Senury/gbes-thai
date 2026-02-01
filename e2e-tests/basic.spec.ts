import { test, expect } from '@playwright/test';

test.describe('Website Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Global Business/);
    await expect(page.locator('h1')).toContainText('Global Business');
  });

  test('should navigate to different languages', async ({ page }) => {
    // Scroll to bottom to access footer language switcher
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Test Japanese navigation via footer
    await page.click('text=日本語');
    await expect(page).toHaveURL(/\/ja/);
    
    // Scroll to bottom again for Thai
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.click('text=ไทย');
    await expect(page).toHaveURL(/\/th/);
    
    // Back to English
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.click('text=English');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should redirect free plan to signup', async ({ page }) => {
    // Scroll to pricing section
    await page.click('text=Pricing');
    
    // Find and click free plan button
    await page.click('[data-testid="free-plan-button"]');
    
    // Should redirect to signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should navigate to partner search', async ({ page }) => {
    // Click on partner search card in hero bento grid
    await page.click('[data-testid="partner-search-card"]');
    await expect(page).toHaveURL(/\/partner-search/);
  });

  test('should navigate to business chat', async ({ page }) => {
    // Click on business chat card in hero bento grid
    await page.click('[data-testid="business-chat-card"]');
    // It may redirect to login if not authenticated, which is expected behavior
    await expect(page).toHaveURL(/\/(messages|login)/);
  });

  test('should display correct bento grid content in different languages', async ({ page }) => {
    // Check English content
    await expect(page.locator('[data-testid="global-network"]')).toContainText('Global Network');
    await expect(page.locator('[data-testid="partner-search"]')).toContainText('Partner Search');
    
    // Switch to Japanese via footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.click('text=日本語');
    
    // Check Japanese content
    await expect(page.locator('[data-testid="global-network"]')).toContainText('グローバルネットワーク');
    await expect(page.locator('[data-testid="partner-search"]')).toContainText('パートナー検索');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile elements are visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="hero-buttons"]')).toBeVisible();
    
    // Check if stats grid has 3 items (instead of exact CSS)
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    await expect(statsGrid).toBeVisible();
    const statItems = statsGrid.locator('> div');
    await expect(statItems).toHaveCount(3);
  });
});