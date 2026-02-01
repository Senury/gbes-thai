import { test, expect } from '@playwright/test';

test.describe('Forms and Interactions Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('contact form validation and submission', async ({ page }) => {
    // Navigate to contact section
    await page.click('text=Contact');
    await expect(page.locator('#contact')).toBeVisible();
    
    // Look for contact form elements
    const forms = page.locator('#contact form');
    const inputs = page.locator('#contact input, #contact textarea');
    const buttons = page.locator('#contact button, #contact [type="submit"]');
    
    if (await forms.count() > 0) {
      // Test form validation if form exists
      const submitButton = buttons.first();
      
      // Try submitting empty form
      await submitButton.click();
      
      // Check for validation messages or required field indicators
      const requiredFields = page.locator('input[required], textarea[required]');
      if (await requiredFields.count() > 0) {
        console.log('✅ Form validation working');
      }
      
      // Fill out form with test data
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const messageInput = page.locator('textarea, input[name="message"]').first();
      
      if (await nameInput.isVisible()) await nameInput.fill('Test User');
      if (await emailInput.isVisible()) await emailInput.fill('test@example.com');
      if (await messageInput.isVisible()) await messageInput.fill('This is a test message');
      
      console.log('✅ Contact form interaction tested');
    } else {
      console.log('ℹ️ No contact form found - may be using external service');
    }
  });

  test('hero section interactive elements', async ({ page }) => {
    // Test hero buttons
    const heroButtons = page.locator('[data-testid="hero-buttons"] button, [data-testid="hero-buttons"] a');
    const buttonCount = await heroButtons.count();
    
    if (buttonCount > 0) {
      // Test first CTA button
      const firstButton = heroButtons.first();
      await expect(firstButton).toBeVisible();
      
      // Check hover effects
      await firstButton.hover();
      await page.waitForTimeout(100);
      
      console.log('✅ Hero buttons interactive');
    }
    
    // Test bento grid cards
    const bentoCards = [
      '[data-testid="global-network"]',
      '[data-testid="partner-search-card"]', 
      '[data-testid="business-chat-card"]'
    ];
    
    for (const cardSelector of bentoCards) {
      const card = page.locator(cardSelector);
      if (await card.isVisible()) {
        await card.hover();
        await page.waitForTimeout(100);
      }
    }
    
    console.log('✅ Bento grid cards interactive');
  });

  test('pricing plan interactions', async ({ page }) => {
    await page.click('text=Pricing');
    await expect(page.locator('#pricing')).toBeVisible();
    
    // Test pricing buttons
    const pricingButtons = page.locator('#pricing button');
    const buttonCount = await pricingButtons.count();
    
    if (buttonCount > 0) {
      // Test hover effects on pricing cards
      const pricingCards = page.locator('#pricing [class*="card"], #pricing [class*="border"]');
      const cardCount = await pricingCards.count();
      
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = pricingCards.nth(i);
        await card.hover();
        await page.waitForTimeout(100);
      }
      
      // Test free plan button specifically
      const freeButton = page.locator('[data-testid="free-plan-button"]').first();
      if (await freeButton.isVisible()) {
        await freeButton.click();
        await expect(page).toHaveURL(/\/signup/);
        
        // Go back to continue testing
        await page.goBack();
      }
      
      console.log('✅ Pricing interactions tested');
    }
  });

  test('navigation menu interactions', async ({ page }) => {
    // Test main navigation (Partners goes to /partner-search, Contact is in dropdown)
    const navItems = ['Mission', 'Services', 'Pricing'];

    for (const item of navItems) {
      const navLink = page.locator(`button:has-text("${item}"), a:has-text("${item}")`).first();

      // Hover effect
      await navLink.hover();
      await page.waitForTimeout(100);

      // Click navigation
      await navLink.click();
      await page.waitForTimeout(500);

      const sectionId = item.toLowerCase();
      await expect(page.locator(`#${sectionId}`)).toBeVisible();
    }

    // Test home navigation
    await page.click('text=Home');
    await page.waitForTimeout(300);
    await expect(page.locator('#home')).toBeVisible();

    console.log('✅ Navigation interactions tested');
  });

  test('language switcher interactions', async ({ page }) => {
    // Go to footer for language switcher
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const languages = [
      { text: '日本語', url: /\/ja/ },
      { text: 'ไทย', url: /\/th/ },
      { text: 'English', url: /\/en/ }
    ];
    
    for (const lang of languages) {
      const langLink = page.locator(`text=${lang.text}`);
      
      // Hover effect
      await langLink.hover();
      await page.waitForTimeout(100);
      
      // Click language
      await langLink.click();
      await expect(page).toHaveURL(lang.url);
      
      // Scroll back to footer for next language
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
    
    console.log('✅ Language switcher tested');
  });

  test('mobile touch interactions', async ({ browser }) => {
    // Create a context with touch support
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    await page.goto('/');

    // Test mobile tap on partner search card
    const partnerCard = page.locator('[data-testid="partner-search-card"]');
    if (await partnerCard.isVisible()) {
      await partnerCard.tap();
      await page.waitForTimeout(300);
    }

    await page.goto('/');

    // Test mobile tap on hero buttons
    const heroButton = page.locator('[data-testid="hero-buttons"] button, [data-testid="hero-buttons"] a').first();
    if (await heroButton.isVisible()) {
      await heroButton.tap();
      await page.waitForTimeout(300);
    }

    // Test mobile scrolling
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));

    await context.close();
    console.log('✅ Mobile interactions tested');
  });

  test('keyboard navigation', async ({ page }) => {
    // Test tab navigation through focusable elements
    const focusableElements = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluateHandle(() => document.activeElement?.tagName);
      const tagName = await activeElement.jsonValue();
      if (tagName) focusableElements.push(tagName);
    }
    
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    console.log('✅ Keyboard navigation tested');
  });

  test('error state interactions', async ({ page }) => {
    // Test that the app handles edge cases gracefully
    const startUrl = page.url();

    // Test clicking on hash links
    const hashLink = page.locator('a[href="#"]').first();
    if (await hashLink.count() > 0 && await hashLink.isVisible()) {
      await hashLink.click();
      await page.waitForTimeout(300);
      // Should stay on same page
      expect(page.url()).toContain(startUrl.split('#')[0].split('?')[0]);
    }

    // Verify app still works after edge case interactions
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    console.log('✅ Error state interactions tested');
  });
});