// 九级“计划题”判卷（十级认证表第七节）：从一个局面开始，被考的电脑执 side、线上霸王执另一方，下 horizon 回合 × 若干种子，
//   量 metric（win 胜负 / material 中立局面分 / merit 军功差），和参照电脑在同一局面、同样种子下的结果比。
// 用法：node tools/plan_exam.js <题目.json> <被考电脑.js> [参照电脑.js=src/bfai.js] [--seeds 10] [--nodes 100000]
//   题目 { src, opts:{bs,r6}, S, name, side, horizon, metric, intent }
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
global.XQ = require('../src/rules.js');
const BF = global.BF = require('../src/bingfa.js');
const argv = process.argv.slice(2), opt = { seeds: 10, nodes: 100000 }, files = [];
for (let i = 0; i < argv.length; i++) { if (argv[i] === '--seeds') opt.seeds = +argv[++i]; else if (argv[i] === '--nodes') opt.nodes = +argv[++i]; else files.push(argv[i]); }
const [qFile, candFile, refFile = 'src/bfai.js'] = files;
const loadAI = f => { const file = path.resolve(__dirname, '..', f), m = new Module(file + '#plan' + Math.random(), module); m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file)); m._compile(fs.readFileSync(file, 'utf8'), file); const X = m.exports; X.LEVELS.hard.nodes = opt.nodes; X.LEVELS.hard.budget = 1e9; return X; };
const Q = JSON.parse(fs.readFileSync(qFile, 'utf8'));
BF.CFG.beishui.on = !!(Q.opts || {}).bs; BF.CFG.r6.on = !!(Q.opts || {}).r6;
const VAL = { r: 9, c: 4.5, n: 4, e: 2, a: 2, p: 1, k: 0 };
const neutral = S => { let v = 0; for (const row of S.board) for (const p of row) if (p && p.t !== 'k') v += (p.s === 'r' ? 1 : -1) * VAL[p.t] * (1 + 0.45 * (p.hp - 1)); return v + 0.3 * (S.merit.r - S.merit.b); };
function rng(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
async function playOut(me, opp, seed) {
  Math.random = rng(seed * 2654435761);
  const g = new BF.Game(); g.reset(JSON.parse(JSON.stringify(Q.S)));
  const sg = Q.side === 'r' ? 1 : -1, startRound = g.round;
  while (!g.result && g.round < startRound + Q.horizon) {
    if (g.status && g.status.mustPass) { g.apply({ k: 'pass' }); continue; }
    const AI = g.S.turn === Q.side ? me : opp;
    const seq = await AI.think(BF.cloneState(g.S), 'hard'); if (!seq.length) break;
    for (const a of seq) if (!g.apply(a)) throw new Error('非法行动 ' + JSON.stringify(a));
  }
  if (Q.metric === 'win') return g.result ? (g.result.winner === Q.side ? 1 : 0) : 0.5;
  if (Q.metric === 'merit') return sg * (g.S.merit.r - g.S.merit.b);
  return sg * neutral(g.S);   // material
}
(async () => {
  const opp = loadAI('src/bfai.js'), cand = loadAI(candFile), ref = loadAI(refFile);
  const rc = [], rr = [];
  for (let s = 1; s <= opt.seeds; s++) { rc.push(await playOut(cand, opp, s)); rr.push(await playOut(ref, opp, s)); }
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length, notWorse = rc.filter((v, i) => v >= rr[i]).length;
  const pass = avg(rc) > avg(rr) && notWorse >= Math.ceil(opt.seeds * 0.7);
  console.log(`【${Q.name}】${Q.intent || ''}`);
  console.log(`  ${Q.metric}（${Q.side === 'r' ? '汉' : '楚'}方视角，${Q.horizon} 回合 × ${opt.seeds} 种子）：被考 ${avg(rc).toFixed(2)}，参照 ${avg(rr).toFixed(2)}；不差于参照 ${notWorse}/${opt.seeds} → ${pass ? '过' : '不过'}`);
  console.log(`  逐种子：被考 [${rc.map(v => +v.toFixed(2)).join(', ')}]，参照 [${rr.map(v => +v.toFixed(2)).join(', ')}]`);
})();
