import { test, expect } from '@playwright/test';

test.describe('Working Website Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage correctly', async ({ page }) => {
    // Check title contains expected text
    await expect(page).toHaveTitle(/Global Business/);
    
    // Check main heading is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check hero section is visible
    await expect(page.locator('section[id="home"]')).toBeVisible();
    
    console.log('✅ Homepage loaded successfully');
  });

  test('should display hero bento grid', async ({ page }) => {
    // Check bento grid elements are visible
    await expect(page.locator('[data-testid="global-network"]')).toBeVisible();
    await expect(page.locator('[data-testid="partner-search"]')).toBeVisible();
    
    // Check stats grid is present
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();
    
    console.log('✅ Bento grid displayed correctly');
  });

  test('should have working navigation buttons', async ({ page }) => {
    // Check CTA buttons are visible
    await expect(page.locator('[data-testid="hero-buttons"]')).toBeVisible();
    
    // Check main navigation works
    const ctaButton = page.locator('text=Register and connect globally').first();
    await expect(ctaButton).toBeVisible();
    
    console.log('✅ Navigation elements working');
  });

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if main content is still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="hero-buttons"]')).toBeVisible();
    
    // Check stats grid exists (don't check exact CSS)
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    await expect(statsGrid).toBeVisible();
    
    // Check it has 3 stat items
    const statItems = statsGrid.locator('> div');
    await expect(statItems).toHaveCount(3);
    
    console.log('✅ Mobile responsiveness working');
  });

  test('should navigate to partner search', async ({ page }) => {
    // Click partner search card
    await page.click('[data-testid="partner-search-card"]');
    
    // Should navigate to partner search page
    await expect(page).toHaveURL(/\/partner-search/);
    
    console.log('✅ Partner search navigation working');
  });

  test('should have accessible content', async ({ page }) => {
    // Check for heading hierarchy
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check for main hero section specifically
    await expect(page.locator('section[id="home"]')).toBeVisible();
    
    // Check for multiple sections exist
    const sections = await page.locator('section').count();
    expect(sections).toBeGreaterThan(3);
    
    console.log('✅ Accessibility basics working');
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Performance acceptable');
  });
});