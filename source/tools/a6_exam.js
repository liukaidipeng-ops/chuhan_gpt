'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
global.XQ=require('../src/rules.js');
const BF=global.BF=require('../src/bingfa.js');
const AI=require('./variants/bfai_next.js');
const seeds=[61001,61002,61003], nodes=100000;
AI.LEVELS.a6={...AI.LEVELS.hard,noise:0,top:1,nodes,minNodes:0,dyn:1};
const clone=x=>JSON.parse(JSON.stringify(x));
function rng(a){return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function fresh(){const g=new BF.Game(); if(!BF.CFG.beishui?.on||!BF.CFG.r6?.on)throw Error('A6 requires bs=true,r6=true');return g}
function gameAt(seq){const g=fresh();for(const a of seq)if(!g.apply(clone(a)))throw Error('illegal setup '+JSON.stringify(a));return g}
function from(S){const g=new BF.Game();g.reset(BF.cloneState(S));return g}
function apply(g,seq){for(const a of seq)if(!g.apply(clone(a)))return false;return true}
const rc={k:'mv',from:[1,2],to:[4,2]},bc={k:'mv',from:[7,7],to:[4,7]},bn={k:'mv',from:[7,9],to:[6,7]};
const upR={k:'up',at:[4,3]},hit={k:'mv',from:[4,2],to:[4,6]},upB={k:'up',at:[4,6]},take={k:'mv',from:[6,7],to:[4,6]};
const q1=()=>gameAt([rc,bc]),q2=()=>gameAt([rc]),q3=()=>gameAt([rc,bn,upR,hit]);
const actName=a=>a.k==='up'?'up('+a.at+')':a.k==='mv'?'mv('+a.from+'>'+a.to+')':JSON.stringify(a);
const seqName=s=>s.map(actName).join(' + ');
function contains(seq,want){return want.every(a=>seq.some(x=>same(x,a)))}
async function think(S,seed){Math.random=rng(seed);const seq=await AI.think(BF.cloneState(S),'a6');const L=AI.think.last||{};return{seq:clone(seq),line:seqName(seq),value:L.v,depth:L.depth,nodes:L.nodes,ms:L.ms,top:clone(L.top||[]),trace:L.trace||null}}
async function valueAfter(S,seq,seed){
 const g=from(S),side=g.turn;if(!apply(g,seq))return{legal:false};
 if(g.result)return{legal:true,value:g.result.winner===side?9000:-9000,result:g.result};
 if(g.turn===side)return{legal:false,note:'turn did not end'};
 const reply=await think(g.S,seed);return{legal:true,value:-reply.value,reply:reply.line,replyValue:reply.value,replyDepth:reply.depth,replyNodes:reply.nodes};
}
function defenseAfter(S,seq){
 const g=from(S);const pawn=g.board[6][4],pid=pawn&&pawn.id;if(!apply(g,seq))return{legal:false};
 if(g.turn!=='r')return{legal:false,note:'black turn did not end'};
 const u=g.apply(clone(upR)),m=u&&g.apply(clone(hit));
 if(!u||!m)return{legal:true,attackLegal:false,blocksAttack:true};
 let pawnAlive=false,cannon=null;
 for(let r=0;r<10;r++)for(let f=0;f<9;f++){const p=g.board[r][f];if(p?.id===pid)pawnAlive=true;if(p?.s==='r'&&p.t==='c'&&f===4&&r===6)cannon=p}
 const recapture=!!cannon&&BF.ai.gen(g.S,true).some(it=>it.q?.id===cannon.id&&it.q.hp<=BF.ai.atk(it.p)&&BF.attempt(g.S,it.a));
 return{legal:true,attackLegal:true,pawnAlive,recapture,preventsFreePawn: pawnAlive||recapture,after:{turn:g.turn,cannonAt46:!!cannon,pawnAt46:!!g.board[6][4]&&g.board[6][4].id===pid}};
}
function q3Check(S,seq){
 const g=from(S),c=g.board[6][4],cid=c&&c.id;if(!apply(g,seq))return{legal:false};
 let cannonAlive=false,knight=null;
 for(let r=0;r<10;r++)for(let f=0;f<9;f++){const p=g.board[r][f];if(p?.id===cid)cannonAlive=true;if(p?.s==='b'&&p.t==='n'&&f===4&&r===6)knight=p}
 const redCanRetake=!!knight&&BF.ai.gen(g.S,true).some(it=>it.q?.id===knight.id&&it.q.hp<=BF.ai.atk(it.p)&&BF.attempt(g.S,it.a));
 return{legal:true,cannonAlive,knightAt46:!!knight,redCanRetake};
}
(async()=>{
 const candidates={
  q1:[{name:'升中兵后炮打中卒',seq:[upR,hit]},{name:'马二进三',seq:[{k:'mv',from:[1,0],to:[2,2]}]}],
  q2:[{name:'马8进7',seq:[bn]},{name:'马2进3',seq:[{k:'mv',from:[1,9],to:[2,7]}]},{name:'升中卒并炮8平5',seq:[upB,bc]}],
  q3:[{name:'马吃中炮',seq:[take]}]
 };
 const out={meta:{generatedAt:new Date().toISOString(),repo:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),aiBase:process.env.BFAI_NEXT_BASE,weight:process.env.BFAI_TUNE_W,weightSha256:crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'..',process.env.BFAI_TUNE_W))).digest('hex'),tuneFast:process.env.BFAI_TUNE_FAST,nodes,seeds,rules:{bs:BF.CFG.beishui.on,r6:BF.CFG.r6.on}},questions:{}};
 for(const [id,build] of Object.entries({q1,q2,q3})){
  const S=build().S,runs=[];
  for(const seed of seeds){
   const picked=await think(S,seed),forced=[];
   for(const c of candidates[id])forced.push({name:c.name,seq:seqName(c.seq),evaluation:await valueAfter(S,c.seq,seed+1000),rule:id==='q2'?defenseAfter(S,c.seq):id==='q3'?q3Check(S,c.seq):undefined});
   const pass=id==='q1'?(forced[0].evaluation.legal&&forced[1].evaluation.legal&&forced[0].evaluation.value>forced[1].evaluation.value):id==='q2'?defenseAfter(S,picked.seq).preventsFreePawn:id==='q3'?contains(picked.seq,[take]):false;\n   runs.push({seed,picked,forced,pass,criterion:id==='q1'?'specified upgrade+attack is stronger than knight comparator':id==='q2'?'chosen defense prevents a free central-pawn loss':'chosen move captures the advanced cannon',pickedRule:id==='q2'?defenseAfter(S,picked.seq):id==='q3'?q3Check(S,picked.seq):undefined});
  }
  out.questions[id]={runs,passCount:runs.filter(x=>x.pass).length};
 }
 const S4=q2().S,runs4=[];
 for(const seed of seeds){
  const picked=await think(S4,seed),rule=defenseAfter(S4,picked.seq),targetRule=defenseAfter(S4,[upB,bc]),targetEval=await valueAfter(S4,[upB,bc],seed+2000);\n  runs4.push({seed,picked,pass:targetRule.pawnAlive&&rule.preventsFreePawn&&picked.value>targetEval.value,criterion:'specified upgrade defense works but costs more than the chosen valid defense',pickedRule:rule,target:{seq:seqName([upB,bc]),rule:targetRule,evaluation:targetEval}});
 }
 out.questions.q4={runs:runs4,passCount:runs4.filter(x=>x.pass).length,validation:runs4[0].target.rule};
 fs.mkdirSync('a6-results',{recursive:true});fs.writeFileSync('a6-results/a6-q1-q4.json',JSON.stringify(out,null,2));
 const lines=['# A6 Q1-Q4 规范成绩','',`AI base ${out.meta.aiBase}; weight sha256 ${out.meta.weightSha256}; bs=${out.meta.rules.bs}; r6=${out.meta.rules.r6}; nodes=${nodes}; seeds=${seeds.join(',')}`,''];
 for(const id of ['q1','q2','q3','q4']){const q=out.questions[id];lines.push(`## ${id.toUpperCase()}: ${q.passCount}/${seeds.length}`);for(const r of q.runs)lines.push(`- seed ${r.seed}: ${r.picked.line}; v=${r.picked.value}; depth=${r.picked.depth}; nodes=${r.picked.nodes}; ms=${r.picked.ms}; pass=${r.pass}`);lines.push('')}
 fs.writeFileSync('a6-results/A6-Q1-Q4-成绩.md',lines.join('\n'));
 console.log(lines.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
