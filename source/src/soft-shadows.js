// Isolated approval preview. Inject after core; do not overwrite published modules.
// Real directional depth shadows: deterministic blocker search + bilinear PCF.
// No screen blur, AO, extra light, geometry, texture, exposure or camera changes.
const SoftShadows = (() => {
  const presets = {
    A: { name: '自然柔和', spread: 0.085 },
    B: { name: '柔和电影感', spread: 0.28 },
    baseline: { name: '原阴影', spread: -1 },
  };
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;
  const start = chunk.indexOf('#elif defined( SHADOWMAP_TYPE_PCF_SOFT )');
  const end = chunk.indexOf('#elif defined( SHADOWMAP_TYPE_VSM )', start);
  if (start < 0 || end < 0) throw new Error('Unsupported shadow shader');
  const original = chunk.slice(start, end).replace('#elif defined( SHADOWMAP_TYPE_PCF_SOFT )', '');
  // r158 cloneUniforms retains typed arrays by reference: every built-in lit
  // material (including later night variants) reads this one live camera value.
  const shadowCamera = new Float32Array(3);
  for (const shader of Object.values(THREE.ShaderLib)) shader.uniforms.xqShadowCamera = {value:shadowCamera};
  const disk = Array.from({length: 16}, (_, i) => {
    const a = i * 2.399963229728653, r = Math.sqrt((i + 0.5) / 16);
    return `vec2(${(Math.cos(a)*r).toFixed(7)}, ${(Math.sin(a)*r).toFixed(7)})`;
  });
  const blockers = disk.filter((_, i) => i % 4 !== 3).map(p => `{
    float d = unpackRGBAToDepth(texture2D(shadowMap, shadowCoord.xy + ${p} * searchUV));
    if (d < shadowCoord.z) { blockerSum += d; blockerN += 1.0; }
  }`).join('\n');
  const samples = disk.map(p => `xqShadowBilinear(shadowMap, shadowMapSize, shadowCoord.xy + ${p} * radiusUV, shadowCoord.z)`).join(' +\n');
  const helper = `
  uniform vec3 xqShadowCamera; // orthographic width, height, far - near
  float xqShadowBilinear(sampler2D map, vec2 size, vec2 uv, float z) {
    vec2 f = fract(uv * size - 0.5);
    vec2 p = (floor(uv * size - 0.5) + 0.5) / size;
    vec2 px = 1.0 / size;
    return mix(mix(texture2DCompare(map,p,z), texture2DCompare(map,p+vec2(px.x,0.0),z),f.x),
               mix(texture2DCompare(map,p+vec2(0.0,px.y),z), texture2DCompare(map,p+px,z),f.x),f.y);
  }
  `;
  const filter = `#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
    if (shadowRadius < 0.0) { ${original} } else {
      vec2 texel = 1.0 / shadowMapSize;
      vec2 searchUV = max(2.0 * texel, shadowRadius * 0.7 / xqShadowCamera.xy);
      float blockerSum = 0.0, blockerN = 0.0;
      ${blockers}
      if (blockerN > 0.0) {
        float gap = max(0.0, (shadowCoord.z - blockerSum / blockerN) * xqShadowCamera.z);
        // Penumbra grows with blocker/receiver distance; contact remains narrow.
        vec2 radiusUV = clamp(gap * shadowRadius / xqShadowCamera.xy, 0.75 * texel, shadowRadius * 1.4 / xqShadowCamera.xy);
        shadow = (${samples}) / 16.0;
      }
    }
  `;
  THREE.ShaderChunk.shadowmap_pars_fragment = (chunk.slice(0,start) + filter + chunk.slice(end))
    .replace('float getShadow(', helper + '\nfloat getShadow(');
  let mode = 'A';
  const originalFlags = new Map();
  function sync() {
    const c = Core.sun.shadow.camera;
    shadowCamera[0] = Math.max(1e-6, (c.right-c.left)/c.zoom);
    shadowCamera[1] = Math.max(1e-6, (c.top-c.bottom)/c.zoom);
    shadowCamera[2] = Math.max(1e-6, c.far-c.near);
    for (const root of Core.scene.children) {
      if (!root.userData.environmentExcluded) continue;
      root.traverse(o => {
        const m = o.material;
        // Run after model fusion; never revive hidden bone meshes or ink outlines.
        if (!o.isMesh || o.layers.mask !== 1 || !m || Array.isArray(m) || m.side === THREE.BackSide || m.transparent
            || !(m.isMeshToonMaterial || m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) return;
        if (!originalFlags.has(o)) originalFlags.set(o, {cast:o.castShadow, receive:o.receiveShadow});
        const prev = originalFlags.get(o), enabled = mode !== 'baseline' && Core.quality !== 'low';
        o.receiveShadow = enabled || prev.receive;
        // Playable ordinary instanced soldiers need no custom deformation depth shader.
        // Preserve aKind batches unless their existing matching depth material is present.
        o.castShadow = prev.cast || (enabled && o.isInstancedMesh && (!o.geometry.attributes.aKind || !!o.customDepthMaterial));
      });
    }
    // Drop disposed model references after rebuild/restart (keep local transforms unchanged).
    for (const o of originalFlags.keys()) { let p=o; while(p.parent)p=p.parent; if(p!==Core.scene)originalFlags.delete(o); }
  }
  const before = Core.scene.onBeforeRender;
  Core.scene.onBeforeRender = function(...args) { if(before)before.apply(this,args);sync(); };
  function set(value) {
    if (!presets[value]) throw new Error('Unknown shadow preset');
    mode=value;Core.sun.shadow.radius=presets[value].spread;sync();
    Core.renderer.shadowMap.needsUpdate=true;Core.sun.shadow.needsUpdate=true;Core.poke(1500);
  }
  set(new URLSearchParams(location.search).get('shadow') || 'A');
  return {set,sync,presets,get mode(){return mode;},stats(){return {mode,quality:Core.quality,tracked:originalFlags.size,
    modelReceivers:[...originalFlags].filter(([o,p])=>o.receiveShadow&&!p.receive).length,
    addedCasters:[...originalFlags].filter(([o,p])=>o.castShadow&&!p.cast).length,
    map:Core.sun.shadow.mapSize.toArray(),camera:Array.from(shadowCamera),bias:Core.sun.shadow.bias,normalBias:Core.sun.shadow.normalBias,
    blockerTaps:12,filterTaps:16,bilinearDepthReads:64,extraRenderTargets:0};}};
})();
window.ShadowPreview = SoftShadows; // Only the isolated review shell uses this.
