const { chromium } = require('playwright');
const SP = process.argv[2] || require('os').tmpdir(); let draftPrompt = '';
require('fs').mkdirSync(SP + '/shots', { recursive: true });
const roles = ['Lead','Antagonist','Supporting','Supporting','Supporting','Supporting','Supporting','Supporting','Supporting','Minor','Minor','Minor','Minor','Minor','Minor'];
function answer(p) {
  if (p.includes('first draft of the whole show')) { draftPrompt = p; return { title: 'Ward Nine', logline: 'x', genres: ['Drama'], tones: ['Tense'],
    spine: { once: 'a', everyDay: 'b', untilOneDay: 'c', becauseA: 'd', becauseB: 'e', becauseC: 'f', untilFinally: 'g', eversince: 'h' }, shortForm: {}, acts: { '1': 'one', '2': 'two', '3': 'three' },
    characters: roles.map((r, i) => ({ name: 'Person ' + (i + 1), role: r, look: 'Look ' + i, arc: 'Arc ' + i })), places: [1,2,3,4,5,6,7].map(i => ({ name: 'Place ' + i, atmosphere: 'Air ' + i })) }; }
  if (p.includes('Write the season')) return { episodes: [1,2].map(i => ({ number: i, title: 'Ep ' + i, premise: 'p', acts: { '1': 'a', '2': 'b', '3': 'c' }, carriesOver: 'x' })) };
  if (p.includes("ShowPage, the page")) return { tagline: 'Night never ends.', quotes: [] };
  return {};
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/api/ai/status', r => r.fulfill({ json: { ok: true, writer: 'claude' } }));
  await pg.route('**/api/ai', r => { const body = JSON.parse(r.request().postData()); r.fulfill({ json: { data: answer(body.prompt) } }); });
  await pg.goto((process.env.BASE_URL || 'http://localhost:3000') + '/index.html'); await pg.waitForTimeout(400);
  await pg.click('[data-act="enter"]'); await pg.click('[data-format="series"]'); await pg.click('[data-eps="4"]'); await pg.click('[data-act="cp-next"]');
  await pg.fill('#cpIdea', 'When a night porter is blamed for a death, he must clear his name before the hospital closes.'); await pg.click('[data-act="cp-write"]');
  await pg.waitForSelector('.step__title', { timeout: 15000 });
  console.log('prompt asks 12-18:', draftPrompt.includes('12 to 18 people'), '| cast stored:', await pg.evaluate(() => P().characters.length), '| places:', await pg.evaluate(() => P().worlds.length));
  await pg.click('.top [data-act="make-page"]'); await pg.click('[data-act="mp-go"]'); await pg.waitForSelector('.phero', { timeout: 30000 });
  await pg.evaluate(() => { const d = document.querySelector('#pg-cast'); d.open = true; d.scrollIntoView(); }); await pg.waitForTimeout(300);
  console.log('tiers:', await pg.$$eval('#pg-cast .psub', e => e.map(x => x.textContent).join(' | ')));
  await pg.screenshot({ path: SP + '/shots/v7-cast.png', fullPage: false });
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
