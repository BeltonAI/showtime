const { chromium } = require('playwright');
const SP = process.argv[2] || require('os').tmpdir(); const fs = require('fs');
require('fs').mkdirSync(SP + '/shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto((process.env.BASE_URL || 'http://localhost:3000') + '/index.html'); await pg.waitForTimeout(400);
  await pg.click('[data-act="enter"]'); await pg.click('[data-act="demo"]'); await pg.waitForSelector('.phero'); await pg.waitForTimeout(1200);
  // make a real-looking upload: render a photo-like canvas
  const png = await pg.evaluate(() => { const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const x = c.getContext('2d');
    const g = x.createLinearGradient(0,0,1200,800); g.addColorStop(0,'#c0392b'); g.addColorStop(1,'#1b2a4a'); x.fillStyle = g; x.fillRect(0,0,1200,800);
    x.fillStyle = 'rgba(255,220,120,.8)'; x.beginPath(); x.arc(850,260,140,0,7); x.fill(); return c.toDataURL('image/png').split(',')[1]; });
  await pg.setInputFiles('#upArt', { name: 'key-art.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await pg.waitForTimeout(700);
  console.log('hero uses upload:', await pg.evaluate(() => { const b = getComputedStyle(document.querySelector('.phero__art')).backgroundImage; return b.includes('data:image') || b.includes('/media/') || b.includes('/images/'); }));
  console.log('bands:', await pg.$$eval('details.psec--bg', e => e.length), 'of', await pg.$$eval('details.psec', e => e.length));
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(200);
  await pg.screenshot({ path: SP + '/shots/v5-top.png' });
  await pg.screenshot({ path: SP + '/shots/v5-full.png', fullPage: true });
  // pick a background for Look
  await pg.click('.pgal >> nth=0'); await pg.click('[data-sec-bg="look"]'); await pg.waitForTimeout(200);
  console.log('look bg set:', await pg.evaluate(() => !!(P().bgs && P().bgs.look)));
  await pg.click('[data-act="close"] >> nth=-1');
  await pg.setViewportSize({ width: 1280, height: 860 }); await pg.emulateMedia({ colorScheme: 'dark' });
  await pg.evaluate(() => window.scrollTo(0, 1100)); await pg.waitForTimeout(300);
  await pg.screenshot({ path: SP + '/shots/v5-desk.png' });
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
