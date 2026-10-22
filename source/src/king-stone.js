// GPT G2 — approved 01 R4. Only skill-mode, face-up kings use these materials.
// Baked textures preserve the approved pixels; no runtime procedural generation.
const KingStone = (() => {
  const source = window.KING_STONE_ASSETS;
  const textures = new Map(), materials = new Map(), originals = new WeakMap();
  let state = 'idle', pending = null, environment = null;

  function wallMapping(mat, offset, height) {
    mat.userData.kingStoneWall = { offset, height };
    mat.onBeforeCompile = shader => {
      let code = `vec2 kingWallUV=vec2(uv.x,(position.y+${offset.toFixed(8)})/${height.toFixed(8)});\n`;
      for (const [define, uv] of [['USE_MAP','vMapUv'], ['USE_NORMALMAP','vNormalMapUv'], ['USE_AOMAP','vAoMapUv'], ['USE_METALNESSMAP','vMetalnessMapUv'], ['USE_ROUGHNESSMAP','vRoughnessMapUv']]) {
        code += `#ifdef ${define}\n${uv}=kingWallUV;\n#endif\n`;
      }
      shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n' + code);
    };
    mat.customProgramCacheKey = () => `king-stone-r4-wall/${offset}/${height}`;
  }
  // Board's legal-move ghosts clone their materials. Preserve physical-height UVs
  // on those clones too; Material.copy alone does not retain onBeforeCompile.
  class StoneMaterial extends THREE.MeshPhysicalMaterial {
    copy(other) {
      super.copy(other);
      const wall = other.userData.kingStoneWall;
      if (wall) wallMapping(this, wall.offset, wall.height);
      return this;
    }
  }
  function load() {
    if (pending || state === 'failed' || !source) return pending;
    state = 'loading';
    const loader = new THREE.TextureLoader(), loading = [];
    for (const side of ['r','b']) for (const kind of ['body','face']) for (const channel of ['color','normal','orm']) {
      const key = `${side}-${kind}-${channel}`;
      loading.push(new Promise((resolve, reject) => {
        const texture = loader.load(`${source.base}${key}.png?v=${source.version}`, () => resolve(texture), undefined, reject);
        texture.colorSpace = channel === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(8, Core.renderer.capabilities.getMaxAnisotropy());
        if (kind === 'body') texture.wrapS = THREE.RepeatWrapping;
        texture.userData.keep = true;
        textures.set(key, texture);
      }));
    }
    pending = Promise.all(loading).then(() => {
      state = 'ready';
      // Do not decorate a retired scene or a normal game after a delayed load.
      const game = Board.lastGame;
      if (game && game.bf) { Board.decorateAll(game); Core.poke(1500); }
      return true;
    }).catch(() => {
      state = 'failed';
      for (const texture of textures.values()) texture.dispose();
      textures.clear();
      console.warn('KingStone: textures unavailable; retaining the original king appearance.');
      return false;
    });
    return pending;
  }
  function setEnvironment(value) {
    if (environment === value) return;
    environment = value;
    for (const set of materials.values()) for (const mat of Object.values(set)) {
      mat.envMap = value; mat.needsUpdate = true;
    }
  }
  function get(side, mesh) {
    if (materials.has(side)) return materials.get(side);
    const make = kind => {
      const key = `${side}-${kind}-`, orm = textures.get(key + 'orm');
      const mat = new StoneMaterial({
        color: 0xffffff, map: textures.get(key + 'color'), normalMap: textures.get(key + 'normal'),
        metalnessMap: orm, roughnessMap: orm, aoMap: orm, metalness: 1, roughness: 1,
        normalScale: new THREE.Vector2(1,1), clearcoat: .035, clearcoatRoughness: .4,
        specularIntensity: .45, envMap: environment, envMapIntensity: kind === 'face' ? 1.05 : .8,
        ...(kind === 'face' ? { transparent: true, polygonOffset: true, polygonOffsetFactor: -2 } : {})
      });
      mat.userData.keep = true; mat.userData.kingStone = { side, kind, revision: '01-R4' };
      return mat;
    };
    const body = make('body'), face = make('face'), band = body.clone();
    const height = Math.max(...mesh.children[0].geometry.parameters.points.map(p => p.y));
    wallMapping(body, 0, height); wallMapping(band, mesh.children[2].position.y, height);
    const set = { body, face, band }; materials.set(side, set); return set;
  }
  function restore(mesh) {
    const old = originals.get(mesh); if (!old) return;
    for (let i = 0; i < 3; i++) mesh.children[i].material = old[i];
    originals.delete(mesh); delete mesh.userData.kingStone;
  }
  function apply(mesh, piece, skillMode, dim, envMap) {
    // Both the caller and this entry enforce scope. No URL/storage override.
    if (!skillMode || !piece || piece.t !== 'k' || piece.h) { restore(mesh); return false; }
    if (state !== 'ready') { load(); return false; }
    setEnvironment(envMap || null);
    if (!originals.has(mesh)) originals.set(mesh, mesh.children.slice(0,3).map(c => c.material));
    const set = get(piece.s, mesh);
    set.face.color.set(dim ? 0x8f8a84 : 0xffffff);
    mesh.children[0].material = set.body; mesh.children[1].material = set.face; mesh.children[2].material = set.band;
    mesh.userData.kingStone = '01-R4';
    return true;
  }
  // 提前下载（Ham 10-22：开局时将帅还是木头，过一会儿才变）：选了技能模式、开局、或老玩家进页面空闲时就叫一声；重复调用无害
  const warm = () => { try { load(); } catch (e) { } };
  return { apply, restore, setEnvironment, warm, get state() { return state; } };
})();
