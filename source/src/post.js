// 后期（画面优化 B）：移轴虚化 tilt-shift，「画面设置」里的开关，默认关（泛光 bloom 试过，不要了）。
// 关着时 Core.post.active() 为 false，core.js 照旧直接画到屏幕，和没有这个文件时完全一样（零开销）。
// 打开后：场景先画进一张离屏图，再用一个全屏三角形合成。
//   移轴：合成时按离画面中线的距离，用 12 个采样点做圆盘模糊；中间一条清晰，上下渐虚，棋盘像沙盘模型。
// 调参数只改下面 TILT。
const Post = (() => {
  if (typeof Core === 'undefined') return { on: false };
  const TILT = { focus: 0.5, band: 0.16, max: 6.0 };   // focus：清晰带中线（屏幕高度的几分之几，0 在下）；band：半宽；max：最虚处模糊半径（像素，按 1080 高度折算）
  const R = Core.renderer, gl = R.getContext();
  const opt = { tilt: false };
  let rtS = null, W = 0, H = 0, broken = false;
  const hf = (() => { try { return R.capabilities.isWebGL2 && (R.extensions.has('EXT_color_buffer_float') || R.extensions.has('EXT_color_buffer_half_float')); } catch (e) { return false; } })();

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const VS = 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const mk = (fs, uniforms, tm) => new THREE.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: fs, depthTest: false, depthWrite: false, toneMapped: !!tm && !hf, fog: false, defines: { DECODE: hf ? 1 : 0 } });
  const quadScene = new THREE.Scene(), quad = new THREE.Mesh(tri, null); quad.frustumCulled = false; quadScene.add(quad);

  const matComp = mk(`uniform sampler2D scene; uniform float tiltOn, focus, band, maxR; uniform vec2 px; varying vec2 vUv;
    void main(){
      vec3 c;
      float t = tiltOn > 0.5 ? smoothstep(band, band + 0.28, abs(vUv.y - focus)) : 0.0;
      if (t > 0.002) {
        float r = maxR * t; c = texture2D(scene, vUv).rgb; float n = 1.0;
        for (int i = 0; i < 12; i++) { float a = float(i) * 2.399963; float d = sqrt((float(i) + 0.5) / 12.0);
          vec2 o = vec2(cos(a), sin(a)) * d * r * px; c += texture2D(scene, vUv + o).rgb; n += 1.0; }
        c /= n;
      } else c = texture2D(scene, vUv).rgb;
      gl_FragColor = vec4(c, 1.0);
      #if DECODE == 0
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #endif
    }`, { scene: { value: null }, tiltOn: { value: 0 }, focus: { value: TILT.focus }, band: { value: TILT.band }, maxR: { value: TILT.max }, px: { value: new THREE.Vector2() } }, true);

  const mkRT = (w, h, ms) => { const t = new THREE.WebGLRenderTarget(w, h, { type: hf ? THREE.HalfFloatType : THREE.UnsignedByteType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: !!ms, samples: ms ? (Core.quality === 'low' ? 0 : 4) : 0 }); t.texture.generateMipmaps = false;
    // 场景那张图：骗过 three（它对非 XR 的离屏图一律输出线性、不做色调映射），让着色器像画屏幕一样做 ACES + sRGB，
    //   这样半透明的光晕、烟雾叠出来和不开后期时一样；存下来的已经是成品色，合成时不再做色调映射、不再转色彩空间
    if (ms && hf) { t.isXRRenderTarget = true; t.texture.colorSpace = THREE.SRGBColorSpace; }
    return t; };
  function alloc() {
    const v = R.getDrawingBufferSize(new THREE.Vector2()), w = v.x | 0, h = v.y | 0;
    if (rtS && w === W && h === H) return;
    if (rtS) rtS.dispose();
    W = w; H = h; rtS = mkRT(w, h, true);
  }
  function pass(mat, target) { quad.material = mat; R.setRenderTarget(target); R.render(quadScene, cam); }

  function render(scene, camera) {
    alloc();
    R.setRenderTarget(rtS); R.clear(); R.render(scene, camera);
    const u = matComp.uniforms;
    u.scene.value = rtS.texture; u.tiltOn.value = opt.tilt ? 1 : 0;
    u.px.value.set(1 / W, 1 / H).multiplyScalar(H / 1080);
    pass(matComp, null);
  }

  const post = {
    on: true, hf,
    active() { return !broken && opt.tilt; },
    set(o) { if ('tilt' in o) opt.tilt = !!o.tilt; },
    get opt() { return opt; },
        render(scene, camera) {
      try { render(scene, camera); }
      catch (e) { broken = true; try { R.setRenderTarget(null); } catch (_) { } console.warn('post disabled', e); R.render(scene, camera); }
    },
  };
  Core.post = post;
  return post;
})();
