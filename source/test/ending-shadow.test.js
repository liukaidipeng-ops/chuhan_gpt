const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const THREE=require('three');
const code=fs.readFileSync(__dirname+'/../src/ending.js','utf8');
const fragment=code.slice(code.indexOf('  let saved = null;'),code.indexOf('  function shot('));
const scene=new THREE.Scene();scene.background=new THREE.Color(0xe9dfc9);scene.fog=new THREE.Fog(0xe9dfc9,26,120);
const Core={sun:new THREE.DirectionalLight(0xfff0dc,2.6),hemi:new THREE.HemisphereLight(0xfff6e6,0x8a7a66,1.6),renderer:{shadowMap:{needsUpdate:false}}};
const C=Core.sun.shadow.camera;
const ctx=vm.createContext({Core,scene});vm.runInContext(fragment,ctx);
for(const size of [14,16,20]){
 const expected={left:-7,right:11,top:5,bottom:-8,near:2,far:55,zoom:1.3};Object.assign(C,expected);C.updateProjectionMatrix();const matrix=C.projectionMatrix.toArray();
 ctx.mood(0x111111,12,80,new THREE.Vector3(1,2,3),0xa8bce0,1.25,.55);
 ctx.sunAt(new THREE.Vector3(2000,0,0),new THREE.Vector3(-12,18,-10),new THREE.Vector3(),size);
 assert.equal(C.far,80);assert.equal(C.right-C.left,size*2);
 ctx.restoreMood();for(const [k,v]of Object.entries(expected))assert.equal(C[k],v);
 assert.deepEqual(C.projectionMatrix.toArray(),matrix);assert.equal(Core.renderer.shadowMap.needsUpdate,true);
}
console.log('PASS: ending camera 28/32/40 restores arbitrary bounds, near/far, zoom and projection; requests refresh');
