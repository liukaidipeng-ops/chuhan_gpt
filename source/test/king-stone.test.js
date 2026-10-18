const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const THREE = require('three');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/king-stone.js'), 'utf8');
function fixture() {
  const requests = [], notices = [];
  class Loader { load(url, ok, progress, fail) { const t = new THREE.Texture(); requests.push({url,ok,fail,t}); return t; } }
  const board = { lastGame: { bf: true }, decorateAll() { board.decorations++; }, decorations: 0 };
  const context = vm.createContext({ THREE: {...THREE, TextureLoader: Loader}, window: {KING_STONE_ASSETS:{base:'king-stone-r4/',version:'test'}}, Core:{renderer:{capabilities:{getMaxAnisotropy:()=>8}},poke(){}}, Board:board, console:{warn:s=>notices.push(s)} });
  vm.runInContext(source, context);
  return {api:vm.runInContext('KingStone',context), requests, board, notices};
}
function mesh() {
  const m = new THREE.Group();
  m.add(new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.42,0),new THREE.Vector2(.42,.2)]),new THREE.MeshStandardMaterial()),new THREE.Mesh(new THREE.CircleGeometry(.4),new THREE.MeshStandardMaterial()),new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.026),new THREE.MeshStandardMaterial()));
  m.children[2].position.y=.12;return m;
}
const flush = async () => { for(let i=0;i<8;i++) await Promise.resolve(); };
(async()=>{
  const f=fixture(),m=mesh(),before=m.children.map(c=>c.material),king={t:'k',s:'r'},env=new THREE.Texture();
  for(const [piece,mode] of [[king,false],[{t:'r',s:'r'},true],[{...king,h:true},true]]) assert.equal(f.api.apply(m,piece,mode,false,env),false);
  assert.equal(f.requests.length,0);assert.equal(f.api.state,'idle');assert.deepEqual(m.children.map(c=>c.material),before);
  f.api.apply(m,king,true,false,env);f.api.apply(m,king,true,false,env);assert.equal(f.requests.length,12);assert.equal(f.api.state,'loading');assert.deepEqual(m.children.map(c=>c.material),before);
  f.board.lastGame={bf:false};f.requests.forEach(r=>r.ok());await flush();assert.equal(f.api.state,'ready');assert.equal(f.board.decorations,0,'late load must not redecorate a normal game');
  assert.equal(f.api.apply(m,king,false,false,env),false);assert.deepEqual(m.children.map(c=>c.material),before);
  f.board.lastGame={bf:true};assert.equal(f.api.apply(m,king,true,false,env),true);assert.equal(m.userData.kingStone,'01-R4');assert.equal(m.children[1].material.color.getHex(),0xffffff);
  assert.equal(m.children[0].material.envMap,env);assert.equal(m.children[1].material.map.colorSpace,THREE.SRGBColorSpace);assert.equal(m.children[1].material.normalMap.colorSpace,THREE.NoColorSpace);
  for(const index of [0,2]) {
    const base=m.children[index].material,clone=base.clone().clone();assert.equal(clone.customProgramCacheKey(),base.customProgramCacheKey());
    const shader={vertexShader:'#include <uv_vertex>'};clone.onBeforeCompile(shader);assert.match(shader.vertexShader,/kingWallUV/);assert.equal(clone.userData.kingStoneWall.offset,index===0?0:.12);
  }
  f.api.apply(m,king,true,true,env);assert.equal(m.children[1].material.color.getHex(),0x8f8a84);f.api.apply(m,king,true,false,env);assert.equal(m.children[1].material.color.getHex(),0xffffff);
  f.api.apply(m,king,false,false,env);assert.deepEqual(m.children.map(c=>c.material),before);assert.equal(m.userData.kingStone,undefined);
  const failed=fixture(),mf=mesh(),original=mf.children.map(c=>c.material);failed.api.apply(mf,king,true,false,null);failed.requests[0].fail(new Error('offline'));await flush();assert.equal(failed.api.state,'failed');assert.deepEqual(mf.children.map(c=>c.material),original);assert.equal(failed.board.decorations,0);assert.equal(failed.notices.length,1);
  const n=failed.requests.length;failed.api.apply(mf,king,true,false,null);assert.equal(failed.requests.length,n,'failed assets must not trigger a retry loop');
  console.log('king-stone: mode/hidden/non-king isolation, lazy-load race, original fallback, dim reset, clone UV and failed-load checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
