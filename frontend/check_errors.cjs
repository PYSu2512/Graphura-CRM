const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    
    console.log('Logging in...');
    await page.type('input[type="email"]', 'sales@crm.in');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('Navigating to Attendance...');
    await page.goto('http://localhost:5173/sales-executive/hrm', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log('Done.');
  } catch (e) {
    console.error('SCRIPT ERROR:', e.message);
  } finally {
    await browser.close();
  }
})();
