'use strict';
// Diagnostic only: expose search evaluation in VM copies; never change exported production API.
const fs=require('fs'),vm=require('vm'),cp=require('child_process'),assert=require('assert');
global.XQ=require('../src/rules.js'); const BF=global.BF=require('../src/bingfa.js');
const original=cp.execFileSync('git',['show','11738bf7e5ffdb0234da370adb5e3c6c0fcb0ee5:source/src/bfai.js'],{encoding:'utf8'});
const candidate=fs.readFileSync(require('path').join(__dirname,'../src/bfai.js'),'utf8');
function load(src){
 const anchor="  if (typeof module !== 'undefined' && module.exports) module.exports = BFAI;";
 assert(src.includes(anchor));
 src=src.replace(anchor,`
  BFAI.probeQ = (S,qd=0,beta=INF) => { nodes=0; deadline=Infinity; nodeCap=500000; return qs(BF.cloneState(S),-INF,beta,1,qd); };
  BFAI.probeNodes = () => nodes;
  BFAI.probe = (S,d) => {
    nodes=0; deadline=Infinity; nodeCap=500000; kdMe=null; lmrOn=false; upPly=-1;pfPly=-1;
    potC=null;skC=null;hist.clear();killers.length=0;TTB.clear();pfCache.clear();upCache.clear();pfAlias.clear();pfUp.clear();
    return ab(BF.cloneState(S),d,-INF,INF,1);
  };
`+anchor);
 const ctx={BF,console,performance,Math,process,module:{exports:{}},require}; vm.runInNewContext(src,ctx);return ctx.module.exports;
}
const engines={baseline:load(original),candidate:load(candidate)};
let id=100;
const piece=(s,t,lv=1)=>({s,t,id:id++,lv,hp:BF.hpOf(t,lv),cd:0,jm:0,xp:0,kills:0});
function fixture(n){
 const g=new BF.Game();g.setup(S=>{
  S.board=Array.from({length:10},()=>Array(9).fill(null));S.turn='r';S.merit={r:0,b:0};
  S.used={art:{r:1,b:1},ult:{r:1,b:1}};
  S.board[0][4]=piece('r','k');S.board[7][5]=piece('b','k');
  S.board[1][3]=piece('b','r');S.board[1][5]=piece('b','r');
  for(let x=0;x<n;x++)S.board[9][x]=piece('r','p');
  S.board[9][n]=piece('b','p',3);
 });return BF.cloneState(g.S);
}
const full=fixture(5),small=fixture(1);
assert.equal(BF.evaluate(full).result?.reason,'stalemate','synthetic >4 fixture must be real rule stalemate');
assert.equal(BF.evaluate(small).result?.reason,'stalemate');
const escape=BF.cloneState(full);escape.board[1][3]=null;
const kill=BF.cloneState(full);kill.board[9][5].hp=1;
const upgraded=BF.cloneState(full);upgraded.upgraded=true;
const free=BF.cloneState(full);free.freeUsed=true;
const pass=BF.cloneState(full);
pass.board=pass.board.map(row=>row.map(p=>p?{...p,s:p.s==='r'?'b':'r'}:null)).reverse().map(row=>row.slice().reverse());
pass.turn='b';pass.fx.sm=100;
const smallPass=BF.cloneState(small);
smallPass.board=smallPass.board.map(row=>row.map(p=>p?{...p,s:p.s==='r'?'b':'r'}:null)).reverse().map(row=>row.slice().reverse());
smallPass.turn='b';smallPass.fx.sm=100;
const cases={over4:full,under4:small,escape,captureKill:kill,upgraded,freeUsed:free,simianPass:pass,smallPass};
const results=[];
for(const [name,S]of Object.entries(cases)){
 const ev=BF.evaluate(S);const values={};
 for(const [version,AI]of Object.entries(engines)){values[version]={};for(const d of [0,1,2])try{values[version][d]=AI.probe(S,d);}catch(e){values[version][d]={error:String(e)};}}
 results.push({name,pieces:S.board.flat().filter(p=>p?.s===S.turn).length,check:BF.ai.inCheck(S,S.turn),ev,values});
}
fs.mkdirSync('h70-results',{recursive:true});
fs.writeFileSync('h70-results/probe.json',JSON.stringify(results,null,2));
fs.writeFileSync('h70-results/fixtures.json',JSON.stringify(cases,null,2));
console.log(JSON.stringify(results,null,2));
assert(!BF.evaluate(escape).result,'escape is not stalemate');
assert(!BF.evaluate(kill).result,'killable capture is not stalemate');
console.log('Fixtures validated; search values are diagnostic, not strength approval.');

for(const result of results){
  if(result.ev.result) for(const d of [0,1,2]) assert.equal(result.values.candidate[d],-8999,result.name+' depth '+d);
}
for(const S of [full,small,upgraded,free]){
  assert.equal(engines.candidate.probeQ(S),-8999);
  assert.equal(engines.candidate.probeQ(S,3),-8999,'q depth limit must not hide terminal');
  assert.equal(engines.candidate.probeQ(S,0,-100),-8999,'stand-pat cutoff must not hide terminal');
}
for(const S of [escape,kill,pass,smallPass]) assert(engines.candidate.probeQ(S)>-8000,'nonterminal must not be scored as immediate loss');
const states=[BF.cloneState(new BF.Game().S)];
const g=new BF.Game();for(let i=0;i<8&&!g.result;i++){
 const k=BF.ai.expand(g.S).filter(k=>k.a.k==='mv');
 if(!k.length)break;
 assert(g.apply(k[(i*7+3)%k.length].a));
 if(i===3||i===7)states.push(BF.cloneState(g.S));
}
const timings=[];
for(let rep=0;rep<3;rep++) for(let si=0;si<states.length;si++) for(const version of (rep%2?['candidate','baseline']:['baseline','candidate'])){
 const AI=engines[version],t=performance.now();AI.probe(states[si],2);
 timings.push({rep,state:si,version,ms:performance.now()-t,nodes:AI.probeNodes()});
}
fs.writeFileSync('h70-results/timings.json',JSON.stringify(timings,null,2));
console.log('H70 REGRESSION ASSERTIONS PASSED');
console.log(JSON.stringify(timings));
