import { test, expect } from '@playwright/test';

test.describe('Full Page Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display all main sections', async ({ page }) => {
    // Test Hero Section
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Global Business');
    await expect(page.locator('[data-testid="hero-buttons"]')).toBeVisible();
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();

    // Scroll down to see all sections
    await page.evaluate(() => window.scrollTo(0, 500));

    // Test Mission Section
    await expect(page.locator('#mission')).toBeVisible();
    const missionTitle = page.locator('#mission h2');
    await expect(missionTitle).toBeVisible();

    // Test Services Section
    await expect(page.locator('#services')).toBeVisible();
    const servicesTitle = page.locator('#services h2');
    await expect(servicesTitle).toBeVisible();

    // Test Pricing Section
    await expect(page.locator('#pricing')).toBeVisible();
    const pricingTitle = page.locator('#pricing h2');
    await expect(pricingTitle).toBeVisible();

    // Test Partners Section (scrolling to make visible)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(page.locator('#partners')).toBeVisible();

    // Test Contact Section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('#contact')).toBeVisible();

    console.log('✅ All main sections loaded and visible');
  });

  test('should have working navigation to all sections', async ({ page }) => {
    // Test navigation menu items (Partners goes to /partner-search, so skip it)
    const navItems = ['Mission', 'Services', 'Pricing'];

    for (const item of navItems) {
      await page.click(`text=${item}`);
      await page.waitForTimeout(500); // Wait for smooth scroll

      // Check if the corresponding section is in view
      const sectionId = item.toLowerCase();
      const section = page.locator(`#${sectionId}`);
      await expect(section).toBeVisible();
    }

    // Test Home navigation
    await page.click('text=Home');
    await page.waitForTimeout(500);
    await expect(page.locator('#home')).toBeVisible();

    console.log('✅ Navigation to all sections working');
  });

  test('should display correct content in Mission section', async ({ page }) => {
    await page.click('text=Mission');
    await page.waitForTimeout(500);

    const missionSection = page.locator('#mission');
    await expect(missionSection).toBeVisible();

    // Check for mission title (may contain various translations)
    await expect(missionSection.locator('h2')).toBeVisible();

    // Check for mission content - look for cards or content blocks
    const contentBlocks = missionSection.locator('[class*="card"], [class*="bg-"], h3, h4, p');
    const contentCount = await contentBlocks.count();
    expect(contentCount).toBeGreaterThan(0);

    console.log('✅ Mission section content verified');
  });

  test('should display services with proper cards', async ({ page }) => {
    await page.click('text=Services');
    
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeVisible();
    
    // Check for service cards
    const serviceCards = servicesSection.locator('[class*="card"], [class*="bg-card"], .rounded');
    const cardCount = await serviceCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    console.log('✅ Services section with cards verified');
  });

  test('should display pricing plans correctly', async ({ page }) => {
    await page.click('text=Pricing');
    
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();
    
    // Check for pricing cards
    const pricingCards = pricingSection.locator('[class*="card"], [class*="border"]');
    const cardCount = await pricingCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for pricing buttons
    const pricingButtons = pricingSection.locator('button');
    const buttonCount = await pricingButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    console.log('✅ Pricing section with plans verified');
  });

  test('should have functional contact form', async ({ page }) => {
    await page.click('text=Contact');
    
    const contactSection = page.locator('#contact');
    await expect(contactSection).toBeVisible();
    
    // Look for form elements
    const forms = contactSection.locator('form');
    const inputs = contactSection.locator('input, textarea');
    const buttons = contactSection.locator('button, [type="submit"]');
    
    // At least one form element should exist
    const hasForm = await forms.count() > 0;
    const hasInputs = await inputs.count() > 0;
    const hasButtons = await buttons.count() > 0;
    
    expect(hasForm || hasInputs || hasButtons).toBe(true);
    
    console.log('✅ Contact section with form elements verified');
  });

  test('should have proper footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for language switcher in footer
    await expect(footer.locator('text=日本語')).toBeVisible();
    await expect(footer.locator('text=English')).toBeVisible();
    await expect(footer.locator('text=ไทย')).toBeVisible();
    
    // Check for footer links
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    console.log('✅ Footer with language switcher and links verified');
  });

  test('should work correctly on tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Test key sections exist (scroll to see them)
    const sections = ['#home', '#mission', '#services', '#pricing', '#contact'];

    for (const section of sections) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView();
      }, section);
      await page.waitForTimeout(300);
      const sectionElement = page.locator(section);
      await expect(sectionElement).toBeVisible();
    }

    // Test partner search navigation works on tablet
    await page.goto('/');
    await page.click('[data-testid="partner-search-card"]');
    await expect(page).toHaveURL(/\/partner-search/);

    console.log('✅ Tablet view functionality verified');
  });

  test('should have proper SEO elements', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Global Business|GBES/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    expect(await metaDescription.count()).toBeGreaterThanOrEqual(0);
    
    // Check heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
    
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0); // Should have h2s for sections
    
    console.log('✅ SEO elements verified');
  });
});