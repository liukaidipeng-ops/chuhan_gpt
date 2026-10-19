#!/usr/bin/env node
// 试玩码管理：node codes.mjs gen <备注> [个数] | list | revoke <id> | replace <id>
// 需要环境变量 CLOUDFLARE_ACCOUNT_ID；令牌在云环境里由代理自动带上（见 cf.mjs）。
import { genCode, newRecords } from './codes-lib.mjs';
import { kv } from './cf.mjs';
const K = kv('CODES');
const { get, put } = K;
async function ids() { return (await K.keys('c:')).map(x => x.slice(2)).sort(); }
async function gen(label, n = 1) {
  const have = await ids(); let next = have.length ? Math.max(...have.map(i => +i.slice(1))) + 1 : 1;
  for (let i = 0; i < n; i++, next++) {
    const id = 'c' + String(next).padStart(3, '0'), code = genCode();
    for (const [k, v] of newRecords(id, label, code)) await put(k, v);
    console.log(`${id}  ${code}  ${label}`);   // 明文只在这里显示一次
  }
}
async function revoke(id) {
  const rec = JSON.parse(await get('c:' + id) || 'null');
  if (!rec) throw new Error('没有这个 id：' + id);
  rec.status = 'revoked'; rec.revoked = new Date().toISOString();
  await put('c:' + id, JSON.stringify(rec));
  await K.del('h:' + rec.hash);
  console.log(`已停用 ${id}（${rec.label}），已进入的浏览器约 30 秒内也会被挡住`);
  return rec;
}
const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'gen' && a) await gen(a, +b || 1);
else if (cmd === 'list') for (const id of await ids()) { const r = JSON.parse(await get('c:' + id)); console.log(id, r.status.padEnd(7), r.label, r.created.slice(0, 10)); }
else if (cmd === 'revoke' && a) await revoke(a);
else if (cmd === 'replace' && a) { const r = await revoke(a); await gen(r.label); }
else { console.error('用法：gen <备注> [个数] | list | revoke <id> | replace <id>'); process.exit(1); }
