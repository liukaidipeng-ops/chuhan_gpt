window.__store = {}; window.__sent = [];
const subs = [];
const coll = p => Object.entries(window.__store).filter(([k]) => k.split('/').slice(0,-1).join('/') === p);
const fire = () => subs.forEach(s => s());
function q(p){ return { orderBy(){return this}, limit(){return this},
  onSnapshot(next){ const run=()=>next({docs:coll(p).map(([k,v])=>({id:k.split('/').pop(),data:()=>JSON.parse(JSON.stringify(v))}))}); subs.push(run); setTimeout(run,0); return ()=>{}; } }; }
const db = { collection: q, doc: p => ({ set: async v => { window.__store[p]=v; fire(); }, update: async v => { Object.assign(window.__store[p],v); fire(); } }) };
const comments = { canSendToClaude: async()=>'available', anchorFor: async()=>({}), sendToClaude: async t => { window.__sent.push(t.text); return {threadId:'t',commentId:'c'}; } };
window.claude = { use: async n => ({db, comments, assets:null})[n] ?? null };
