import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcpValue: number | undefined;
        let lcpValue: number | undefined;
        let clsValue: number | undefined;
        
        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              fcpValue = entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cumulative Layout Shift
        let clsScore = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          clsValue = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait a bit for metrics to be collected
        setTimeout(() => {
          resolve({
            fcp: fcpValue,
            lcp: lcpValue,
            cls: clsValue
          });
        }, 2000);
      });
    });
    
    console.log('Core Web Vitals:', vitals);
    
    // Assert good performance thresholds
    if (vitals.fcp) expect(vitals.fcp).toBeLessThan(2500); // FCP should be < 2.5s
    if (vitals.lcp) expect(vitals.lcp).toBeLessThan(4000); // LCP should be < 4s
    if (vitals.cls !== undefined) expect(vitals.cls).toBeLessThan(0.25); // CLS should be < 0.25
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      // Check if images have proper loading attributes
      const loading = await img.getAttribute('loading');
      const src = await img.getAttribute('src');
      
      if (src) {
        // Images should either be eager loading (above fold) or lazy loading
        expect(['lazy', 'eager', null]).toContain(loading);
        
        // Check if image format is optimized (webp, avif, or standard formats)
        const isOptimized = src.includes('.webp') || 
                          src.includes('.avif') || 
                          src.includes('.jpg') || 
                          src.includes('.jpeg') || 
                          src.includes('.png') ||
                          src.startsWith('data:') ||
                          src.startsWith('blob:');
        
        expect(isOptimized).toBe(true);
      }
    }
  });

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    // Navigate through different sections
    await page.click('text=Mission');
    await page.waitForTimeout(1000);
    
    await page.click('text=Services');
    await page.waitForTimeout(1000);
    
    await page.click('text=Pricing');
    await page.waitForTimeout(1000);
    
    await page.click('text=Home');
    await page.waitForTimeout(1000);
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      console.log(`Memory increase: ${memoryIncrease} bytes`);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should handle network throttling', async ({ page, context }) => {
    // Simulate slow network by adding delay to all requests
    await context.route('**/*', async (route) => {
      // Add 100ms delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('h1');
    const loadTime = Date.now() - startTime;

    console.log(`Load time on slow connection: ${loadTime}ms`);

    // Should still load reasonably fast on slow connection (under 15s with delays)
    expect(loadTime).toBeLessThan(15000);
  });
});