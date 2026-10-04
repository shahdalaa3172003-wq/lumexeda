const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'true_mobile_375.png', fullPage: true });
  
  await page.setViewportSize({ width: 430, height: 932 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'true_mobile_430.png', fullPage: true });
  
  await browser.close();
})();
