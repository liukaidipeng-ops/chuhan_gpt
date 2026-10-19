// Cloudflare KV 的 REST 调用（管码和传游戏文件共用）。
// 账号 ID 读环境变量 CLOUDFLARE_ACCOUNT_ID；令牌在云环境里由代理自动带上，本机手动用时再设 CLOUDFLARE_API_TOKEN。
// KV 空间 id 从同目录 wrangler.toml 读。
import { readFileSync } from 'node:fs';
const A = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!A) { console.error('缺 CLOUDFLARE_ACCOUNT_ID'); process.exit(1); }
const T = process.env.CLOUDFLARE_API_TOKEN;
const H = T && T !== 'placeholder' ? { authorization: 'Bearer ' + T } : {};
const toml = readFileSync(new URL('./wrangler.toml', import.meta.url), 'utf8');
const nsId = name => { const m = new RegExp('binding\\s*=\\s*"' + name + '"\\s*\\nid\\s*=\\s*"(\\w+)"').exec(toml); if (!m) throw new Error('wrangler.toml 里没有 ' + name); return m[1]; };
export function kv(binding) {
  const base = `https://api.cloudflare.com/client/v4/accounts/${A}/storage/kv/namespaces/${nsId(binding)}`;
  const k = s => encodeURIComponent(s);
  async function req(path, opt = {}) {
    const r = await fetch(base + path, { ...opt, headers: { ...H, ...(opt.headers || {}) } });
    if (!r.ok) throw new Error(`${opt.method || 'GET'} ${path} → ${r.status} ${(await r.text()).slice(0, 200)}`);
    return r;
  }
  return {
    get: async key => { const r = await fetch(`${base}/values/${k(key)}`, { headers: H }); return r.ok ? r.text() : null; },
    put: (key, v) => req(`/values/${k(key)}`, { method: 'PUT', body: v, headers: { 'content-type': 'text/plain' } }),
    putFile: (key, bytes, metadata) => { const f = new FormData(); f.set('value', new Blob([bytes])); f.set('metadata', JSON.stringify(metadata)); return req(`/values/${k(key)}`, { method: 'PUT', body: f }); },
    del: key => req(`/values/${k(key)}`, { method: 'DELETE' }),
    keys: async prefix => { const out = []; let cursor = ''; do { const r = await (await req(`/keys?limit=1000&prefix=${k(prefix)}${cursor ? '&cursor=' + cursor : ''}`)).json(); out.push(...r.result.map(x => x.name)); cursor = r.result_info?.cursor || ''; } while (cursor); return out; },
  };
}
