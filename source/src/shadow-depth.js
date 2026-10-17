// User-selected A: deepen partial occlusion by one small step; keep its kernel.
const ShadowDepth = (() => {
  const value = new Float32Array([1.15, 0]);
  for (const shader of Object.values(THREE.ShaderLib)) shader.uniforms.xqShadowDepth = {value};
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;
  const marker = ') / 16.0;';
  if (chunk.split(marker).length !== 2) throw new Error('Unexpected soft-shadow filter');
  THREE.ShaderChunk.shadowmap_pars_fragment = chunk
    .replace('uniform vec3 xqShadowCamera;', 'uniform vec2 xqShadowDepth;\n  uniform vec3 xqShadowCamera;')
    .replace(marker, marker + '\n        shadow = clamp(1.0 - (1.0 - shadow) * xqShadowDepth.x, 0.0, 1.0);');
  function set(strength) { value[0] = Math.max(1, Math.min(1.15, strength)); Core.poke(1500); }
  const select = SoftShadows.set;
  SoftShadows.set = v => { set(v === 'A' ? 1.15 : 1); select(v); };
  set(SoftShadows.mode === 'A' ? 1.15 : 1);
  return {set,get strength(){return value[0];},original:1,deeper:1.15};
})();
window.ShadowDepth = ShadowDepth;
