"""技能图标三套方案（美术部门 art-007）：python3 icons.py <输出目录>
生成 sheet_<套>.html 并用 Chromium 截成 png。图标都画在 100×100 里，米白色，放在棋子正上方那种帽形牌上（汉朱 / 楚墨）。"""
import sys, os
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SK0 = [('juma','拒马','兵'),('shensu','神速营','兵'),('huifang','回防','兵'),('chongzhen','冲阵','车'),('taying','踏营','马'),('pili','霹雳','炮'),
      ('qishe','齐射','汉相'),('jianta','践踏','楚象'),('feiyue','飞越','相象'),('hujia','护驾','士'),('jinwei','铁甲禁卫','士')]
SK = SK0 + [('atk2', '攻击 2', '字牌')]
# 甲：实心剪影（粗、实，缩小后也认得）
A = {
 'juma': '<g stroke-width="9" stroke-linecap="butt"><line x1="10" y1="56" x2="90" y2="56"/><line x1="16" y1="82" x2="40" y2="22"/><line x1="40" y1="82" x2="16" y2="22"/><line x1="38" y1="82" x2="62" y2="22"/><line x1="62" y1="82" x2="38" y2="22"/><line x1="60" y1="82" x2="84" y2="22"/><line x1="84" y1="82" x2="60" y2="22"/></g>',
 'shensu': '<path d="M14 22 L42 50 L14 78 L28 78 L56 50 L28 22Z M44 22 L72 50 L44 78 L58 78 L86 50 L58 22Z" stroke="none"/>',
 'huifang': '<path d="M70 82 L70 44 A20 20 0 0 0 30 44 L30 58" fill="none" stroke-width="12"/><path d="M14 54 L30 80 L46 54Z" stroke="none"/>',
 'chongzhen': '<rect x="70" y="20" width="16" height="60" stroke="none"/><path d="M10 40 L44 40 L44 26 L66 50 L44 74 L44 60 L10 60Z" stroke="none"/>',
 'taying': '<path d="M26 84 L26 50 A24 26 0 1 1 74 50 L74 84 L60 84 L60 52 A10 12 0 1 0 40 52 L40 84Z" stroke="none"/><g stroke-width="5"><line x1="10" y1="94" x2="90" y2="94"/></g>',
 'pili': '<path d="M58 6 L22 56 L46 56 L36 94 L78 40 L54 40 L66 6Z" stroke="none"/>',
 'qishe': '<g stroke-width="7"><line x1="14" y1="86" x2="58" y2="42"/><line x1="34" y1="92" x2="78" y2="48"/><line x1="8" y1="66" x2="52" y2="22"/></g><path d="M50 14 L70 14 L64 34Z M70 40 L90 40 L84 60Z M56 34 L76 34 L70 54Z" stroke="none"/>',
 'jianta': '<ellipse cx="50" cy="54" rx="26" ry="22" stroke="none"/><g stroke-width="6" fill="none"><path d="M14 34 A40 40 0 0 0 14 74"/><path d="M86 34 A40 40 0 0 1 86 74"/></g>',
 'feiyue': '<circle cx="50" cy="74" r="12" stroke="none"/><path d="M12 80 Q50 -4 84 70" fill="none" stroke-width="8"/><path d="M74 62 L92 82 L94 56Z" stroke="none"/>',
 'hujia': '<path d="M50 8 L86 22 L82 56 Q74 80 50 94 Q26 80 18 56 L14 22Z" stroke="none"/>',
 'jinwei': '<path d="M16 64 Q16 18 50 14 Q84 18 84 64 L84 86 L66 86 L66 62 L34 62 L34 86 L16 86Z" stroke="none"/><rect x="46" y="4" width="8" height="14" stroke="none"/>',
}
# 乙：线描（同样的物件，细线、多一点细节）
B = {
 'juma': '<g stroke-width="4"><line x1="8" y1="56" x2="92" y2="56"/><line x1="8" y1="62" x2="92" y2="62"/>' + ''.join(f'<path d="M{x-14} 84 L{x+12} 18 M{x+14} 84 L{x-12} 18"/><path d="M{x+12} 18 l-1 9 M{x+12} 18 l-7 5 M{x-12} 18 l1 9 M{x-12} 18 l7 5"/>' for x in (24, 50, 76)) + '</g>',
 'shensu': '<g stroke-width="4" fill="none"><path d="M18 26 L44 50 L18 74"/><path d="M42 26 L68 50 L42 74"/><path d="M66 26 L92 50 L66 74"/><line x1="4" y1="38" x2="16" y2="38"/><line x1="4" y1="62" x2="16" y2="62"/></g>',
 'huifang': '<g stroke-width="4" fill="none"><path d="M72 86 L72 42 A22 22 0 0 0 28 42 L28 62"/><path d="M16 52 L28 76 L40 52"/><circle cx="72" cy="86" r="5"/></g>',
 'chongzhen': '<g stroke-width="4" fill="none"><rect x="72" y="18" width="14" height="64"/><line x1="72" y1="34" x2="86" y2="34"/><line x1="72" y1="50" x2="86" y2="50"/><line x1="72" y1="66" x2="86" y2="66"/><path d="M8 42 L44 42 L44 28 L66 50 L44 72 L44 58 L8 58Z"/></g>',
 'taying': '<g stroke-width="4" fill="none"><path d="M26 86 L26 50 A24 26 0 1 1 74 50 L74 86 L60 86 L60 52 A10 12 0 1 0 40 52 L40 86Z"/><circle cx="33" cy="72" r="2.5"/><circle cx="67" cy="72" r="2.5"/><circle cx="31" cy="44" r="2.5"/><circle cx="69" cy="44" r="2.5"/></g>',
 'pili': '<g stroke-width="4" fill="none"><path d="M58 6 L22 56 L46 56 L36 94 L78 40 L54 40 L66 6Z"/><line x1="84" y1="18" x2="94" y2="10"/><line x1="10" y1="80" x2="20" y2="72"/></g>',
 'qishe': '<g stroke-width="4" fill="none">' + ''.join(f'<line x1="{x}" y1="{y}" x2="{x+44}" y2="{y-44}"/><path d="M{x+44} {y-44} l-14 2 M{x+44} {y-44} l-2 14"/>' for x, y in ((12, 70), (26, 88), (40, 98))) + '</g>',
 'jianta': '<g stroke-width="4" fill="none"><ellipse cx="50" cy="54" rx="26" ry="22"/><path d="M34 40 l4 6 M50 36 l0 7 M66 40 l-4 6"/><path d="M14 34 A40 40 0 0 0 14 74"/><path d="M86 34 A40 40 0 0 1 86 74"/><path d="M6 40 A48 48 0 0 0 6 68"/><path d="M94 40 A48 48 0 0 1 94 68"/></g>',
 'feiyue': '<g stroke-width="4" fill="none"><circle cx="50" cy="74" r="12"/><path d="M12 82 Q50 -4 84 70" stroke-dasharray="8 6"/><path d="M74 62 L90 80 L92 58Z"/></g>',
 'hujia': '<g stroke-width="4" fill="none"><path d="M50 8 L86 22 L82 56 Q74 80 50 94 Q26 80 18 56 L14 22Z"/><path d="M50 22 L50 80 M30 44 L70 44"/></g>',
 'jinwei': '<g stroke-width="4" fill="none"><path d="M16 64 Q16 18 50 14 Q84 18 84 64 L84 86 L66 86 L66 62 L34 62 L34 86 L16 86Z"/><line x1="50" y1="14" x2="50" y2="62"/><line x1="46" y1="4" x2="54" y2="4"/><line x1="50" y1="4" x2="50" y2="14"/></g>',
}
# 丙：走法符号（棋盘格点 + 箭头，画的是技能怎么走、打哪里）
def grid(n=3, s=30, o=20):
  pts = ''.join(f'<circle cx="{o+i*s}" cy="{o+j*s}" r="2.6" stroke="none" opacity=".45"/>' for i in range(n) for j in range(n))
  return pts
