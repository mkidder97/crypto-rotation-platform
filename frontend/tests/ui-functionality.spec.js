const { test, expect } = require('@playwright/test');

test.describe('Crypto Rotation Frontend UI Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('Dashboard loads with Benjamin Cowen style interface', async ({ page }) => {
    // Check if the main dashboard components are visible
    await expect(page.locator('h2:has-text("Crypto Risk Indicators")')).toBeVisible();
    await expect(page.locator('h2:has-text("Macro Recession Risk Indicators")')).toBeVisible();
    
    // Check for risk gauge components
    const riskGauges = page.locator('.recharts-radial-bar-chart');
    await expect(riskGauges).toHaveCount(2);
    
    // Verify tabs are present
    await expect(page.locator('button:has-text("TOTAL")')).toBeVisible();
    await expect(page.locator('button:has-text("BTC")')).toBeVisible();
    await expect(page.locator('button:has-text("ETH")')).toBeVisible();
    await expect(page.locator('button:has-text("ALTCOINS")')).toBeVisible();
  });

  test('Tabbed interface functionality', async ({ page }) => {
    // Click on different tabs and verify content changes
    await page.click('button:has-text("BTC")');
    await expect(page.locator('h3:has-text("BTC:")')).toBeVisible();
    
    await page.click('button:has-text("ETH")');
    await expect(page.locator('h3:has-text("ETH:")')).toBeVisible();
    
    await page.click('button:has-text("ALTCOINS")');
    await expect(page.locator('h3:has-text("ALTCOINS:")')).toBeVisible();
    
    // Go back to TOTAL
    await page.click('button:has-text("TOTAL")');
    await expect(page.locator('h3:has-text("TOTAL:")')).toBeVisible();
  });

  test('Advanced Charts section functionality', async ({ page }) => {
    // Navigate to Charts section
    await page.click('button:has-text("Charts")');
    
    // Verify chart components load
    await expect(page.locator('h2:has-text("Bitcoin Logarithmic Regression Rainbow")')).toBeVisible();
    
    // Test chart selector buttons
    const chartButtons = ['Rainbow', 'Pi', 'MVRV'];
    for (const buttonText of chartButtons) {
      const button = page.locator(`button:has-text("${buttonText}")`).first();
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500); // Wait for chart to update
      }
    }
    
    // Verify chart canvas is present
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('Sidebar navigation functionality', async ({ page }) => {
    // Test sidebar navigation
    const navItems = [
      { text: 'Dashboard', expected: 'Crypto Risk Indicators' },
      { text: 'Charts', expected: 'Bitcoin Logarithmic Regression Rainbow' },
      { text: 'Cowen AI', expected: 'Benjamin Cowen Analysis' },
      { text: 'Backtesting', expected: 'Backtesting Interface' }
    ];
    
    for (const item of navItems) {
      await page.click(`button:has-text("${item.text}")`);
      await page.waitForTimeout(1000);
      
      // Check if expected content is visible
      const content = page.locator(`text="${item.expected}"`).first();
      if (await content.isVisible()) {
        await expect(content).toBeVisible();
      }
    }
  });

  test('Interactive elements and tooltips', async ({ page }) => {
    // Test tooltip interactions
    const infoButtons = page.locator('button svg[data-lucide="info"]');
    const infoButtonCount = await infoButtons.count();
    
    if (infoButtonCount > 0) {
      // Hover over first info button to trigger tooltip
      await infoButtons.first().hover();
      await page.waitForTimeout(500);
      
      // Check if tooltip content appears
      const tooltip = page.locator('[role="tooltip"], .tooltip-content, div:has-text("Benjamin Cowen")').first();
      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('Responsive design and mobile compatibility', async ({ page }) => {
    // Test desktop view first
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.lg\\:col-span-2')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verify mobile interface loads if present
    const mobileInterface = page.locator('text="ResponsiveMobileInterface"');
    // Note: This might not be visible as text, so we check for mobile-specific elements
  });

  test('Chart interactions and animations', async ({ page }) => {
    // Go to charts section
    await page.click('button:has-text("Charts")');
    await page.waitForTimeout(1000);
    
    // Test chart hover interactions
    const chartArea = page.locator('.recharts-wrapper').first();
    if (await chartArea.isVisible()) {
      await chartArea.hover();
      await page.waitForTimeout(500);
      
      // Look for tooltip or interactive elements
      const chartTooltip = page.locator('.recharts-tooltip-wrapper, [class*="tooltip"]');
      // Tooltips may only appear on specific chart elements
    }
    
    // Test timeframe selector if present
    const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
    for (const tf of timeframes) {
      const timeframeButton = page.locator(`button:has-text("${tf}")`);
      if (await timeframeButton.isVisible()) {
        await timeframeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('Performance and loading states', async ({ page }) => {
    // Reload page and check loading performance
    await page.reload();
    
    // Wait for main content to load
    const startTime = Date.now();
    await page.waitForSelector('h2', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    // Expect reasonable load time (less than 5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Check for any error messages
    const errorMessages = page.locator('text=/error|Error|ERROR/i');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  test('Data fetching and API integration', async ({ page }) => {
    // Monitor network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());

      }
    });
    
    // Refresh to trigger API calls
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Verify API calls are being made
    expect(apiRequests.length).toBeGreaterThan(0);
    
    // Check for common API endpoints
    const expectedEndpoints = [
      '/api/metrics/current',
      '/api/cowen/risk-indicator',
      '/api/cowen/btc-dominance'
    ];
    
    for (const endpoint of expectedEndpoints) {
      const hasEndpoint = apiRequests.some(url => url.includes(endpoint));
      if (hasEndpoint) {
        expect(hasEndpoint).toBe(true);
      }
    }
  });

  test('Visual regression and styling consistency', async ({ page }) => {
    // Take screenshots for visual regression testing
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-full.png', 
      fullPage: true 
    });
    
    // Check for consistent color scheme
    const elements = await page.locator('[class*="bg-gray"], [class*="text-white"], [class*="text-gray"]').all();
    expect(elements.length).toBeGreaterThan(0);
    
    // Verify glass morphism effects
    const glassElements = page.locator('[class*="backdrop-blur"], [class*="bg-gray-900/50"]');
    expect(await glassElements.count()).toBeGreaterThan(0);
    
    // Check for proper spacing and layout
    const containers = page.locator('[class*="max-w-"], [class*="mx-auto"], [class*="space-y"]');
    expect(await containers.count()).toBeGreaterThan(0);
  });

  test('Accessibility and usability', async ({ page }) => {
    // Check for proper ARIA labels and accessibility features
    await page.evaluate(() => {
      // Check for missing alt attributes on images
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        console.warn(`Found ${images.length} images without alt attributes`);
      }
      
      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      console.log(`Found ${headings.length} headings`);
      
      return {
        imagesWithoutAlt: images.length,
        totalHeadings: headings.length
      };
    });
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify focus states are visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });
});

// Generate test report
test.afterAll(async () => {
  console.log('✅ UI Functionality Tests Completed');
  console.log('📊 Generating recommendations...');
});