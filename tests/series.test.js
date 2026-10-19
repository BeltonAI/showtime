const { chromium } = require('playwright');
const SP = process.argv[2] || require('os').tmpdir();
require('fs').mkdirSync(SP + '/shots', { recursive: true });
const prompts = [];
function answer(p) {
  if (p.includes('first draft of the whole show')) return { title: 'Night Shift', logline: 'A hospital porter keeps the night ward running while a stranger rewrites the patients’ files.', genres: ['Drama'], tones: ['Tense'],
    spine: { once: 'Once upon a time Ade Bello pushed beds.', everyDay: 'Every day Ade did nights.', untilOneDay: 'Until one day a file changed itself.', becauseA: 'Because of that, Ade watched.', becauseB: 'Because of that, Ade was blamed.', becauseC: 'Because of that, Ade lost the ward.', untilFinally: 'Until finally Ade caught the writer.', eversince: 'Ever since, Ade runs the night.' },
    shortForm: {}, acts: { '1': 'Season begins on the ward.', '2': 'Season middle: Ade is blamed.', '3': 'Season ends: the writer is caught.' },
    characters: [{ name: 'Ade Bello', role: 'Lead', look: 'Forties', arc: 'x' }, { name: 'Dr Hale', role: 'Antagonist', look: 'Fifties', arc: 'y' }], places: [{ name: 'Ward 9', atmosphere: 'Hum' }] };
  if (p.includes('Write the season')) return { episodes: [1,2,3,4].map(i => ({ number: i, title: 'Shift ' + i, premise: 'Ade faces night ' + i + '.', acts: { '1': 'E' + i + ' act one: setup.', '2': 'E' + i + ' act two: worse.', '3': 'E' + i + ' act three: resolved, with a hook.' }, carriesOver: 'Hook ' + i })) };
  if (p.includes('shootable scenes')) { const m = p.match(/EPISODE (\d+)/); const n = m ? m[1] : '?'; const ws = [...p.matchAll(/"id": "(w\d+)"/g)].map(x => x[1]);
    return { scenes: [1,2,3].map(i => ({ act: i, heading: 'INT. WARD 9 — NIGHT', summary: 'Episode ' + n + ' scene ' + i, world: ws[0], characters: [], line: '' })) }; }
  if (p.includes('brand new show')) return { nudge: '', tip: '', examples: [{ label: 'A', text: 'A series idea about a night porter who finds the files are changing.' }, { label: 'B', text: 'b b b b' }, { label: 'C', text: 'c c c c' }] };
  return {};
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/api/ai/status', r => r.fulfill({ json: { ok: true, writer: 'claude' } }));
  await pg.route('**/api/ai', r => { const body = JSON.parse(r.request().postData()); prompts.push(body.prompt); r.fulfill({ json: { data: answer(body.prompt) } }); });
  await pg.goto((process.env.BASE_URL || 'http://localhost:3000') + '/index.html'); await pg.waitForTimeout(400);
  await pg.click('[data-act="enter"]');
  console.log('first question:', await pg.textContent('.copro__q'));
  await pg.screenshot({ path: SP + '/shots/v6-01-format.png' });
  await pg.click('[data-format="series"]'); await pg.click('[data-eps="4"]'); await pg.click('[data-act="cp-next"]');
  console.log('second question:', await pg.textContent('.copro__q'));
  await pg.click('[data-act="cp-ideas"]'); await pg.waitForSelector('.idea');
  console.log('ideas prompt says series:', prompts[0].includes('TV series'));
  await pg.click('[data-idea="0"]'); await pg.click('[data-act="cp-write"]');
  await pg.waitForSelector('.step__title', { timeout: 15000 }); await pg.waitForTimeout(300);
  console.log('draft prompt is season-level:', prompts.find(p => p.includes('first draft')).includes('WHOLE SEASON'));
  console.log('episodes:', await pg.$$eval('.ep', e => e.length), '| acts text:', await pg.textContent('.ep__acts'));
  await pg.screenshot({ path: SP + '/shots/v6-02-story.png', fullPage: true });
  await pg.click('[data-ep="2"]'); await pg.waitForSelector('#eA1');
  console.log('ep2 act1:', await pg.inputValue('#eA1'));
  await pg.screenshot({ path: SP + '/shots/v6-03-episode.png' });
  await pg.click('[data-act="close"] >> nth=0');
  // scenes per episode
  await pg.evaluate(() => { location.hash = '#s-scenes-' + S.cur; }); await pg.waitForTimeout(300);
  await pg.click('[data-epick="3"]'); await pg.click('[data-act="break"]'); await pg.waitForSelector('.scene');
  console.log('scenes ep3:', await pg.textContent('.scene__t'));
  await pg.click('[data-epick="1"]'); await pg.click('[data-act="break"]'); await pg.waitForTimeout(400);
  console.log('total scenes:', await pg.evaluate(() => P().scenes.length), 'eps:', await pg.evaluate(() => [...new Set(P().scenes.map(s => s.ep))].join(',')));
  await pg.screenshot({ path: SP + '/shots/v6-04-scenes.png' });
  // showpage
  await pg.click('.top [data-act="make-page"]'); await pg.click('[data-act="mp-go"]'); await pg.waitForSelector('.phero', { timeout: 20000 });
  await pg.click('#pep-1 summary'); await pg.waitForTimeout(200);
  await pg.evaluate(() => document.querySelector('#pg-story').scrollIntoView()); await pg.waitForTimeout(200);
  await pg.screenshot({ path: SP + '/shots/v6-05-page-eps.png' });
  // edit an act inline
  await pg.click('[data-act="toggle-edit"]');
  const act = await pg.$('[data-field="ep:1:act2"]'); await act.click(); await pg.keyboard.press('Control+A'); await pg.keyboard.type('Rewritten middle for episode one.'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  console.log('inline act saved:', await pg.evaluate(() => epAct(P(), 1, 2)));
  console.log('overflow', await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