ARW = lambda x, y, a: f'<path transform="translate({x} {y}) rotate({a})" d="M0 0 L-12 -7 L-12 7Z" stroke="none"/>'
C = {
 'juma': grid() + '<circle cx="50" cy="50" r="10" stroke="none"/><g stroke-width="5"><line x1="50" y1="34" x2="50" y2="22"/><line x1="50" y1="66" x2="50" y2="78"/><line x1="34" y1="50" x2="22" y2="50"/><line x1="66" y1="50" x2="78" y2="50"/></g>',
 'shensu': grid() + '<circle cx="50" cy="50" r="9" stroke="none"/><g stroke-width="4">' + ''.join(f'<line x1="50" y1="50" x2="{50+34*dx}" y2="{50+34*dy}"/>' for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(.75,.75),(-.75,.75),(.75,-.75),(-.75,-.75))) + '</g>',
 'huifang': grid() + '<circle cx="50" cy="20" r="9" stroke="none"/><line x1="50" y1="30" x2="50" y2="70" stroke-width="5"/>' + ARW(50, 82, 90),
 'chongzhen': grid() + '<circle cx="20" cy="50" r="9" stroke="none"/><circle cx="50" cy="50" r="9" fill="none" stroke-width="4"/><path d="M28 46 Q50 18 74 46" fill="none" stroke-width="5"/>' + ARW(80, 50, 60),
 'taying': grid() + '<circle cx="20" cy="80" r="9" stroke="none"/><path d="M44 74 L56 86 M56 74 L44 86" stroke-width="4"/><path d="M20 70 L20 20 L46 20" fill="none" stroke-width="5"/>' + ARW(52, 20, 0),
 'pili': grid() + '<circle cx="50" cy="50" r="11" stroke="none"/>' + ''.join(f'<path d="M{x-7} {y-7} L{x+7} {y+7} M{x+7} {y-7} L{x-7} {y+7}" stroke-width="4"/>' for x, y in ((50, 20), (50, 80), (20, 50), (80, 50))),
 'qishe': grid() + '<circle cx="20" cy="80" r="9" stroke="none"/><line x1="28" y1="72" x2="70" y2="30" stroke-width="5" stroke-dasharray="7 6"/>' + ARW(78, 22, -45) + '<circle cx="80" cy="20" r="0"/>',
 'jianta': grid() + '<circle cx="50" cy="50" r="12" stroke="none"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="none" stroke-width="4"/>' for x in (20, 50, 80) for y in (20, 50, 80) if (x, y) != (50, 50)),
 'feiyue': grid() + '<circle cx="20" cy="80" r="9" stroke="none"/><circle cx="50" cy="50" r="7" fill="none" stroke-width="4"/><path d="M44 44 L56 56 M56 44 L44 56" stroke-width="3"/><path d="M24 70 Q30 26 72 26" fill="none" stroke-width="5"/>' + ARW(80, 24, -8),
 'hujia': grid() + '<circle cx="20" cy="80" r="9" stroke="none"/><rect x="70" y="10" width="20" height="20" stroke="none"/><path d="M28 70 Q34 32 66 26" fill="none" stroke-width="4"/><path d="M72 36 Q66 74 30 82" fill="none" stroke-width="4"/>',
 'jinwei': '<rect x="16" y="16" width="68" height="68" fill="none" stroke-width="4"/><path d="M16 16 L84 84 M84 16 L16 84" stroke-width="2.5" opacity=".6"/><circle cx="50" cy="50" r="11" stroke="none"/>' + ''.join(f'<line x1="50" y1="50" x2="{50+22*dx}" y2="{50+22*dy}" stroke-width="4"/>' for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))),
}
def wheel(cx, cy, r, op=1, w=7):
  sp = ''.join(f'<line x1="{cx}" y1="{cy}" x2="{cx + r * __import__("math").cos(a * 3.14159 / 4):.1f}" y2="{cy + r * __import__("math").sin(a * 3.14159 / 4):.1f}" stroke-width="{w * .6}"/>' for a in range(8))
  return f'<g opacity="{op}"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke-width="{w}"/>{sp}<circle cx="{cx}" cy="{cy}" r="{r * .28}" stroke="none"/></g>'
