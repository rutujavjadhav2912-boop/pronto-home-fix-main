const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('PAGE LOADED');
  } catch (e) {
    console.error('NAVIGATION FAILED:', e.message);
  }
  await browser.close();
})();
