// 用法：node run.js <bingfa.js> <bfai.js> <out.json>：一批局面、固定节点数、固定随机种子，记下每个局面电脑的走法和节点数
const fs=require('fs'),path=require('path');const SRC='/home/user/chuhan_gpt/source/';
global.XQ=require(SRC+'src/rules.js');const BF=global.BF=require(path.resolve(process.argv[2]));BF.CFG.beishui.on=true;BF.CFG.r6.on=true;
const AI=require(path.resolve(process.argv[3]));AI.LEVELS.hard.nodes=40000;AI.LEVELS.hard.budget=1e9;
const pos=[];for(const f of fs.readdirSync(SRC+'tools/exam_tactics'))if(f.endsWith('.json')){const q=JSON.parse(fs.readFileSync(SRC+'tools/exam_tactics/'+f));if(q.S)pos.push(q.S);}
for(const g of ['g22-trial-9bf6ef','g23-trial-9bf6ef','g24-trial-0c24b2','g25-live-363e41-xhard','g27-live-65d505-xhard']){const E=JSON.parse(fs.readFileSync(SRC+'tools/review/games/'+g+'-entries.json'));const G=new BF.Game();G.reset();for(let i=0;i<E.length;i++){if(i%9===0&&!G.result)pos.push(BF.cloneState(G.S));G.apply(E[i]);}}
(async()=>{const out=[];const t0=Date.now();for(const S of pos){let a=7;Math.random=()=>{a=(a*1103515245+12345)%2147483648;return a/2147483648;};
const seq=await AI.think(BF.cloneState(S),'hard');out.push([JSON.stringify(seq),AI.think.last.nodes]);}
fs.writeFileSync(process.argv[4],JSON.stringify(out));console.log(pos.length,'局面',Date.now()-t0,'ms');})();