A2 = dict(A)
A2['chongzhen'] = wheel(32, 52, 22, .22, 6) + wheel(46, 52, 25, .45, 6) + wheel(66, 52, 28, 1, 8) + '<g stroke-width="4" opacity=".5"><line x1="4" y1="40" x2="16" y2="40"/><line x1="2" y1="64" x2="14" y2="64"/></g>'
A2['jianta'] = ('<defs><mask id="lg"><rect width="100" height="100" fill="#fff"/>'
                '<path d="M34 34 Q50 39 66 34 M33 50 Q50 55 67 50 M33 64 Q50 69 67 64" stroke="#000" stroke-width="3.5" fill="none"/></mask></defs>'
                '<path mask="url(#lg)" d="M34 4 L66 4 Q70 40 70 62 Q72 76 82 82 Q86 88 80 90 L20 90 Q14 88 18 82 Q28 76 30 62 Q30 40 34 4Z" stroke="none"/>'
                '<g stroke="none"><ellipse cx="30" cy="91" rx="8" ry="5"/><ellipse cx="50" cy="92" rx="8" ry="5"/><ellipse cx="70" cy="91" rx="8" ry="5"/></g>'
                '<g stroke-width="5" fill="none" opacity=".7"><path d="M4 98 L12 88"/><path d="M96 98 L88 88"/></g>')
