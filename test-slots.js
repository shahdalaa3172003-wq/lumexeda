const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  const html = await page.evaluate(() => {
    const slots = document.querySelectorAll('.showcase-slot');
    return Array.from(slots).map(s => s.innerHTML);
  });
  console.log(JSON.stringify(html, null, 2));
  await browser.close();
})();
