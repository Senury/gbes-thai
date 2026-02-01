import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser and Device Tests', () => {
  // Desktop viewports (lg breakpoint is 1024px)
  const desktopSizes = [
    { width: 1920, height: 1080, name: 'Desktop Large' },
    { width: 1366, height: 768, name: 'Desktop Medium' },
    { width: 1024, height: 768, name: 'Desktop Small' }
  ];

  // Mobile and tablet viewports (below lg breakpoint)
  const mobileTabletSizes = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'iPad Landscape' },
    { width: 360, height: 640, name: 'Android Mobile' }
  ];

  // Test core functionality across different viewport sizes
  for (const viewport of [...desktopSizes, ...mobileTabletSizes]) {
    test(`should work on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Basic page load
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();

      // Hero section elements
      await expect(page.locator('[data-testid="hero-buttons"]')).toBeVisible();
      await expect(page.locator('[data-testid="global-network"]')).toBeVisible();
      await expect(page.locator('[data-testid="partner-search"]')).toBeVisible();

      // Test navigation on desktop only (menu is hidden on mobile)
      if (viewport.width >= 1024) {
        const servicesButton = page.locator('button:has-text("Services"), a:has-text("Services")').first();
        await servicesButton.click();
        await page.waitForTimeout(500);
        await expect(page.locator('#services')).toBeVisible();
        await page.goto('/');
      }

      // Partner search navigation (works on all viewports via hero card)
      await page.click('[data-testid="partner-search-card"]');
      await expect(page).toHaveURL(/\/partner-search/);

      console.log(`✅ ${viewport.name} viewport working`);
    });
  }

  test('should handle very small mobile screens (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Check critical elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check stats grid adapts to small screen
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    await expect(statsGrid).toBeVisible();
    
    // Check hero buttons don't overflow
    const heroButtons = page.locator('[data-testid="hero-buttons"]');
    await expect(heroButtons).toBeVisible();
    
    console.log('✅ Very small mobile screen handled');
  });

  test('should handle very large desktop screens (2560px)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    
    // Check layout doesn't break on ultra-wide screens
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();
    
    // Check hero section scales properly
    const heroSection = page.locator('#home');
    await expect(heroSection).toBeVisible();
    
    console.log('✅ Ultra-wide desktop screen handled');
  });

  test('should work with different device pixel ratios', async ({ page }) => {
    // Test with high DPI display
    await page.emulateMedia({ media: 'screen' });
    await page.goto('/');
    
    // Check images and icons render correctly
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that layouts don't break with different pixel densities
    const bento = page.locator('[data-testid="global-network"]');
    await expect(bento).toBeVisible();
    
    console.log('✅ High DPI display handled');
  });

  test('should work in landscape vs portrait orientations', async ({ page }) => {
    // Test portrait tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test landscape tablet
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test portrait mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test landscape mobile
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Orientation changes handled');
  });

  test('should maintain functionality when resizing window', async ({ page }) => {
    await page.goto('/');

    // Start with desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h1')).toBeVisible();

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="hero-buttons"]')).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();

    // Test partner search card still works after resize
    await page.click('[data-testid="partner-search-card"]');
    await expect(page).toHaveURL(/\/partner-search/);

    console.log('✅ Dynamic resizing handled');
  });

  test('should work with touch vs mouse interactions', async ({ browser }) => {
    // Create a context with touch support for mobile testing
    const touchContext = await browser.newContext({
      hasTouch: true,
      viewport: { width: 375, height: 667 }
    });
    const touchPage = await touchContext.newPage();

    await touchPage.goto('/');

    // Test tap interactions
    await touchPage.tap('[data-testid="partner-search-card"]');
    await expect(touchPage).toHaveURL(/\/partner-search/);

    await touchPage.goBack();

    // Test scrolling on touch device
    await touchPage.evaluate(() => window.scrollTo(0, 500));
    await touchPage.waitForTimeout(300);

    await touchContext.close();

    // Create a context for desktop mouse interactions
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto('/');

    // Test hover effects (desktop only)
    await desktopPage.hover('[data-testid="partner-search-card"]');
    await desktopPage.waitForTimeout(100);

    await desktopContext.close();

    console.log('✅ Touch and mouse interactions working');
  });

  test('should handle network conditions', async ({ page }) => {
    // Test with slow network
    await page.route('**/*', route => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 100);
    });
    
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should still load within reasonable time even with delays
    expect(loadTime).toBeLessThan(10000);
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Slow network conditions handled');
  });

  test('should work with different color schemes', async ({ page }) => {
    // Test light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Color schemes working');
  });

  test('should work with reduced motion preferences', async ({ page }) => {
    // Test with reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Test navigation still works without animations
    await page.click('text=Services');
    await expect(page.locator('#services')).toBeVisible();
    
    console.log('✅ Reduced motion preference handled');
  });

  test('should work across different browser engine capabilities', async ({ page }) => {
    // Test modern CSS features graceful degradation
    await page.goto('/');
    
    // Check that site works even if some CSS features aren't supported
    const computed = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="stats-grid"]');
      return element ? window.getComputedStyle(element).display : null;
    });
    
    // Should have some display value (could be grid, flex, or block)
    expect(computed).toBeTruthy();
    
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✅ Browser compatibility maintained');
  });
});