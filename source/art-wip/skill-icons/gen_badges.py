"""从 icons.py 的甲套图标生成 source/src/badges.js（美术部门 art-007）。python3 gen_badges.py <icons.py> <输出 js>"""
import sys, json, re
src = open(sys.argv[1]).read()
head = src[:src.index('with sync_playwright')]
head = head.replace('from playwright.sync_api import sync_playwright', '').replace('OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)', '')
ns = {}; exec(head, ns)
A2 = ns['A2']
icons = {k: v for k, v in A2.items() if k != 'atk2'}
atk = re.sub(r'<text.*?</text>', '', A2['atk2'])   # 「2」由画布用游戏字体写
js = '''// 棋子头上的攻击字牌、技能牌和冷却（美术部门 art-007；Ham 10-18 审批台第 5 版通过「整合」）
// 图标由 art-wip/skill-icons/gen_badges.py 从 icons.py 的甲套（实心剪影）生成，别手改下面的 SVG
const Badges = (() => {
  const ICON = %s;
  const ATK = %s;
  const BG = { r: '#8e2418', b: '#141311' }, PAPER = '#f0e7d2';
  const W = { atk: 145, sq: 100 };
  const wrap = (w, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 100" width="${w * 1.92}" height="192">${inner}</svg>`;
  // 技能牌：倒角正方形，阵营底色、米白线和图标
  const sq = (icon, s) => wrap(100, `<rect x="2" y="2" width="96" height="96" rx="16" fill="${BG[s]}"/><rect x="9" y="9" width="82" height="82" rx="10" fill="none" stroke="${PAPER}" stroke-width="3"/><g transform="translate(17 17) scale(.66)" fill="${PAPER}" stroke="${PAPER}">${icon}</g>`);
  // 激活牌（拒马架起来时）：反色，米白底、阵营色图标和粗框
  const on = (icon, s) => wrap(100, `<rect x="2" y="2" width="96" height="96" rx="16" fill="${BG[s]}"/><rect x="8" y="8" width="84" height="84" rx="11" fill="${PAPER}"/><g transform="translate(15 15) scale(.7)" fill="${BG[s]}" stroke="${BG[s]}">${icon}</g>`);
  // 攻击字牌：横长倒角长方形，剑在左，「2」在右（Ham 10-18：比技能牌长、2 大、和剑拉开）
  const atk = s => wrap(145, `<rect x="2" y="2" width="141" height="96" rx="16" fill="${BG[s]}"/><rect x="9" y="9" width="127" height="82" rx="10" fill="none" stroke="${PAPER}" stroke-width="3"/><g transform="translate(22 15) scale(.7)" fill="${PAPER}" stroke="${PAPER}">${ATK}</g>`);
  const imgs = new Map(), texs = new Map();
  function img(key, s) {
    const k = key + '_' + s; let im = imgs.get(k); if (im) return im;
    const [base, kind] = key === 'atk' ? ['atk', 'atk'] : key.endsWith('On') ? [key.slice(0, -2), 'on'] : [key, 'sq'];
    const svg = kind === 'atk' ? atk(s) : (kind === 'on' ? on : sq)(ICON[base] || '', s);
    im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); imgs.set(k, im); return im;
  }
  // 攻击字牌的「2」用粗宋（EB，和界面大字同一种）
  // key：'atk'、技能名（'juma'）、技能名 + 'On'（激活牌）；f：冷却走完的比例 0～1，1 = 好了
  //   冷却中：整块半透明，走完的那一块（从十二点顺时针）是实的（Ham 10-18：不变暗、不写数字）
  function texture(key, s, ak, f = 1) {
    const q = Math.max(0, Math.min(20, Math.round(f * 20))), k = key + '_' + s + '_' + (ak || '') + '_' + q;
    let t = texs.get(k); if (t) return t;
    const w = key === 'atk' ? W.atk : W.sq, c = document.createElement('canvas'); c.width = Math.round(w * 1.92); c.height = 192;
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; texs.set(k, t);
    const im = img(key, s), draw = () => {
      const g = c.getContext('2d'), fr = q / 20;
      const face = () => { g.drawImage(im, 0, 0, c.width, 192); if (key === 'atk') { g.fillStyle = PAPER; g.font = '900 124px "EB","Noto Serif SC","Songti SC",serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(String(ak || 2), 177, 145); } };
      g.clearRect(0, 0, c.width, 192);
      if (fr >= 1) face();
      else { g.globalAlpha = 0.38; face(); g.globalAlpha = 1; g.save(); g.beginPath(); g.moveTo(c.width / 2, 96); g.arc(c.width / 2, 96, 220, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); g.closePath(); g.clip(); face(); g.restore(); }
      t.needsUpdate = true;
    };
    if (im.complete && im.naturalWidth) draw(); else im.addEventListener('load', draw, { once: true });
    return t;
  }
  return { texture, aspect: key => (key === 'atk' ? W.atk : W.sq) / 100 };
})();
''' % (json.dumps(icons, ensure_ascii=False, indent=0).replace('\n', ' '), json.dumps(atk, ensure_ascii=False))
open(sys.argv[2], 'w').write(js)
print('ok', len(js))
