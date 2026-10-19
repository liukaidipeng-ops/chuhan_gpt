// 入口逻辑测试（不连 Cloudflare）：node source/tools/gate/test.mjs
import assert from 'node:assert/strict';
import worker from './worker.js';
import { genCode, newRecords, hashCode } from './codes-lib.mjs';

const kvMap = new Map();
const CODES = { get: async (k, t) => { const v = kvMap.get(k); return v === undefined ? null : t === 'json' ? JSON.parse(v) : v; } };
const files = new Map(Object.entries({ 'index.html': '<html>GAME-INDEX</html>', 'voice-real.bin': 'VOICE-BYTES', 'version.json': '{"v":"x"}', 'king-stone-r4/a.png': 'PNG' }));
const GAME = Object.fromEntries([...files].map(([k, v]) => ['/' + k, v])); GAME['/'] = files.get('index.html');
const te = new TextEncoder();
const GAME_KV = { get: async (k, t) => { const v = files.get(k); return v === undefined ? null : v; },
  getWithMetadata: async (k, t) => { const v = files.get(k); if (v === undefined) return { value: null, metadata: null }; const bytes = te.encode(v); return { value: t === 'stream' ? new Blob([bytes]).stream() : bytes.buffer.slice(0), metadata: { ct: k.endsWith('.json') ? 'application/json' : 'text/html; charset=utf-8', size: bytes.length } }; } };
const env = { CODES, GAME: GAME_KV, SESSION_KEY: 'test-key', REVOKE_CACHE_SEC: '0' };
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
r = await call('/voice-real.bin', { headers: { cookie } }); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'private, max-age=3600'); assert.equal(await r.text(), 'VOICE-BYTES');
assert.equal((await call('/nope', { headers: { cookie } })).status, 404);
// 有会话时：「..」会被 URL 解析器化简成普通路径（读到的还是同一个有权读的文件），双斜杠和反斜杠直接拒绝
for (const p of ['//voice-real.bin', '/a%5C..%5Cb', '/%2e%2e%2fvoice-real.bin']) assert.equal((await call(p, { headers: { cookie } })).status, 404, p);
r = await call('/voice-real.bin', { headers: { cookie, range: 'bytes=2-5' } }); assert.equal(r.status, 206); assert.equal(await r.text(), 'ICE-'); assert.equal(r.headers.get('content-range'), 'bytes 2-5/11');
r = await call('/voice-real.bin', { headers: { cookie, range: 'bytes=-3' } }); assert.equal(await r.text(), 'TES');
assert.equal((await call('/voice-real.bin', { headers: { cookie, range: 'bytes=50-60' } })).status, 416);
r = await call('/voice-real.bin', { method: 'HEAD', headers: { cookie } }); assert.equal(r.status, 200); assert.equal(r.headers.get('content-length'), '11'); assert.equal((await r.text()), '');

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
