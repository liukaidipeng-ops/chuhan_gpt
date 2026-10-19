// 试玩码入口（Cloudflare Worker）。所有请求先过这里：没有有效的试玩码会话，只给输入页；
// 游戏文件只能通过 ASSETS 绑定读取，没有别的公开地址。有效码存在 KV 里（只存哈希），不在前端。
const COOKIE = 'xq_trial';
const MAX_AGE = 180 * 24 * 3600;   // 同一浏览器记住 180 天
const te = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sha256 = async s => hex(await crypto.subtle.digest('SHA-256', te.encode(s)));
const norm = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
async function sign(key, data) {
  const k = await crypto.subtle.importKey('raw', te.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', k, te.encode(data)));
}
function safeEq(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const json = (o, status = 200, h = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...h } });

// 码被停用后，已经进来的浏览器也要被挡住：每次请求都看这个码的状态（同一实例里缓存几十秒）
const seen = new Map();
async function isActive(env, id) {
  const ttl = (env.REVOKE_CACHE_SEC !== undefined && +env.REVOKE_CACHE_SEC >= 0 ? +env.REVOKE_CACHE_SEC : 30) * 1000;
  const c = seen.get(id);
  if (c && Date.now() - c.t < ttl) return c.ok;
  let ok = false;
  try { const r = await env.CODES.get('c:' + id, 'json'); ok = !!r && r.status === 'active'; } catch (e) { ok = false; }   // 读不到就当没通过
  seen.set(id, { ok, t: Date.now() });
  return ok;
}
async function session(req, env) {
  const m = /(?:^|;\s*)xq_trial=([^;]+)/.exec(req.headers.get('cookie') || '');
  if (!m) return null;
  const [id, exp, sig] = m[1].split('.');
  if (!id || !exp || !sig || !(+exp > Date.now() / 1000)) return null;
  if (!safeEq(sig, await sign(env.SESSION_KEY, id + '.' + exp))) return null;
  return (await isActive(env, id)) ? id : null;
}
async function verify(req, env) {
  let code = ''; try { code = (await req.json()).code; } catch (e) { }
  const n = norm(code);
  const id = n.length === 10 ? await env.CODES.get('h:' + await sha256(n)) : null;
  const rec = id && await env.CODES.get('c:' + id, 'json');
  if (!rec || rec.status !== 'active') return json({ ok: false }, 403);
  seen.delete(id);
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const tok = id + '.' + exp + '.' + await sign(env.SESSION_KEY, id + '.' + exp);
  return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=${tok}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax` });
}

const PAGE = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>技能新象棋 · 试玩码</title>
<style>body{margin:0;background:#1b1a19;color:#e8e2d6;font:16px/1.7 sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:0 16px}
form{width:100%;max-width:320px;text-align:center}h1{font-weight:600;letter-spacing:.2em;margin:0 0 4px}
input{width:100%;box-sizing:border-box;padding:12px;margin:12px 0;font:20px monospace;text-align:center;letter-spacing:.15em;background:#26241f;color:#e8e2d6;border:1px solid #6b6252;border-radius:6px}
button{width:100%;padding:12px;font-size:17px;background:#e0b060;color:#1b1a19;border:0;border-radius:6px}p{margin:6px 0;color:#b8b0a0}#m{color:#e07060;min-height:1.7em}</style></head>
<body><form id="f"><h1>技能新象棋</h1><p>试玩需要试玩码</p><input id="c" autocomplete="off" autocapitalize="characters" placeholder="XXXXX-XXXXX" maxlength="14"><button>进入</button><p id="m"></p></form>
<script>f.onsubmit=async e=>{e.preventDefault();m.textContent='';try{const r=await fetch('/_gate/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:c.value})});if(r.ok)location.reload();else m.textContent='试玩码无效或已停用'}catch(x){m.textContent='网络不通，请重试'}}</script></body></html>`;

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/_gate/verify') return req.method === 'POST' ? verify(req, env) : json({ ok: false }, 405);
    if (await session(req, env)) {
      const r = await env.ASSETS.fetch(req);
      const h = new Headers(r.headers); h.set('cache-control', 'private, no-cache');
      return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
    }
    const html = (req.headers.get('accept') || '').includes('text/html');
    return new Response(html ? PAGE : '需要试玩码', { status: 401, headers: { 'content-type': html ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
  },
};
