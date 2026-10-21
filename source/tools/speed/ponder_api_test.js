// 预想接口端到端：猜中 / 没猜中 / 停掉
const SRC='/home/user/chuhan_gpt/source/';
global.XQ=require(SRC+'src/rules.js');const BF=global.BF=require(SRC+'src/bingfa.js');BF.CFG.beishui.on=true;BF.CFG.r6.on=true;
const AI=require(SRC+'tools/variants/cand/bfai.js');AI.LEVELS.hard.budget=2000;
const fs=require('fs');const E=JSON.parse(fs.readFileSync(SRC+'tools/review/games/g27-live-65d505-xhard-entries.json'));
const G=new BF.Game();G.reset();for(let i=0;i<30;i++)G.apply(E[i]);
const tick=()=>new Promise(r=>setTimeout(r,0)), sleep=ms=>new Promise(r=>setTimeout(r,ms));
const play=(S,seq)=>{const g=new BF.Game();g.reset(BF.cloneState(S));for(const a of seq)if(!g.apply(a))throw new Error('非法 '+JSON.stringify(a));return g.S;};
(async()=>{
  const S=BF.cloneState(G.S);   // 轮到“人”走
  // 1 猜中
  let t=Date.now(); console.log('start', AI.ponderStart(S,'hard',tick));
  while(!(AI.ponderInfo()||{}).ready) await sleep(50);
  console.log('猜好用了', Date.now()-t,'ms，猜的是', JSON.stringify(AI.ponderInfo().pred));
  await sleep(6000);   // 人想 6 秒
  const S2=play(S,AI.ponderInfo().pred); t=Date.now();
  let seq=await AI.ponderMove(S2,'hard',tick); play(S2,seq);
  console.log('猜中：交出用了',Date.now()-t,'ms 层数',AI.think.last.depth,'ponder',JSON.stringify(AI.think.last.ponder), JSON.stringify(seq));
  t=Date.now(); const seqN=await AI.think(BF.cloneState(S2),'hard'); console.log('对照（不预想）', Date.now()-t,'ms 层数',AI.think.last.depth, JSON.stringify(seqN));
  // 2 没猜中：人走另一步
  AI.ponderStart(S,'hard',tick); while(!(AI.ponderInfo()||{}).ready) await sleep(50); await sleep(2000);
  const pred=JSON.stringify(AI.ponderInfo().pred); const alts=BF.ai.expand(S).map(k=>k.a).filter(a=>JSON.stringify([a])!==pred);
  const S3=play(S,[alts[0]]); t=Date.now(); seq=await AI.ponderMove(S3,'hard',tick); play(S3,seq);
  console.log('没猜中：', Date.now()-t,'ms 层数',AI.think.last.depth,'ponder',JSON.stringify(AI.think.last.ponder));
  // 3 停掉
  AI.ponderStart(S,'hard',tick); await sleep(1500); t=Date.now(); await AI.ponderStop(); console.log('停掉用了',Date.now()-t,'ms，info',AI.ponderInfo());
  // 4 低档不预想
  console.log('校尉 start', AI.ponderStart(S,'mid',tick));
})().catch(e=>{console.error('出错',e);process.exit(1);});