A2['qishe'] = ''.join(f'<line x1="{x}" y1="{y}" x2="{x + 46}" y2="{y - 46}" stroke-width="6"/><path transform="translate({x + 50} {y - 50}) rotate(-45)" d="M0 0 L-16 -9 L-16 9Z" stroke="none"/>' for x, y in ((6, 66), (22, 82), (38, 98)))
A2['atk2'] = ('<path d="M34 6 L40 16 L40 62 L28 62 L28 16Z" stroke="none"/><rect x="18" y="62" width="32" height="7" stroke="none"/><rect x="30" y="69" width="8" height="16" stroke="none"/><circle cx="34" cy="90" r="6" stroke="none"/>'
              '<text x="74" y="78" font-size="62" font-weight="900" text-anchor="middle" font-family="serif" stroke="none">2</text>')
SETS = [('A2', '甲 · 实心剪影 · 第 2 版（倒角正方形）', A2)]
TAB = lambda bg, h: f'<svg viewBox="0 0 100 100" height="{h}"><rect x="2" y="2" width="96" height="96" rx="16" fill="{bg}"/><rect x="9" y="9" width="82" height="82" rx="10" fill="none" stroke="#f0e7d2" stroke-width="3"/>'
def tab(icon, bg, h): return TAB(bg, h) + f'<g transform="translate(17 17) scale(.66)" fill="#f0e7d2" stroke="#f0e7d2">{icon}</g></svg>'
CSS = '''body{margin:0;background:#efe6d2;font-family:"WenQuanYi Zen Hei",sans-serif;color:#141311}
h1{margin:0;padding:20px 28px;background:#141311;color:#f0e7d2;font-size:34px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:20px;box-sizing:border-box;width:1300px}
*{box-sizing:border-box}
.c{background:#d9b98a url();border:2px solid #141311;padding:12px 10px;text-align:center}
.n{font-size:24px;font-weight:bold}.u{font-size:16px;opacity:.7;margin-left:6px}
.t{display:flex;justify-content:center;gap:10px;margin:10px 0}.s{display:flex;justify-content:center;gap:8px;align-items:flex-end;background:#c8a26c;padding:8px}
.s small{font-size:13px;opacity:.75;align-self:center}'''
with sync_playwright() as p:
  br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
  for key, name, S in SETS:
    cells = ''.join(f'<div class="c"><div><span class="n">{cn}</span><span class="u">{who}</span></div><div class="t">{tab(S[k], "#8e2418", 96)}{tab(S[k], "#141311", 96)}</div><div class="s"><small>实际大小≈</small>{tab(S[k], "#8e2418", 22)}{tab(S[k], "#141311", 22)}</div></div>' for k, cn, who in SK)
    html = f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body><h1>技能图标 · 方案{name}（效果图）</h1><div class="g">{cells}</div></body></html>'
    open(f'{OUT}/sheet_{key}.html', 'w').write(html)
    pg = br.new_page(viewport={'width': 1300, 'height': 900}, device_scale_factor=1.5)
    pg.set_content(html); pg.screenshot(path=f'{OUT}/sheet_{key}.png', full_page=True); pg.close()
  # 每个图标单独出一张 192px 的牌（汉朱、楚墨），再打成 badges.js 给原型用
  import base64, json
  os.makedirs(f'{OUT}/badges', exist_ok=True); data = {}
  pg = br.new_page(viewport={'width': 200, 'height': 200})
  for k, icon in A2.items():
    for sd, bg in (('r', '#8e2418'), ('b', '#141311')):
      pg.set_content(f'<html><body style="margin:0;background:transparent">{tab(icon, bg, 192)}</body></html>')
      fn = f'{OUT}/badges/{k}_{sd}.png'; pg.locator('svg').screenshot(path=fn, omit_background=True)
      data[k + '_' + sd] = 'data:image/png;base64,' + base64.b64encode(open(fn, 'rb').read()).decode()
  open(f'{OUT}/badges.js', 'w').write('window.ART_BADGES=' + json.dumps(data) + ';')
  br.close()
print('ok')
