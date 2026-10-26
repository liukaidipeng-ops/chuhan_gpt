// 九级“计划题”判卷（十级认证表第七节）：从一个局面开始，被考的电脑执 side、线上霸王执另一方，下 horizon 回合 × 若干种子，
//   量 metric（win 胜负 / material 中立局面分 / merit 军功差），和参照电脑在同一局面、同样种子下的结果比。
// 用法：node tools/plan_exam.js <题目.json> <被考电脑.js> [参照电脑.js=src/bfai.js] [--seeds 10] [--nodes 100000] [--time 3000] [--opp=<对手电脑.js>=src/bfai.js]
//   --time <ms>：时间制判卷（LEVELS.hard.budget=ms、nodes=0），用于复现“3 秒浅搜”类缺陷（如 K21-1 issue25 计划题）；与 --nodes 互斥
//   --opp <f> / --opp=<f>：指定“执另一方的对手电脑”（默认 src/bfai.js=线上霸王）；用于用攻击型/用户模拟对手判卷（如 K24 类“连续升兵”打法复现）
//   题目 { src, opts:{bs,r6}, S, name, side, horizon, metric, intent }
'use strict';
const fs = require('fs'), path = require('path'), Module = require('module');
global.XQ = require('../src/rules.js');
const BF = global.BF = require('../src/bingfa.js');
const argv = process.argv.slice(2), opt = { seeds: 10, nodes: 100000, time: 0, opp: 'src/bfai.js' }, files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--seeds') opt.seeds = +argv[++i];
  else if (argv[i] === '--nodes') opt.nodes = +argv[++i];
  else if (argv[i] === '--time') opt.time = +argv[++i];
  else if (argv[i] === '--opp') opt.opp = argv[++i];
  else if (argv[i].startsWith('--opp=')) opt.opp = argv[i].slice(6);
  else files.push(argv[i]);
}
const [qFile, candFile, refFile = 'src/bfai.js'] = files;
const loadAI = f => { const file = path.resolve(__dirname, '..', f), m = new Module(file + '#plan' + Math.random(), module); m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file)); m._compile(fs.readFileSync(file, 'utf8'), file); const X = m.exports; if (opt.time > 0) { X.LEVELS.hard.nodes = 0; X.LEVELS.hard.budget = opt.time; } else { X.LEVELS.hard.nodes = opt.nodes; X.LEVELS.hard.budget = 1e9; } return X; };
const Q = JSON.parse(fs.readFileSync(qFile, 'utf8'));
BF.CFG.beishui.on = !!(Q.opts || {}).bs; BF.CFG.r6.on = !!(Q.opts || {}).r6;
const VAL = { r: 9, c: 4.5, n: 4, e: 2, a: 2, p: 1, k: 0 };
const neutral = S => { let v = 0; for (const row of S.board) for (const p of row) if (p && p.t !== 'k') v += (p.s === 'r' ? 1 : -1) * VAL[p.t] * (1 + 0.45 * (p.hp - 1)); return v + 0.3 * (S.merit.r - S.merit.b); };
function rng(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
async function playOut(me, opp, seed) {
  Math.random = rng(seed * 2654435761);
  const g = new BF.Game(); g.reset(JSON.parse(JSON.stringify(Q.S)));
  const sg = Q.side === 'r' ? 1 : -1, startRound = g.round, inc = { r: 0, b: 0 };   // inc：窗口内各方挣到的军功（只记增加，花掉的不扣）
  while (!g.result && g.round < startRound + Q.horizon) {
    if (g.status && g.status.mustPass) { g.apply({ k: 'pass' }); continue; }
    const AI = g.S.turn === Q.side ? me : opp;
    const seq = await AI.think(BF.cloneState(g.S), 'hard'); if (!seq.length) break;
    for (const a of seq) { const m0 = { ...g.S.merit }; if (!g.apply(a)) throw new Error('非法行动 ' + JSON.stringify(a)); for (const s of ['r', 'b']) if (g.S.merit[s] > m0[s]) inc[s] += g.S.merit[s] - m0[s]; }
  }
  if (Q.metric === 'win') return g.result ? (g.result.winner === Q.side ? 1 : 0) : 0.5;
  // 窗口内分出胜负：赢了算最高分、输了算最低分（10-21：K8-75 候选第 34 回合将死对方，对局提前结束，军功差和局面分反被记低）
  const WIN = 99, wl = g.result && g.result.winner ? (g.result.winner === Q.side ? WIN : -WIN) : 0;
  if (wl) return Q.metric === 'both' ? [wl, wl] : wl;
  if (Q.metric === 'merit') return sg * (g.S.merit.r - g.S.merit.b);
  if (Q.metric === 'both') return [sg * (inc.r - inc.b), sg * neutral(g.S)];   // 战术部门 B12 回复：挣到的军功差 + 局面分，两项分开报
  return sg * neutral(g.S);   // material
}
(async () => {
  const opp = loadAI(opt.opp), cand = loadAI(candFile), ref = loadAI(refFile);
  const rc = [], rr = [];
  for (let s = 1; s <= opt.seeds; s++) { rc.push(await playOut(cand, opp, s)); rr.push(await playOut(ref, opp, s)); }
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  if (process.env.PLAN_EXAM_VERBOSE) console.log(`  （对手 ${opt.opp}，参照 ${refFile}，${opt.time > 0 ? 'time:' + opt.time : 'nodes:' + opt.nodes}）`);
  if (Q.metric === 'both') {
    const part = (j, label) => { const c = rc.map(v => v[j]), r = rr.map(v => v[j]), nw = c.filter((v, i) => v >= r[i]).length, ok = avg(c) >= avg(r) && nw >= Math.ceil(opt.seeds * 0.7);
      console.log(`  ${label}：被考 ${avg(c).toFixed(2)}，参照 ${avg(r).toFixed(2)}；不差于参照 ${nw}/${opt.seeds}；逐种子 被考 [${c.map(v => +v.toFixed(2))}] 参照 [${r.map(v => +v.toFixed(2))}]`); return ok; };
    console.log(`【${Q.name}】${Q.intent || ''}（${Q.side === 'r' ? '汉' : '楚'}方视角，${Q.horizon} 回合 × ${opt.seeds} 种子）`);
    const a = part(0, '窗口内挣到的军功差'), b = part(1, '局面分');
    console.log(`  → ${a && b ? '过' : '不过'}（两项都不比参照差才过）`); return;
  }
  const notWorse = rc.filter((v, i) => v >= rr[i]).length;
  const pass = avg(rc) > avg(rr) && notWorse >= Math.ceil(opt.seeds * 0.7);
  console.log(`【${Q.name}】${Q.intent || ''}`);
  console.log(`  ${Q.metric}（${Q.side === 'r' ? '汉' : '楚'}方视角，${Q.horizon} 回合 × ${opt.seeds} 种子）：被考 ${avg(rc).toFixed(2)}，参照 ${avg(rr).toFixed(2)}；不差于参照 ${notWorse}/${opt.seeds} → ${pass ? '过' : '不过'}`);
  console.log(`  逐种子：被考 [${rc.map(v => +v.toFixed(2)).join(', ')}]，参照 [${rr.map(v => +v.toFixed(2)).join(', ')}]`);
})();
