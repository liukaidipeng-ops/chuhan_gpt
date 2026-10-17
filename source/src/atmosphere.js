// 大气（画面优化 A1）：河两岸的流动薄雾。
// 只加四张半透明的片，没有灯、没有后期：手机上每帧多画四个小方块，脚本里只有四个数字在走。
// 低画质（Core.quality === 'low'）不建；雾不进棋盘范围（|x| < 5.3），所以「楚河 漢界」四个字不受影响。
// 速度、浓度见下面的 LAYERS，要调只改这里。
const Atmosphere = (() => {
  if (typeof Core === 'undefined' || Core.quality === 'low') return { on: false };
  // 一条横向可以无缝拼接的薄雾带：很多条又长又扁的柔边椭圆，两端各多画一份，保证左右边缘接得上
  const wisp = Core.canvasTex(1024, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const rnd = Core.rnd;
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w, y = h * (0.28 + rnd() * 0.44), rw = 50 + rnd() * 150, rh = 5 + rnd() * 15, a = 0.10 + rnd() * 0.16;
      for (const dx of [-w, 0, w]) {
        g.save(); g.translate(x + dx, y); g.scale(1, rh / rw);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, rw);
        gr.addColorStop(0, `rgba(255,252,244,${a})`); gr.addColorStop(0.55, `rgba(255,252,244,${a * 0.45})`); gr.addColorStop(1, 'rgba(255,252,244,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rw, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
  });
  wisp.wrapS = THREE.RepeatWrapping; wisp.wrapT = THREE.ClampToEdgeWrapping;

  // x 向外飘（河水往外流），两层速度、高度、浓度不一样，错开看有层次。
  // op 是乘在贴图透明度上的倍数（贴图本身很淡，单个雾团最多 0.4 左右），可以大于 1，出来的透明度最多 1
  const LAYERS = [
    { y: 0.08, w: 38, d: 2.7, op: 2.0, rep: 3, speed: 0.024 },
    { y: 0.30, w: 34, d: 3.6, op: 1.4, rep: 2, speed: 0.030 },
  ];
  const group = new THREE.Group(); group.name = 'atmosphere';
  const mats = [];
  for (const L of LAYERS) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: wisp }, off: { value: Core.rnd() }, rep: { value: L.rep }, op: { value: L.op }, col: { value: new THREE.Color(0xf3ecdc) } },
      vertexShader: 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D map; uniform float off, rep, op; uniform vec3 col; varying vec2 vUv;
        void main(){
          float a = texture2D(map, vec2(vUv.x * rep + off, vUv.y)).a;
          a *= smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x) * op;
          gl_FragColor = vec4(col, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, fog: false,
    });
    mats.push({ mat, L });
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(L.w, L.d), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(s * (5.3 + L.w / 2), L.y, 0);
      if (s < 0) m.rotation.z = Math.PI;   // 左边这张翻过来，贴图方向跟着翻，雾也是往外飘
      m.renderOrder = 3; m.frustumCulled = true;
      group.add(m);
    }
  }
  Core.scene.add(group);
  // 偏移减小 = 图案往 u 增大的方向走（离开棋盘）
  Core.onFrame(dt => { for (const { mat, L } of mats) mat.uniforms.off.value = (mat.uniforms.off.value - dt * L.speed) % 1000; });
  return { on: true, group, mats };
})();
