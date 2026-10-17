// Day/night affects the surroundings; the board and playable models keep their own lighting.
const EnvironmentMode = (() => {
 const originals=new Map(),cache=new Map(),strength={value:0};
 const bg=Core.scene.background.clone(),fog=Core.scene.fog.color.clone();
 let torches=[],mode='day',active=false,campStamp=null;
 function refreshFires(){campStamp=Camp.camps[0];torches=Camp.camps.flatMap(c=>c.fires.map((p,i)=>({p,f:c.flames[i]}))).slice(0,12);}
 const fireData={value:Array.from({length:12},(_,i)=>new THREE.Vector4())};
 Core.onFrame(()=>{if(!active)return;if(campStamp!==Camp.camps[0])refreshFires();torches.forEach((t,i)=>fireData.value[i].set(t.p.x,t.p.y,t.p.z,t.f.userData.lord?(t.f.userData.lit||0):1));});
 function apply(){Core.scene.traverse(o=>{
  if(!o.isMesh||!o.material)return;
  for(let p=o;p;p=p.parent)if(p===Board.root||p.userData.environmentExcluded)return;
  if(originals.has(o)){const m=originals.get(o);o.material=Array.isArray(m)?m.map(x=>cache.get(x)||x):(cache.get(m)||m);return;}
  const convert=m=>{
   if(m.isShaderMaterial||m.transparent||m.blending===THREE.AdditiveBlending)return m;
   if(cache.has(m))return cache.get(m);
   const n=m.clone(),before=m.onBeforeCompile,baseKey=m.customProgramCacheKey();
   n.onBeforeCompile=(s,r)=>{
    if(before)before.call(n,s,r);
    s.uniforms.focusStrength=strength;s.uniforms.focusFires=fireData;
    s.vertexShader='varying vec3 focusWorld;\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 fp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfp=instanceMatrix*fp;\n#endif\nfocusWorld=(modelMatrix*fp).xyz;');
    s.fragmentShader='varying vec3 focusWorld;\nuniform float focusStrength;\nuniform vec4 focusFires[12];\n'+s.fragmentShader;
    const code=`
     vec2 beyond=max(abs(focusWorld.xz)-vec2(4.75,5.82),vec2(0.0));
     float edge=length(beyond);
     float pool=exp(-edge*edge/7.0);
     vec3 toned=outgoingLight*mix(0.045,0.115,pool)*vec3(1.10,0.94,0.78);
     // Low warm bounce preserves fabric and wood in shadow.
     toned+=diffuseColor.rgb*0.036+vec3(0.011,0.009,0.007);
     for(int i=0;i<12;i++){
       vec3 d=focusWorld-focusFires[i].xyz;
       float glow=exp(-dot(d.xz,d.xz)/1.8)*exp(-abs(d.y)*0.45)*focusFires[i].w;
       toned+=diffuseColor.rgb*vec3(1.05,0.43,0.075)*glow;
     }
     float grey=dot(toned,vec3(0.2126,0.7152,0.0722));
     toned=mix(vec3(grey),toned,0.83);
     outgoingLight=mix(outgoingLight,toned,focusStrength);
    `;
    const marker=s.fragmentShader.includes('#include <opaque_fragment>')?'#include <opaque_fragment>':'#include <output_fragment>';
    s.fragmentShader=s.fragmentShader.replace(marker,code+marker);
   };
   // Preserve the original shader variant (e.g. troop batching) inside the night variant.
   n.customProgramCacheKey=()=> 'focus-preview-c-v3|'+baseKey;cache.set(m,n);return n;
  };
  originals.set(o,o.material);o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
 });}

 function set(value){
  const next=value==='night'?'night':'day';
  if(next===mode && (next==='day'||active))return;
  mode=next;active=next==='night';strength.value=active?1:0;
  if(active){refreshFires();apply();}else{for(const [o,m] of originals)if(o.parent)o.material=m;}
  Core.scene.background.copy(active?new THREE.Color(0x42392f):bg);
  Core.scene.fog.color.copy(active?new THREE.Color(0x42392f):fog);Core.poke(3000);
 }
 return {set,get mode(){return mode;},stats(){return {mode,active,meshes:originals.size,materials:cache.size,torches:torches.length,boardExcluded:true};}};
})();
