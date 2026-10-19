#!/usr/bin/env node
// 试玩码管理：node codes.mjs gen <备注> [个数] | list | revoke <id> | replace <id>
// 需要环境变量：CF_API_TOKEN、CF_ACCOUNT_ID、CF_KV_NAMESPACE_ID（令牌放环境设置里，别写进仓库）。
import { genCode, hashCode, newRecords } from './codes-lib.mjs';
const { CF_API_TOKEN: T, CF_ACCOUNT_ID: A, CF_KV_NAMESPACE_ID: N } = process.env;
if (!T || !A || !N) { console.error('缺 CF_API_TOKEN / CF_ACCOUNT_ID / CF_KV_NAMESPACE_ID'); process.exit(1); }
const base = `https://api.cloudflare.com/client/v4/accounts/${A}/storage/kv/namespaces/${N}`;
const H = { authorization: 'Bearer ' + T };
async function req(path, opt = {}) {
  const r = await fetch(base + path, { ...opt, headers: { ...H, ...(opt.headers || {}) } });
  if (!r.ok) throw new Error(`${opt.method || 'GET'} ${path} → ${r.status} ${await r.text()}`);
  return r;
}
const get = async k => { const r = await fetch(`${base}/values/${encodeURIComponent(k)}`, { headers: H }); return r.ok ? r.text() : null; };
const put = (k, v) => req(`/values/${encodeURIComponent(k)}`, { method: 'PUT', body: v, headers: { 'content-type': 'text/plain' } });
async function ids() {
  const r = await (await req('/keys?prefix=c:&limit=1000')).json();
  return r.result.map(x => x.name.slice(2)).sort();
}
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
  await req(`/values/${encodeURIComponent('h:' + rec.hash)}`, { method: 'DELETE' });
  console.log(`已停用 ${id}（${rec.label}），已进入的浏览器约 30 秒内也会被挡住`);
  return rec;
}
const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'gen' && a) await gen(a, +b || 1);
else if (cmd === 'list') for (const id of await ids()) { const r = JSON.parse(await get('c:' + id)); console.log(id, r.status.padEnd(7), r.label, r.created.slice(0, 10)); }
else if (cmd === 'revoke' && a) await revoke(a);
else if (cmd === 'replace' && a) { const r = await revoke(a); await gen(r.label); }
else { console.error('用法：gen <备注> [个数] | list | revoke <id> | replace <id>'); process.exit(1); }
