// PC mouse hover indicator C: segmented floor ring
// Opacity reduced by 30% from preview version.
const PieceHoverC = (() => {
  const OPACITY = 0.7;
  function create() {
    const group = new THREE.Group();
    group.name = 'piece-hover-c';
    group.visible = false;
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffe8c0,
      transparent: true,
      opacity: OPACITY,
      depthWrite: false,
      toneMapped: false
    });
    const geo = new THREE.RingGeometry(0.42, 0.46, 32, 1, 0, Math.PI * 1.6);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    group.add(mesh);
    return { group };
  }
  return { create };
})();
