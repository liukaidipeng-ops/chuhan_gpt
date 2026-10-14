// Reminder opportunities must be legal both after the trial and after cancelling it.
global.XQ = require('../src/rules.js');
const BF = require('../src/bingfa.js');
const Review = require('../src/turn-review.js');
const assert = require('assert');
const saved = BF.CFG.r6.on;
let id = 1000;
for (const r6 of [false, true]) for (const side of ['r', 'b']) {
  BF.CFG.r6.on = r6;
  const opp = XQ.other(side), sq = (f,r) => [f, side === 'r' ? r : 9-r];
  const P = (s,t,lv=1) => ({s,t,lv,id:id++,hp:BF.hpOf(t,lv),xp:0,kills:0,cd:0,jm:0});
  function make(merit=3) {
    const g=new BF.Game(); g.setup(S=>{
      S.board=Array.from({length:10},()=>Array(9).fill(null));S.turn=side;S.merit[side]=merit;
      for(const [f,r,p] of [[4,0,P(side,'k')],[3,9,P(opp,'k')],[4,3,P(side,'p')],[0,3,P(side,'p',2)],[8,9,P(opp,'r')],[8,6,P(opp,'p')]]) {const [x,y]=sq(f,r);S.board[y][x]=p;}
    }); return g;
  }
  const mv={k:'mv',from:sq(4,3),to:sq(4,4)};
  function choices(g) {const t=new BF.Game(g.cfg);t.reset(g.S);assert(t.apply(mv));return Review.opportunities(g,t);}
  const g=make(), before=JSON.stringify({S:g.S,E:g.entries,H:g.history});
  const found=choices(g);assert(found.some(x=>x.kind==='up'));assert(found.some(x=>x.kind==='sk'&&x.label==='拒马'));
  assert.strictEqual(JSON.stringify({S:g.S,E:g.entries,H:g.history}),before,'probe mutated authoritative game');
  assert(choices(make(0)).every(x=>x.kind==='sk'),'cannot spend merit earned by the cancelled move');
  const used=make(8);assert(used.apply({k:'up',at:sq(4,3)}));assert(used.apply({k:'sk',at:sq(0,3)}));
  assert.deepStrictEqual(choices(used),[],'already used upgrade/free action must not be offered again');
  const cd=make(0);cd.setup(S=>{const [f,r]=sq(0,3);S.board[r][f].c_juma=100;S.board[r][f].cd=100;S.board[r][f].cd=100;});
  assert.deepStrictEqual(choices(cd),[],'cooldown cannot expire by resetting the turn');
  const scope = new Review.TurnScope(), scoped = make(8);
  scope.suppress(scoped,true); scope.showUpgrades(scoped);
  assert(scope.candidateCells(scoped).length > 1);
  assert(scoped.apply({k:'up',at:sq(4,3)}));
  assert(scope.isSuppressed(scoped),'upgrade retains turn suppression');
  assert.deepStrictEqual(scope.candidateCells(scoped),[],'availability is recomputed after upgrade');
  assert(scoped.apply({k:'sk',at:sq(0,3)}));
  assert(scope.isSuppressed(scoped),'free skill retains turn suppression');
  assert(scoped.apply(mv));
  assert(scope.isSuppressed(scoped),'next side keeps game suppression');
  assert.deepStrictEqual(scope.candidateCells(scoped),[],'turn change clears highlights');
  scope.suppress(scoped,true); scope.reset();
  assert(!scope.isSuppressed(scoped),'explicit new/load reset clears game suppression');
  scope.suppress(scoped,true); assert(!scope.isSuppressed(make(8)),'new game never inherits suppression');
  const skillScope=new Review.TurnScope(), skillsGame=make(0);
  skillScope.showSkill(skillsGame,'juma');
  assert.deepStrictEqual(skillScope.candidateCells(skillsGame),[sq(0,3)],'single legal skill candidate');
  skillsGame.setup(S=>{const [f,r]=sq(2,3);S.board[r][f]=P(side,'p',2);});
  assert.strictEqual(skillScope.candidateCells(skillsGame).length,2,'all legal same-skill candidates');
  const intact=JSON.stringify(skillsGame.S);
  skillScope.candidateCells(skillsGame);assert.strictEqual(JSON.stringify(skillsGame.S),intact,'hints never execute skills');
  skillsGame.setup(S=>{const [f,r]=sq(0,3);S.board[r][f].c_juma=100;S.board[r][f].cd=100;});
  assert.deepStrictEqual(skillScope.candidateCells(skillsGame),[sq(2,3)],'cooldown filters candidates dynamically');
  skillScope.showSkill(skillsGame,'pili');assert.deepStrictEqual(skillScope.candidateCells(skillsGame),[],'different/absent skill excluded');
  skillScope.showSkill(skillsGame,'juma');assert(skillsGame.apply({k:'sk',at:sq(2,3)}));
  assert.deepStrictEqual(skillScope.candidateCells(skillsGame),[],'used free action clears all candidates');
  skillScope.clearHints();assert.deepStrictEqual(skillScope.candidateCells(make()),[]);
  const terminal=new BF.Game(g.cfg);terminal.reset(g.S);terminal.result={reason:'checkmate',winner:side,loser:opp};
  assert.deepStrictEqual(Review.opportunities(g,terminal),[]);
}
// A genuine terminal move wins priority even when the mover could otherwise upgrade.
{
  const g=new BF.Game();g.setup(S=>{
    S.board=Array.from({length:10},()=>Array(9).fill(null));
    for(const [f,r,s,t] of [[4,0,'r','k'],[4,9,'b','k'],[3,7,'r','r'],[5,7,'r','r'],[4,5,'r','p']]) S.board[r][f]={s,t,id:id++,lv:1,hp:1,cd:0,jm:0,xp:0,kills:0};
    S.merit={r:10,b:0};
  });
  const trial=new BF.Game(g.cfg);trial.reset(g.S);
  assert(trial.apply({k:'mv',from:[3,7],to:[3,8]}));assert(trial.result);
  assert.deepStrictEqual(Review.opportunities(g,trial),[]);
}
BF.CFG.r6.on=saved;
console.log('TURN REVIEW opportunities OK (both sides, both rule versions)');
