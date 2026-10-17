const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const path = require('path');
// 用法：node test/run.js [页面路径]，默认测上一层的 index.html；需要全局装好 playwright
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.html'), 'utf8').replace(/<link rel="stylesheet"[^>]+>/, '');
const mock = fs.readFileSync(path.join(__dirname, 'mock.js'), 'utf8');
const seed = {
 "items/a1":{"dept":"角色部","code":"char-031","title":"兵卒四级金甲","ask":"金甲兵这样行不行","kind":"approve","pass":"整合","candidate":"build-77","scope":{"in":["兵卒四级外观"],"out":["技能"]},"unchecked":["真机"],"media":[{"type":"image","url":"data:image/gif;base64,R0lGODlhAQABAAAAACw=","cap":"改后","src":"实机"},{"type":"audio","url":"data:audio/wav;base64,","cap":"脚步声","src":"小样"}],"createdAt":"2026-10-17T08:00:00Z"},
 "items/a2":{"dept":"美术总监","code":"ad-050","title":"棋盘木纹","kind":"choice","options":[{"key":"A","label":"甲 年轮"},{"key":"B","label":"乙 直纹","pass":"上线"}],"rec":"B","createdAt":"2026-10-17T08:10:00Z"},
};
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 400, height: 800 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  
  await pg.setContent('<!doctype html><meta charset=utf8><body><script>' + mock + '\nwindow.__store=' + JSON.stringify(seed) + ';</script>' + html);
  await pg.waitForTimeout(300);
  const t = s => pg.innerText(s); const w = ms => pg.waitForTimeout(ms);
  console.log('count', await t('#count'));
  await pg.click('#card-a1 .opt'); await pg.click('#card-a2 .acts .b >> text=都不合适，另说');
  await pg.click('#bAll'); await w(200); console.log('bar1', await t('#barMsg'));
  await pg.fill('#note-a2', '木纹太浅'); await pg.click('#bAll'); await w(300);
  console.log('bar2', await t('#barMsg'));
  console.log('sent', await pg.evaluate('window.__sent'));
  const d = await pg.evaluate("window.__store['decisions/a1']"); console.log('dec a1', d.status, d.pass, d.label, d.snap.candidate);
  await pg.click('#tab-done'); await w(100);
  await pg.evaluate("window.claude.use('db').then(d=>d.doc('receipts/a1').set({ack:{at:new Date().toISOString(),text:'收到，接进 dev'},log:[{at:new Date().toISOString(),stage:'doing',text:'在接'}]}))"); await w(200);
  console.log('row a1:', await t('#row-a1'));
  await pg.click('#row-a2 >> text=撤回'); await w(200);
  console.log('after click withdraw: count', (await t('#count')).replace(/\n/g,' '), 'sent', (await pg.evaluate('window.__sent')).length, 'confirm box:', await t('#row-a2 .wbox p'));
  await pg.click('#row-a2 >> text=算了'); await w(100); console.log('after cancel: box?', await pg.locator('#row-a2 .wbox').count(), 'sent', (await pg.evaluate('window.__sent')).length);
  await pg.click('#row-a2 >> text=撤回'); await pg.fill('#wnote-a2', '我再想想'); await pg.click('#row-a2 >> text=确认撤回并通知'); await w(300);
  const sent = await pg.evaluate('window.__sent'); console.log('after confirm: count', (await t('#count')).replace(/\n/g,' '), 'sent', sent.length); console.log(sent[sent.length-1]);
  console.log('bar', await t('#barMsg'));
  await pg.click('#tab-pending'); await w(100); console.log('a2 card prev:', await t('#card-a2 .prev'));
  await pg.evaluate("window.claude.use('db').then(d=>d.doc('receipts/a2').set({ack:{at:new Date().toISOString(),text:'收到撤回，停了'}}))"); await w(200);
  console.log('a2 after ack:', await t('#card-a2 .prev')); await pg.click('#tab-done'); await w(100);
  await pg.evaluate("window.claude.use('db').then(d=>d.doc('items/a1').update({rev:2,title:'兵卒四级金甲（改）'}))"); await w(200);
  console.log('after rev2', await t('#count'));
  await pg.click('#tab-pending'); await w(100); console.log('a1 card prev:', await t('#card-a1 .prev'));
    await pg.click('#tab-depts'); await w(100); console.log('depts:', (await t('#v-depts')).replace(/\n/g, ' | '));
  console.log('errors', errs); await b.close();
})();
