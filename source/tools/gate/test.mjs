// 入口逻辑测试（不连 Cloudflare）：node source/tools/gate/test.mjs
import assert from 'node:assert/strict';
import worker from './worker.js';
import { genCode, newRecords, hashCode } from './codes-lib.mjs';

const kvMap = new Map();
const CODES = { get: async (k, t) => { const v = kvMap.get(k); return v === undefined ? null : t === 'json' ? JSON.parse(v) : v; } };
const GAME = { '/': '<html>GAME-INDEX</html>', '/index.html': '<html>GAME-INDEX</html>', '/voice-real.bin': 'VOICE-BYTES', '/version.json': '{"v":"x"}', '/king-stone-r4/a.png': 'PNG' };
const ASSETS = { fetch: async r => { const p = new URL(r.url).pathname; return p in GAME ? new Response(GAME[p], { headers: { etag: '"1"' } }) : new Response('nf', { status: 404 }); } };
const env = { CODES, ASSETS, SESSION_KEY: 'test-key', REVOKE_CACHE_SEC: '0' };
const call = (path, o = {}) => worker.fetch(new Request('https://t.example' + path, o), env);
const html = { accept: 'text/html' };
const noGame = async r => { const t = await r.text(); for (const v of Object.values(GAME)) assert.ok(!t.includes(v), '泄露了游戏内容'); };

// 1. 没码：首页、资源、版本文件都只能拿到 401
for (const p of ['/', '/index.html', '/voice-real.bin', '/version.json', '/king-stone-r4/a.png', '//voice-real.bin', '/%2e/voice-real.bin', '/_gate/../voice-real.bin']) {
  const r = await call(p, { headers: html }); assert.equal(r.status, 401, p); await noGame(r);
}
assert.equal((await call('/_gate/verify')).status, 405);

// 2. 错码：403，没有 cookie
const post = code => call('/_gate/verify', { method: 'POST', body: JSON.stringify({ code }) });
for (const c of ['', 'ABCDE-FGHJK', 'x', '{}']) { const r = await post(c); assert.equal(r.status, 403); assert.ok(!r.headers.get('set-cookie')); }

// 3. 对码（大小写、有没有横线都行）：200 + cookie；带 cookie 能进
const code = genCode(); assert.match(code, /^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
for (const [k, v] of newRecords('c001', '测试', code)) kvMap.set(k, v);
assert.ok(![...kvMap.values()].some(v => v.includes(code)) && ![...kvMap.keys()].some(k => k.includes(code)), 'KV 里不该有明文码');
const ok = await post(code.toLowerCase().replace('-', ' ')); assert.equal(ok.status, 200);
const sc = ok.headers.get('set-cookie'); assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /Max-Age=15552000/);
const cookie = sc.split(';')[0];
let r = await call('/', { headers: { ...html, cookie } }); assert.equal(r.status, 200); assert.ok((await r.text()).includes('GAME-INDEX'));
r = await call('/voice-real.bin', { headers: { cookie } }); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'private, no-cache');
assert.equal((await call('/nope', { headers: { cookie } })).status, 404);

// 4. 伪造、过期、改过的 cookie 都不行
const [id, exp, sig] = cookie.split('=')[1].split('.');
for (const c of [`xq_trial=${id}.${exp}.${sig.slice(0, -1)}A`, `xq_trial=c999.${exp}.${sig}`, `xq_trial=${id}.${+exp + 1}.${sig}`, `xq_trial=${id}.1.${sig}`, 'xq_trial=']) {
  assert.equal((await call('/voice-real.bin', { headers: { cookie: c } })).status, 401, c);
}

// 5. 停用：已经进来的浏览器马上被挡，码也不能再登录
const rec = JSON.parse(kvMap.get('c:c001')); rec.status = 'revoked'; kvMap.set('c:c001', JSON.stringify(rec)); kvMap.delete('h:' + rec.hash);
assert.equal((await call('/voice-real.bin', { headers: { cookie } })).status, 401);
assert.equal((await post(code)).status, 403);

// 6. 替换：新码可用，旧 cookie 仍然不行
const code2 = genCode(); for (const [k, v] of newRecords('c002', '测试', code2)) kvMap.set(k, v);
const ok2 = await post(code2); assert.equal(ok2.status, 200);
assert.equal((await call('/', { headers: { cookie: ok2.headers.get('set-cookie').split(';')[0] } })).status, 200);
assert.equal((await call('/', { headers: { cookie } })).status, 401);

// 7. 密钥换掉，所有会话作废
env.SESSION_KEY = 'other'; assert.equal((await call('/', { headers: { cookie: ok2.headers.get('set-cookie').split(';')[0] } })).status, 401);
assert.notEqual(hashCode('AAAAA-AAAAA'), hashCode('AAAAA-AAAAB'));
console.log('GATE OK：无码拿不到任何游戏内容；错码、伪造、过期、停用、替换、换密钥都对');
